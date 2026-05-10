import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const AdminSidebar = () => {
    const location = useLocation()
    const [isManualOpen, setIsManualOpen] = useState(false)

    const menuItems = [
        { name: 'Dashboard Admin', path: '/admin/dashboard', icon: <><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></> },
        { name: 'Gestión Usuarios', path: '/admin/users', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></> },
        { name: 'Especialidades', path: '/admin/courses', icon: <><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></> },
    ]

    const bottomItems = [
        { name: 'Vista Estudiante', path: '/dashboard', icon: <><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></> },
        { name: 'Cerrar Sesión', path: '/', icon: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></> },
    ]

    return (
        <aside style={{
            width: '280px',
            height: '100vh',
            background: 'var(--bg-sidebar)',
            borderRight: '1px solid var(--border-soft)',
            position: 'fixed',
            left: 0,
            top: 0,
            padding: '2.5rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100
        }}>
            <style>{`
                .nav-item-admin {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem 1.25rem;
                    border-radius: var(--radius-md);
                    text-decoration: none;
                    color: var(--text-dim);
                    font-weight: 700;
                    transition: all 0.3s;
                    margin-bottom: 0.5rem;
                    border: none;
                    background: none;
                    width: 100%;
                    text-align: left;
                    cursor: pointer;
                    font-size: 1rem;
                }

                .nav-item-admin:hover {
                    background: var(--bg-secondary);
                    color: var(--accent-primary);
                    transform: translateX(5px);
                }

                .nav-item-admin.active {
                    background: rgba(59, 130, 246, 0.1);
                    color: var(--accent-primary);
                }
            `}</style>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '4rem', padding: '0 0.5rem' }}>
                <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    background: 'var(--accent-primary)', 
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    color: 'white',
                    fontWeight: '900'
                }}>🛡️</div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-1px' }}>ADMIN <span style={{ color: 'var(--accent-primary)' }}>PRO</span></h2>
            </div>

            <nav style={{ flex: 1 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                        <Link key={item.name} to={item.path} className={`nav-item-admin ${isActive ? 'active' : ''}`}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {item.icon}
                            </svg>
                            {item.name}
                        </Link>
                    )
                })}

                {/* Manuales Dropdown */}
                <div style={{ marginBottom: '0.5rem' }}>
                    <button 
                        onClick={() => setIsManualOpen(!isManualOpen)}
                        className={`nav-item-admin ${isManualOpen ? 'active' : ''}`}
                        style={{ display: 'flex', justifyContent: 'space-between' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                            </svg>
                            Manuales
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isManualOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                    
                    <div style={{
                        maxHeight: isManualOpen ? '200px' : '0',
                        overflow: 'hidden',
                        transition: 'all 0.4s ease-in-out',
                        paddingLeft: '2rem'
                    }}>
                        <a href="#" target="_blank" className="nav-item-admin" style={{ fontSize: '0.85rem' }}>• Estudiante</a>
                        <a href="#" target="_blank" className="nav-item-admin" style={{ fontSize: '0.85rem' }}>• Administrador</a>
                    </div>
                </div>
            </nav>

            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-soft)', paddingTop: '2rem' }}>
                {bottomItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                        <Link key={item.name} to={item.path} className={`nav-item-admin ${isActive ? 'active' : ''}`}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {item.icon}
                            </svg>
                            {item.name}
                        </Link>
                    )
                })}
            </div>
        </aside>
    )
}

export default AdminSidebar
