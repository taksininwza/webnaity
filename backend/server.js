const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { getUpcomingReservations } = require('./firebase');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api/reservations', async (req, res) => {
    const { appointment_date } = req.body;
    const data = await getUpcomingReservations(appointment_date);
    res.json(data);
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});