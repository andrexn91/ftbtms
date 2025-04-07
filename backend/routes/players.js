const express = require('express');
const router = express.Router();
const db = require('../db');


// Recupera tutti i players completi di ruoli e skills
router.get('/', async (req, res) => {
    try {

        const playersResult = await db.query(
            'SELECT id, name, email, role AS accessLevel ' +
            'FROM players ' +
            'ORDER BY name ASC;'
        );

        const rolesResult = await db.query(
            'SELECT pl.id AS id_player, r.pos, rd.name AS role ' +
            'FROM players pl JOIN roles r ON pl.id = r.id_player ' +
            'JOIN roles_definition rd ON rd.id = r.id_role ' +
            'ORDER BY pl.name, r.pos;'
        );

        const skillsResult = await db.query(
            'SELECT pl.id AS id_player, cat.id AS id_category, cat.name AS category, sk.value AS value, cat.macro_category AS macro_category ' +
            'FROM players pl JOIN skills sk ON pl.id = sk.id_player ' +
            'JOIN categories cat ON sk.id_category = cat.id ' +
            'ORDER BY pl.name, sk.id;'
        );

        
        res.json({
            playersInfo: playersResult.rows,
            playersRoles: rolesResult.rows,
            playersSkills: skillsResult.rows
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Recupera solamente id e name di tutti i players
router.get('/names', async (req, res) => {
    try {

        const result = await db.query(
            'SELECT id, name ' +
            'FROM players ' +
            'ORDER BY name ASC;'
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Giocatore non trovato' });
        }

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Recupera un player specifico per ID completo di ruoli e skills
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const playersResult = await db.query(
            'SELECT id, name, email, role AS accessLevel' +
            'FROM players ' +
            'WHERE id = $1;', 
            [id]
        );

        const rolesResult = await db.query(
            'SELECT pl.id AS id_player, r.pos, rd.name AS role ' +
            'FROM players pl JOIN roles r ON pl.id = r.id_player ' +
            'JOIN roles_definition rd ON rd.id = r.id_role ' +
            'WHERE pl.id = $1 ' +
            'ORDER BY pl.name, r.pos;', 
            [id]
        );

        const skillsResult = await db.query(
            'SELECT pl.id AS id_player, cat.id AS id_category, cat.name AS category, sk.value AS value, cat.macro_category AS macro_category ' +
            'FROM players pl JOIN skills sk ON pl.id = sk.id_player ' +
            'JOIN categories cat ON sk.id_category = cat.id ' +
            'WHERE pl.id = $1 ' +
            'ORDER BY pl.name, sk.id;', 
            [id]
        );

        /*
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Giocatore non trovato' });
        }

        res.json(result.rows[0]);
        */

        res.json({
            playerInfo: playersResult.rows,
            playerRoles: rolesResult.rows,
            playerSkills: skillsResult.rows
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    
});


// Update di un utente per ID
router.put('/update-player/', async (req, res) => {
    try {
        //const { id_player } = req.params;
        const { id_player, id_category, value } = req.body;  // Riceve i dati dal frontend

        const result = await db.query(
            'UPDATE skills SET value = $1 WHERE id_player = $2 AND id_category = $3 RETURNING *',
            [value, id_player, id_category]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }

        res.json({ message: 'Utente aggiornato', utente: result.rows[0], success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
