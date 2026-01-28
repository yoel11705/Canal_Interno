import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaCocktail, FaConciergeBell, FaTags, FaUsers, FaLock } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ onAdminClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    const menuItems = [
        { name: 'Inicio', path: '/inicio', icon: <FaHome /> },
        { name: 'HH', path: '/hh', icon: <FaCocktail /> },
        { name: 'Room Service', path: '/service-room', icon: <FaConciergeBell /> },
        { name: 'Promociones', path: '/promociones', icon: <FaTags /> },
        { name: 'Clientes', path: '/clientes', icon: <FaUsers /> },
    ];

    return (
        <div
            className={`sidebar glass ${isHovered ? 'expanded' : 'collapsed'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="logo-area">
                <img src="/Logo_H.png" alt="Logo" className="logo-icon-img" />
                <span className="logo-text">Canal Interno</span>
            </div>

            <nav className="nav-menu">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <span className="icon">{item.icon}</span>
                        <span className="label">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="footer-area">
                <div className="qr-container">
                    <img src="/QR.png" alt="QR Menu" className="qr-image" />
                    <span className="qr-text">Scan for Menu</span>
                </div>

                <button className="admin-lock" onClick={onAdminClick}>
                    <FaLock />
                </button>
            </div>
        </div>
    );
};

export default Sidebar;