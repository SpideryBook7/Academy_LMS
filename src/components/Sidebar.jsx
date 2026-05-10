import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const Sidebar = () => {
    const location = useLocation()
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        const checkRole = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                const { data } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single()
                if (data?.role === 'admin') setIsAdmin(true)
            }
        }
        checkRole()
    }, [])

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></> },
        { name: 'Especialidades', path: '/courses', icon: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></> },
        { name: 'Materiales', path: '/materials', icon: <><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></> },
        { name: 'Calendario', path: '/calendar', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></> },
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
                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem 1.25rem;
                    border-radius: var(--radius-md);
                    text-decoration: none;
                    color: var(--text-dim);
                    font-weight: 600;
                    transition: all 0.3s;
                    margin-bottom: 0.5rem;
                }

                .nav-item:hover {
                    background: var(--bg-secondary);
                    color: var(--accent-primary);
                    transform: translateX(5px);
                }

                .nav-item.active {
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
                }}>🎓</div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-1px' }}>LMS <span style={{ color: 'var(--accent-primary)' }}>PRO</span></h2>
            </div>

            <nav style={{ flex: 1 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                        <Link key={item.name} to={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {item.icon}
                            </svg>
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-soft)', paddingTop: '2rem' }}>
                {isAdmin && (
                    <Link to="/admin/dashboard" className="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                        Admin Panel
                    </Link>
                )}
                <Link to="/profile" className="nav-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Mi Perfil
                </Link>
                <Link to="/" className="nav-item" style={{ color: '#ef4444' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Cerrar Sesión
                </Link>
            </div>
        </aside>
    )
}

export default Sidebar
