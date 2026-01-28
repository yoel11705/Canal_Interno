import React, { useRef, useEffect, useState } from 'react';
import api from '../api';
import { FaCompress, FaExpand } from 'react-icons/fa';
import './VideoPlayer.css';

const VideoPlayer = ({ category }) => {
    const videoRef = useRef(null);
    const [videoSrc, setVideoSrc] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVideo = async () => {
            setError(null);
            
            const data = await api.getVideo(category);
            if (data && data.filename) {
                const timestamp = new Date().getTime();
                setVideoSrc(`http://localhost:5000/uploads/${data.filename}?t=${timestamp}`);
            } else {
                setVideoSrc(null);
                setError("No hay video para esta sección");
            }
        };

        fetchVideo();
    }, [category]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            videoRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        }
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [])

    return (
        <div className="video-container">
            {videoSrc ? (
                <video
                    ref={videoRef}
                    className="main-video"
                    src={videoSrc}
                    autoPlay
                    loop
                    muted 
                    controls={false} 
                />
            ) : (
                <div className="video-placeholder">
                    <h2>{error ? error : "Loading..."}</h2>
                </div>
            )}

            {videoSrc && (
                <button className="fullscreen-toggle" onClick={toggleFullscreen}>
                    {isFullscreen ? <FaCompress /> : <FaExpand />}
                </button>
            )}
        </div>
    );
};

export default VideoPlayer;
