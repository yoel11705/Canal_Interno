const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const dotenv = require('dotenv');
const db = require('./db');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const HOST_IP = '172.20.3.159'; 

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, 
}));

app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/videos');

app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);

app.use(express.static(path.join(__dirname, '../client/dist')));

app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\nSERVIDOR INICIADO EXITOSAMENTE`);
    console.log(`--------------------------------------------------`);
    console.log(` PARA VER EN LAS PANTALLAS USA ESTA URL:`);
    console.log(` http://${HOST_IP}:${PORT}`);
    console.log(`--------------------------------------------------\n`);
});