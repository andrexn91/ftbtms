const express = require('express');
//const session = require("express-session");
const cors = require('cors');
//const db = require('./db');

///////////////////////////////
const bodyParser = require('body-parser');
const { Pool } = require('pg');
///////////////////////////////

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

//----------------------------------------------------VERIFICARE-----------------------------------------------------
app.use(express.json()); // Permette al server di leggere i JSON dal frontend

app.use(bodyParser.json());

//app.use(bodyParser.urlencoded({ extended: true }));


//////////////////////////////

// Importa le route
const authRoutes = require('./routes/auth');
const bookingsRoutes = require('./routes/bookings');
const matchesRoutes = require('./routes/matches');
const paymentsRoutes = require('./routes/payments');
const pitchesRoutes = require('./routes/pitches');
const playersRoutes = require('./routes/players');
const usersRoutes =  require('./routes/users');



app.use('/auth', authRoutes);
app.use('/bookings', bookingsRoutes);
app.use('/matches', matchesRoutes);
app.use('/payments', paymentsRoutes);
app.use('/pitches', pitchesRoutes);
app.use('/players', playersRoutes);
app.use('/users', usersRoutes);



app.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});