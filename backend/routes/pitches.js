const express = require('express');
const router = express.Router();
const db = require('../db');


// 1 Recupera tutti i campi
router.get('/', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM pitches ' +
            'ORDER BY id ASC;'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 2️ Recupera un campo specifico per ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            'SELECT * FROM pitches ' +
            'WHERE id = $1;',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Campo non trovato' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 3 Inserimento di un nuovo campo
router.put('/new-pitch/', async (req, res) => {
    try {
        const { name, address, total_cost } = req.body;  // Riceve i dati dal frontend

        const result = await db.query(
            'INSERT INTO pitches (name, address, total_cost) ' +
            'VALUES ($1, $2, $3) ' +
            'RETURNING *;',
            [name, address, total_cost]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Campo non trovato' }); //VERIFICARE
        }

        res.json({ message: 'Campo creato', pitch: result.rows[0], success: true }); //VERIFICARE
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
