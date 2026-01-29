import React, { useRef, useEffect, useState } from 'react';
import { FaExpand, FaRedo } from 'react-icons/fa';
import './VideoPlayer.css';

const API_URL = import.meta.env.VITE_API_URL ;

const VideoPlayer = ({ category }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null); 
    const [videoSrc, setVideoSrc] = useState(null);
    const [rotation, setRotation] = useState(0);
    const [loading, setLoading] = useState(false);
    
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

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        
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
            containerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const isVertical = rotation === 90 || rotation === 270;

    return (
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