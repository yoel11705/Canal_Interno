import React, { useRef, useEffect, useState } from 'react';
import api from '../api';
import { FaCompress, FaExpand, FaRedo } from 'react-icons/fa';
import './VideoPlayer.css';

const VideoPlayer = ({ category }) => {
    const videoRef = useRef(null);
    const [videoSrc, setVideoSrc] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [error, setError] = useState(null);

    const [rotation, setRotation] = useState(0);
    
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(false);

        const savedRotation = localStorage.getItem(`rotation-${category}`);
        
        if (savedRotation) {
            setRotation(parseInt(savedRotation, 10));
        } else {
            setRotation(0);
        }

        const timer = setTimeout(() => {
            setIsLoaded(true);
        }, 50);

        return () => clearTimeout(timer);
    }, [category]);

    
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(`rotation-${category}`, rotation);
        }
    }, [rotation, category, isLoaded]);

    useEffect(() => {
        const fetchVideo = async () => {
            setError(null);
            const data = await api.getVideo(category);
            if (data && data.filename) {
                const timestamp = new Date().getTime();
                setVideoSrc(`/uploads/${data.filename}?t=${timestamp}`);
            } else {
                setVideoSrc(null);
                setError("No hay video para esta sección");
            }
        };
        fetchVideo();
    }, [category]);

    const rotateVideo = () => {
        if (isLoaded) {
            setRotation(prev => (prev + 90) % 360);
        }
    };

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

            {videoSrc && (
                <div className="controls-overlay">
                    <button className="control-btn" onClick={rotateVideo} title="Rotar">
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