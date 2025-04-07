const express = require('express');
const router = express.Router();
const db = require('../db');


// Recupera tutti i match
router.get('/', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT mt.*, pt.name AS location ' +
            'FROM matches mt ' +
            'JOIN pitches pt ON mt.id_pitch = pt.id ' +
            'ORDER BY mt.id ASC;'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Recupera un match specifico per ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            'SELECT mt.*, pt.name AS location, pt.total_cost, pt.address, mt.payment_link ' +
            'FROM matches mt ' +
            'JOIN pitches pt ON mt.id_pitch = pt.id ' +
            'WHERE mt.id = $1;',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Match non trovato' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Inserimento di un nuovo match
router.put('/new-match', async (req, res) => {
    
    const { date, time, pitchId, cashierId, numberOfPlayers } = req.body;
    const client = await db.connect(); // Ottieni il client di connessione
    
    try {
        await client.query('BEGIN'); // Inizia la transazione

        

        // Esegui il primo INSERT nella tabella "matches"
        const match = await client.query(
            'INSERT INTO matches ' +
            '(date, time, id_pitch, id_cashier, players, pl_mov_tot, pl_gk_tot, pl_mov_avail, pl_gk_avail) ' +
            'VALUES ($1, $2, $3, $4, $5, $5 - 2, 2, $5 - 2, 2) ' +
            'RETURNING *;',
            [date, time, pitchId, cashierId, numberOfPlayers]
        );

        const matchId = match.rows[0].id;

        // Esegui il secondo SELECT per ottenere le informazioni di pagamento
        const paymentInfo = await client.query(
            'SELECT mt.players, us.satispay_uid, pt.total_cost ' +
            'FROM matches mt ' +
            'JOIN users us ON mt.id_cashier = us.id ' +
            'JOIN pitches pt ON mt.id_pitch = pt.id ' +
            'WHERE mt.id = $1;',
            [matchId]
        );

        if (paymentInfo.rows.length === 0) {
            throw new Error("Nessun risultato trovato"); // Trigger del rollback
        }

        const players = paymentInfo.rows[0].players;
        const satispayUID = paymentInfo.rows[0].satispay_uid;
        const totalCost = paymentInfo.rows[0].total_cost;
        const costEach = Math.ceil((totalCost / players) * 10) / 10;
        const genericLink = "https://www.satispay.com/app/match/link/user/S6Y-CON--";
        const paymentLink = `${genericLink}${satispayUID}?amount=${costEach * 100}&currency=EUR`;

        // Esegui il terzo UPDATE nella tabella "matches"
        const payment = await client.query(
            'UPDATE matches ' +
            'SET payment_link = $2 ' +
            'WHERE id = $1;',
            [matchId, paymentLink]
        );

        // Se tutte le query vanno a buon fine, esegui COMMIT
        await client.query('COMMIT');


        // Restituisci la risposta finale
        res.json({ message: 'Partita creata', match: match.rows[0], success: true });
    } catch (err) {
        // In caso di errore, annulla la transazione
        await client.query('ROLLBACK');
        console.error("Errore nella transazione:", err);
        res.status(500).json({ error: err.message, success: false });
    } finally {
        // Chiudi la connessione al client
        client.release();
    }
});


module.exports = router;
