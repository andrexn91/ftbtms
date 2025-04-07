const express = require('express');
const router = express.Router();
const db = require('../db');


// Recupera tutte le informazioni dei pagamenti associate a un id match
router.get('/:id_match', async (req, res) => {
    try {
        const { id_match } = req.params;
        const result = await db.query(
            'SELECT py.id_player, pl.name, py.paid_with ' +
            'FROM players pl ' +
            'JOIN payments py ON pl.id = py.id_player ' +
            'WHERE py.id_match = $1 ' +
            'ORDER BY pl.name ASC;', 
            [id_match]
        ); 
        
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// Creazione di un pagamento con ID Match e ID Player
router.post('/new-payment', async (req, res) => {
    const { matchId, playerId } = req.body;  // Riceve i dati dal frontend

    try {

        const result = await db.query(
            'INSERT INTO payments (id_match, id_player) ' +
            'VALUES ($1, $2) ' +
            'RETURNING *;',
            [matchId, playerId]
        );

        if (result.rows.length > 0) {
            res.status(201).json({ success: true });
        } else {
            res.status(201).json({ success: false });
        }

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Eliminazione di un pagamento attraverso ID Match e ID Player
router.post('/delete-payment', async (req, res) => {
    const { matchId, playerId } = req.body;  // Riceve i dati dal frontend
    
    try {

        const result = await db.query(
            'DELETE FROM payments ' +
            'WHERE id_match = $1 ' +
            'AND id_player = $2;',
            [matchId, playerId]
        );
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



//Modifica della modalità di pagamento di un determinato user
router.post('/update-payment', async (req, res) => {
    const { matchId, playerId, paidWith } = req.body;  // Riceve i dati dal frontend

    try {
        const result = await db.query(
            'UPDATE payments ' +
            'SET paid_with = $3 ' +
            'WHERE id_match = $1 ' +
            'AND id_player = $2 ' +
            'RETURNING *;',
            [matchId, playerId, paidWith]
        );

        if (result.rows.length > 0) {
            res.status(201).json({ success: true, message: "Pagamento aggiornato!" });
        } else {
            res.status(201).json({ success: false, message: "Pagamento non aggiornato!" });
        }

        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
