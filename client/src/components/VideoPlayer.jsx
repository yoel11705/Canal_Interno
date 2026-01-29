import React, { useRef, useEffect, useState } from 'react';
import { FaCompress, FaExpand, FaRedo } from 'react-icons/fa';
import './VideoPlayer.css';

// URL AUTOMÁTICA: Si estamos en local usa localhost, si no, la nube
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const VideoPlayer = ({ category }) => {
    const videoRef = useRef(null);
    const [videoSrc, setVideoSrc] = useState(null);
    const [rotation, setRotation] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // --- VIGILANTE DE LA NUBE ---
    const checkStatus = async () => {
        try {
            const res = await fetch(`${API_URL}/api/screen/${category}`);
            if (res.ok) {
                const data = await res.json();
                
                // 1. Actualizar Rotación
                if (data.rotation !== rotation) {
                    setRotation(data.rotation);
                }

                // 2. Actualizar Video (Si cambió la URL)
                if (data.videoUrl && data.videoUrl !== videoSrc) {
                    console.log("Nuevo video detectado de la nube");
                    setVideoSrc(data.videoUrl);
                }
            }
        } catch (err) {
            console.error("Error conectando:", err);
        }
    };

    // Revisar cada 5 segundos
    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, [category, videoSrc, rotation]); // Dependencias clave

    // --- ROTAR MANUALMENTE ---
    const handleRotate = async () => {
        const newRot = (rotation + 90) % 360;
        setRotation(newRot); // Cambio visual inmediato
        
        // Guardar en MongoDB
        await fetch(`${API_URL}/api/rotation/${category}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rotation: newRot })
        });
    };

    // --- FULLSCREEN ---
    const toggleFull = () => {
        if (!document.fullscreenElement) {
            videoRef.current?.parentElement?.parentElement?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const isVertical = rotation === 90 || rotation === 270;

    return (
        <div className="video-container">
            {videoSrc ? (
                <div className="video-wrapper">
                    <video
                        ref={videoRef}
                        src={videoSrc} // URL directa de Cloudinary
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
                <div className="video-placeholder"><h2>Esperando señal...</h2></div>
            )}

            <div className="controls-overlay">
                <button onClick={handleRotate}><FaRedo /></button>
                <button onClick={toggleFull}><FaExpand /></button>
            </div>
        </div>
    );
};

export default VideoPlayer;