import React, { useRef, useEffect, useState } from 'react';
import api from '../api';
import { FaCompress, FaExpand, FaRedo } from 'react-icons/fa';
import './VideoPlayer.css';

const VideoPlayer = ({ category }) => {
    const videoRef = useRef(null);
    const [videoSrc, setVideoSrc] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [error, setError] = useState(null);
    
    // Estados para controlar qué estamos viendo
    const [rotation, setRotation] = useState(0);
    const [currentFilename, setCurrentFilename] = useState(null); // Para saber si cambió el archivo

    // --- EL VIGILANTE (Función que revisa cambios) ---
    const checkForUpdates = async () => {
        try {
            // 1. REVISAR ROTACIÓN
            // Preguntamos al servidor si giraron la pantalla
            const rotResponse = await fetch(`/api/rotation/${category}`);
            if (rotResponse.ok) {
                const rotData = await rotResponse.json();
                if (rotData && typeof rotData.rotation === 'number') {
                    // Solo actualizamos si el valor es diferente (para no parpadear)
                    setRotation(prev => (prev !== rotData.rotation ? rotData.rotation : prev));
                }
            }

            // 2. REVISAR VIDEO NUEVO
            // Preguntamos a la base de datos cuál es el video actual
            const videoData = await api.getVideo(category);
            
            // Si hay un video en el servidor...
            if (videoData && videoData.filename) {
                // ...y el nombre del archivo es DIFERENTE al que tenemos puesto ahora
                if (videoData.filename !== currentFilename) {
                    console.log("¡Video nuevo detectado! Actualizando pantalla...");
                    
                    const timestamp = new Date().getTime();
                    // Cambiamos el video
                    setVideoSrc(`/uploads/${videoData.filename}?t=${timestamp}`);
                    // Guardamos el nombre nuevo para recordarlo
                    setCurrentFilename(videoData.filename); 
                    setError(null);
                }
            } else {
                // Si borraron el video del servidor, quitamos el video de la pantalla
                if (currentFilename !== null) {
                    setVideoSrc(null);
                    setCurrentFilename(null);
                    setError("Esperando video...");
                }
            }

        } catch (err) {
            console.error("Error verificando actualizaciones:", err);
            // No ponemos setError aquí para que no parpadee si falla un micro-chequeo
        }
    };

    // --- CICLO DE VIDA (Polling) ---
    useEffect(() => {
        // 1. Chequeo inmediato al entrar
        checkForUpdates();

        // 2. Programar chequeo automático cada 5 segundos
        const intervalId = setInterval(checkForUpdates, 5000);

        // Limpieza: Si te sales de la página, dejamos de checar
        return () => clearInterval(intervalId);
    }, [category, currentFilename]); // Se reinicia si cambias de categoría o de video


    // --- FUNCIÓN PARA ROTAR MANUALMENTE ---
    const rotateVideo = async () => {
        const newRotation = (rotation + 90) % 360;
        setRotation(newRotation); // Cambio visual rápido

        try {
            // Avisamos al servidor para que las OTRAS pantallas también giren
            await fetch(`/api/rotation/${category}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rotation: newRotation })
            });
            // Forzamos un chequeo rápido
            checkForUpdates();
        } catch (err) {
            console.error("Error guardando rotación:", err);
        }
    };

    // --- PANTALLA COMPLETA ---
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            videoRef.current.parentElement.parentElement.requestFullscreen()
                .catch(err => console.error(err));
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const isVertical = rotation === 90 || rotation === 270;

    return (
        <div className={`video-container ${isFullscreen ? 'fullscreen-mode' : ''}`}>
            {videoSrc ? (
                <div className="video-wrapper">
                    <video
                        ref={videoRef}
                        className="main-video"
                        src={videoSrc}
                        autoPlay
                        loop
                        muted
                        controls={false}
                        style={{
                            transform: `rotate(${rotation}deg)`,
                            // Ajuste inteligente de tamaño
                            width: isVertical ? '100vh' : '100%',
                            height: isVertical ? '100vw' : '100%',
                            maxWidth: 'none',
                            maxHeight: 'none',
                        }}
                    />
                </div>
            ) : (
                <div className="video-placeholder">
                    <h2>{error || "Cargando..."}</h2>
                </div>
            )}

            {/* Controles (Se ocultan solos en pantalla completa por CSS) */}
            {videoSrc && (
                <div className="controls-overlay">
                    <button className="control-btn" onClick={rotateVideo} title="Rotar Todas">
                        <FaRedo />
                    </button>
                    <button className="control-btn" onClick={toggleFullscreen} title="Pantalla Completa">
                        {isFullscreen ? <FaCompress /> : <FaExpand />}
                    </button>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;