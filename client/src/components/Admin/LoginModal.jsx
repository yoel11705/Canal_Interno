import React, { useState } from 'react';
import './LoginModal.css';

const LoginModal = ({ onClose, onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // 1. Conectamos directamente con TU servidor backend
            const response = await fetch('${import.meta.env.VITE_API_URL}/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            // 2. Si la respuesta no es OK (ej: usuario no encontrado), lanzamos error
            if (!response.ok) {
                throw new Error(data.error || 'Error al iniciar sesión');
            }

            // 3. ¡Éxito! Guardamos el token y cerramos
            // data.token viene de tu backend (res.json({ token, username }))
            console.log("Login exitoso:", data.username);
            onLogin(data.token); 
            
        } catch (err) {
            console.error("Error de conexión:", err);
            // Si el servidor está apagado, el error será "Failed to fetch"
            const mensaje = err.message === 'Failed to fetch' 
                ? 'No se puede conectar con el servidor (¿Está prendido?)' 
                : err.message;
            setError(mensaje);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass">
                <button className="close-btn" onClick={onClose}>&times;</button>
                <h2>Acceso Administrativo</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Usuario"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="contraseña"
                            required
                        />
                    </div>
                    {error && <p className="error-msg">⚠️ {error}</p>}
                    <button type="submit" className="login-btn" disabled={isLoading}>
                        {isLoading ? 'Verificando...' : 'Desbloquear'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;