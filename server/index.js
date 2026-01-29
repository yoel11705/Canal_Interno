const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- 1. CONFIGURACIONES ---
app.use(cors({ origin: '*' })); // Permitir acceso desde cualquier lugar
app.use(express.json());

// Configurar Cloudinary (Videos)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurar MongoDB (Base de Datos)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('CONECTADO A MONGODB'))
    .catch(err => console.error('ERROR MONGODB:', err));

// --- 2. MODELO DE DATOS (Esquema) ---
// Así se guardará la info de cada pantalla en la nube
const ScreenSchema = new mongoose.Schema({
    category: { type: String, required: true, unique: true }, // ej: "lobby"
    rotation: { type: Number, default: 0 },
    videoUrl: { type: String, default: "" }, // Link de Cloudinary
    publicId: { type: String, default: "" }  // ID para borrarlo después si hace falta
});

const Screen = mongoose.model('Screen', ScreenSchema);

// --- 3. CONFIGURAR SUBIDA DE VIDEOS ---
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'hotel-screens', // Nombre de la carpeta en Cloudinary
        resource_type: 'video',  // Importante: le decimos que son videos
    },
});
const upload = multer({ storage: storage });

// --- 4. RUTAS (API) ---

// RUTA A: Obtener info de una pantalla (Video actual y Rotación)
app.get('/api/screen/:category', async (req, res) => {
    const { category } = req.params;
    try {
        // Busca la pantalla, si no existe, la crea
        let screen = await Screen.findOne({ category });
        if (!screen) {
            screen = await Screen.create({ category });
        }
        res.json(screen);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// RUTA B: Actualizar Rotación
app.post('/api/rotation/:category', async (req, res) => {
    const { category } = req.params;
    const { rotation } = req.body;
    try {
        const screen = await Screen.findOneAndUpdate(
            { category },
            { rotation },
            { new: true, upsert: true } // Crea si no existe
        );
        res.json(screen);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// RUTA C: Subir Video Nuevo (¡Directo a la Nube!)
app.post('/api/upload/:category', upload.single('video'), async (req, res) => {
    const { category } = req.params;
    try {
        if (!req.file) return res.status(400).json({ error: 'No hay archivo' });

        // Guardamos la URL de Cloudinary en la base de datos
        const screen = await Screen.findOneAndUpdate(
            { category },
            { 
                videoUrl: req.file.path, 
                publicId: req.file.filename 
            },
            { new: true, upsert: true }
        );

        res.json({ success: true, screen });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al subir video' });
    }
});

// --- 5. INICIAR ---
app.listen(PORT, () => {
    console.log(`SERVIDOR LISTO EN PUERTO ${PORT}`);
});