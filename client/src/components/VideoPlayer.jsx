import React, { useRef, useEffect, useState } from 'react';
import { FaExpand, FaRedo } from 'react-icons/fa'; // Asegúrate de importar iconos si usas
import './VideoPlayer.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const VideoPlayer = ({ category }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null); // Referencia al contenedor principal
    const [videoSrc, setVideoSrc] = useState(null);
    const [rotation, setRotation] = useState(0);
    const [loading, setLoading] = useState(false);
    
    // ESTADO NUEVO: Para saber si estamos en full screen
    const [isFullscreen, setIsFullscreen] = useState(false);

    const checkStatus = async () => {
        try {
            const res = await fetch(`${API_URL}/api/screen/${category}`);
            if (res.ok) {
                const data = await res.json();
                if (data.rotation !== rotation) setRotation(data.rotation);
                if (data.video_url && data.video_url !== videoSrc) {
                    setVideoSrc(data.video_url);
                    setLoading(false);
                }
            } else {
                setVideoSrc(null);
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        setVideoSrc(null);
        setLoading(true);
        checkStatus();
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, [category]);

    // --- NUEVO: DETECTOR DE EVENTOS DE PANTALLA COMPLETA ---
    useEffect(() => {
        const handleFullscreenChange = () => {
            // Si hay un elemento en fullscreen, ponemos true, si no, false
            setIsFullscreen(!!document.fullscreenElement);
        };

        // Escuchamos el evento del navegador
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        
        // Limpieza al salir
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const handleRotate = async () => {
        const newRot = (rotation + 90) % 360;
        setRotation(newRot); 
        await fetch(`${API_URL}/api/rotation/${category}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rotation: newRot })
        });
    };

    const toggleFull = () => {
        if (!document.fullscreenElement) {
            // Usamos containerRef para que abarque TODO (botones y video)
            containerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const isVertical = rotation === 90 || rotation === 270;

    return (
        // AQUI ESTA LA CLAVE: Agregamos la clase dinámicamente
        <div 
            ref={containerRef}
            className={`video-container ${isFullscreen ? 'fullscreen-mode' : ''}`}
        >
            {videoSrc ? (
                <div className="video-wrapper">
                    <video
                        ref={videoRef}
                        src={videoSrc}
                        autoPlay loop muted playsInline
                        className="main-video"
                        style={{
                            transform: `rotate(${rotation}deg)`,
                            width: isVertical ? '100vh' : '100%',
                            height: isVertical ? '100vw' : '100%',
                        }}
                    />
                </div>
            ) : (
                <div className="video-placeholder">
                   {loading ? <h2>Cargando...</h2> : <h2>Esperando señal...</h2>}
                </div>
            )}

            {/* Los controles */}
            <div className="controls-overlay">
                <button className="control-btn" onClick={handleRotate}><FaRedo /></button>
                <button className="control-btn" onClick={toggleFull}><FaExpand /></button>
            </div>
        </div>
    );
};

export default VideoPlayer;