const express = require('express');
const router = express.Router();
const db = require('../db');


// Recupera tutti gli users
router.get('/', async (req, res) => {
    try {

        const result = await db.query(
            'SELECT us.*, pl.name ' +
            'FROM users us JOIN players pl ON us.id_player = pl.id ' +
            'ORDER BY pl.name ASC;'
            );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User non trovato' }); //NON HA SENSO!!!!!!!!!!!!
        }

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});





// Recupera tutti gli users che non hanno un player associato
router.get('/new-users', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, username ' +
            'FROM users ' +
            'WHERE id_player IS NULL;'
            );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Nessun user da associare' });
        }

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Recupera tutti i players che non hanno un user associato
router.get('/to-associate', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, name ' +
            'FROM players ' +
            'WHERE id NOT IN ' +
                '(SELECT id_player ' +
                'FROM users ' +
                'WHERE id_player IS NOT NULL);'
            );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Nessun player da associare' });
        }

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


//Recupera tutti gli user che hanno un Satispay UID registrato
router.get('/get-satispay-cashiers', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT us.id, pl.name ' +
            'FROM users us JOIN players pl ON us.id_player = pl.id ' +
            'WHERE us.satispay_uid IS NOT NULL ' +
            'ORDER BY pl.name ASC;'
            );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Nessun cassiere disponibile' });
        }

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Recupera un singolo user tramite il suo ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            'SELECT us.*, pl.name ' +
            'FROM users us JOIN players pl ON us.id_player = pl.id ' +
            'WHERE us.id = $1 ' +
            'ORDER BY pl.name ASC;',
            [id]
            );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User non trovato' }); //NON HA SENSO!!!!!!!!!!!!
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

 
// Associazione di un nuovo user ad un player
router.put('/new-assoc/', async (req, res) => {
    try {
        const { idUser, idPlayer } = req.body;  // Riceve i dati dal frontend

        const result = await db.query(
            'UPDATE users ' +
            'SET id_player = $1 ' +
            'WHERE id = $2 ' +
            'RETURNING *;',
            [idPlayer, idUser]
            );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Errore nell\'aggiornamento dell\'user.' }); //VERIFICARE
        }

        res.json({ message: 'User aggiornato', user: result.rows[0], success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
