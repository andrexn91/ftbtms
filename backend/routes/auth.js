const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const jwt = require('jsonwebtoken');

/*
router.post('/', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await db.query(
            'SELECT id, username, photo FROM players WHERE username = $1 AND password = $2',
            [username, password]
        );

        if (result.rows.length > 0) {
            res.json({ success: true, user: result.rows[0] });
        } else {
            res.status(401).json({ success: false, message: 'Credenziali errate' });
        }
    } catch (error) {
        console.error('Errore durante la query di login:', error);
        res.status(500).json({ success: false, message: 'Errore del server' });
    }
});
*/

// Registrazione //DA SETTARE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            'INSERT INTO users ' +
            '(username, password) ' +
            'VALUES ($1, $2);',
            [username, hashedPassword]
        );

        res.status(201).json({ message: 'Utente registrato!' });
    } catch (error) {
        res.status(500).json({ error: 'Errore nella registrazione' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await db.query(
            'SELECT * FROM users ' +
            'WHERE username = $1;',
            [username]
        );

        if (result.rows.length > 0) {
            const user = result.rows[0];
            const match = await bcrypt.compare(password, user.password);

            if (match) {
                const token = jwt.sign({ id: user.id, username: user.username, type: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
                res.status(200).json({ message: 'Login riuscito', token, linked: user.id_player !== null });
            } else {
                res.status(401).json({ error: 'Password errata' });
            }
        } else {
            res.status(404).json({ error: 'Utente non trovato' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Errore durante il login' });
    }
});


// 🔹 **2. Middleware per proteggere le rotte**
function authenticateToken(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1]; // Estrai il token dal header
    if (!token) return res.status(401).json({ message: "Accesso negato" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Token non valido" });
        req.user = user; // Aggiunge i dati dell'utente alla richiesta
        next();
    });
}

// 🔹 **3. Rotta protetta accessibile solo agli utenti autenticati**
router.get('/profile', authenticateToken, (req, res) => {
    res.json({ message: `Benvenuto, utente ${req.user.id}`, type: req.user.type });
});

// 🔹 **4. Rotta protetta solo per admin**
router.get('/admin', authenticateToken, (req, res) => {
    if (req.user.type !== "admin") return res.status(403).json({ message: "Accesso negato" });
    res.json({ message: "Benvenuto nell'area admin!" });
});



module.exports = router;
