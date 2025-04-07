const express = require('express');
const router = express.Router();
const db = require('../db');


// Controlla se è già presente una prenotazione attraverso matchId e playerId
router.get('/check-booking', async (req, res) => {
    try {
        const { matchId, playerId } = req.query; // Recupera i parametri dalla query string

        const result = await db.query(
            'SELECT * ' +
            'FROM bookings ' +
            'WHERE id_match = $1 AND id_player = $2;', 
            [matchId, playerId]
        );
        
        if(result.rows.length > 0) {
            res.json({ isPresent: true, booking: result.rows[0] });
        }
        else {
            res.json({ isPresent: false, booking: null });
        }
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Recupera tutte le prenotazioni associate a un id match
router.get('/:id_match', async (req, res) => {
    try {
        const { id_match } = req.params;
        const result = await db.query(
            'SELECT bks.* ' +
            'FROM bookings bks ' +
            'JOIN players pl ON bks.id_player = pl.id ' +
            'WHERE bks.id_match = $1 ' +
            'ORDER BY pl.name ASC;', 
            [id_match]
        ); 
        
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Creazione di una prenotazione con ID Match e ID Player
router.post('/new-booking', async (req, res) => {
    const { matchId, playerId, bookedAs } = req.body;  // Riceve i dati dal frontend

    try {
        
       let columnToDecrease = '';
       switch(bookedAs) {
        case 'pl_mov':
            columnToDecrease = 'pl_mov_avail';
            break;
        case 'pl_gk':
            columnToDecrease = 'pl_gk_avail';
            break;
        default:
            break;
       }

        const result = await db.query(
            'WITH update_match AS (' +
                'UPDATE matches ' +
                'SET ' + columnToDecrease + ' = ' + columnToDecrease + ' - 1 ' +
                'WHERE id = $1 AND ' + columnToDecrease + ' > 0 ' +
                'RETURNING id' +
            ') ' +
            'INSERT INTO bookings (id_match, id_player, booked_as) ' +
            'SELECT id, $2, $3 FROM update_match ' +
            'RETURNING id;',
            [matchId, playerId, bookedAs]
        );

        if (result.rows.length > 0) {
            res.status(201).json({ success: true, message: "Prenotazione confermata!" });
        } else {
            res.status(201).json({ success: false, message: "Posti esauriti. Prenotazione non effettuata." });
        }

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Aggiornamento di una prenotazione con ID Match e ID Player
router.post('/update-booking', async (req, res) => {
    const { matchId, playerId, bookedAs } = req.body;  // Riceve i dati dal frontend

    try {

        let columnToDecrease = '';
        let columnToIncrease = '';
        switch(bookedAs) {
            case 'pl_mov':
                columnToDecrease = 'pl_mov_avail';
                columnToIncrease = 'pl_gk_avail';
                break;
            case 'pl_gk':
                columnToDecrease = 'pl_gk_avail';
                columnToIncrease = 'pl_mov_avail';
                break;
            default:
                break;
        }

        const result = await db.query(
            'WITH update_match AS (' +
                'UPDATE matches ' +
                'SET ' + columnToDecrease + ' = ' + columnToDecrease + ' - 1, ' + columnToIncrease + ' = ' + columnToIncrease + ' + 1 ' +
                'WHERE id = $1 AND ' + columnToDecrease + ' > 0 ' +
                'RETURNING id' +
            ') ' +
            'UPDATE bookings ' +
            'SET booked_as = $3 ' +
            'WHERE id_match IN (SELECT id FROM update_match) AND id_player = $2 ' +
            'RETURNING id;',
            [matchId, playerId, bookedAs]
        );

        if (result.rows.length > 0) {
            res.status(201).json({ success: true, message: "Prenotazione aggiornata!" });
        } else {
            res.status(201).json({ success: false, message: "Posti esauriti. Prenotazione non effettuata." });
        }

        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Eliminazione di una prenotazione per ID Match e ID Player
router.post('/delete-booking', async (req, res) => {
    const { matchId, playerId, bookedAs } = req.body;  // Riceve i dati dal frontend
    
    try {

        let columnToIncrease = '';
        switch(bookedAs) {
            case 'pl_mov':
                columnToIncrease = 'pl_mov_avail';
                break;
            case 'pl_gk':
                columnToIncrease = 'pl_gk_avail';
                break;
            default:
                break;
        }

        const result = await db.query(
            'WITH update_match AS (' +
                'UPDATE matches ' +
                'SET ' + columnToIncrease + ' = ' + columnToIncrease + ' + 1 ' +
                'WHERE id = $1 ' +
                'RETURNING id' +
            ') ' +
            'DELETE FROM bookings ' +
            'WHERE id_match IN (SELECT id FROM update_match) AND id_player = $2 ' +
            'RETURNING id;',
            [matchId, playerId]
        );

        if (result.rows.length > 0) {
            res.status(201).json({ success: true, message: "Prenotazione cancellata!" });
        } else {
            res.status(201).json({ success: false, message: "Cancellazione della prenotazione non effettuata." });
        }

        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
