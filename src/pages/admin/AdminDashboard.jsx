import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { adminSupabase } from '../../lib/adminSupabase'
import AdminSidebar from '../../components/AdminSidebar'

const AdminDashboard = () => {
    const navigate = useNavigate()
    const [stats, setStats] = useState({ users: 0, courses: 0, enrollments: 0 })
    const [loading, setLoading] = useState(true)
    const [courses, setCourses] = useState([])
    const [user, setUser] = useState(null)
    const [avatarUrl, setAvatarUrl] = useState(null)
    const [activities, setActivities] = useState([])

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                setUser(session.user)
                const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
                if (data) setAvatarUrl(data.avatar_url)
            }
        }
        fetchUserData()
    }, [])

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const { count: uCount } = await adminSupabase.from('profiles').select('*', { count: 'exact', head: true })
                const { count: cCount } = await adminSupabase.from('courses').select('*', { count: 'exact', head: true })
                const { count: eCount } = await adminSupabase.from('enrollments').select('*', { count: 'exact', head: true })

                setStats({ users: uCount || 0, courses: cCount || 0, enrollments: eCount || 0 })

                const { data: newUsers } = await adminSupabase.from('profiles').select('full_name, created_at').order('created_at', { ascending: false }).limit(5)
                const { data: newCourses } = await adminSupabase.from('courses').select('title, created_at').order('created_at', { ascending: false }).limit(5)
                
                let combined = []
                if (newUsers) newUsers.forEach(u => combined.push({ type: 'user', title: `Nuevo Usuario: ${u.full_name}`, date: new Date(u.created_at) }))
                if (newCourses) newCourses.forEach(c => combined.push({ type: 'course', title: `Nueva Especialidad: ${c.title}`, date: new Date(c.created_at) }))
                
                setActivities(combined.sort((a, b) => b.date - a.date))

                const { data: cList } = await supabase.from('courses').select('id, title')
                if (cList) setCourses(cList)

            } catch (error) { console.error(error) }
            finally { setLoading(false) }
        }
        fetchData()
    }, [user])

    if (loading) return null

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
            <AdminSidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '280px' }}>
                <main style={{ flex: 1, padding: '2.5rem' }}>
                    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
                        <div>
                            <h1 style={{ fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-1px' }}>
                                Panel de <span style={{ color: 'var(--accent-primary)' }}>Control Admin</span>
                            </h1>
                            <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', fontWeight: '500' }}>Gestión centralizada de la plataforma.</p>
                        </div>

                        <div onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontWeight: '800', fontSize: '1rem' }}>{user?.user_metadata?.full_name || 'Admin'}</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '700' }}>ADMINISTRADOR</p>
                            </div>
                            <img 
                                src={avatarUrl || `https://ui-avatars.com/api/?name=A&background=3b82f6&color=fff`} 
                                style={{ width: '52px', height: '52px', borderRadius: '14px', border: '2px solid var(--border-soft)' }} 
                                alt="Admin"
                            />
                        </div>
                    </header>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
                        {[
                            { label: 'Usuarios', val: stats.users, color: 'var(--accent-primary)', icon: '👥' },
                            { label: 'Especialidades', val: stats.courses, color: 'var(--accent-success)', icon: '📚' },
                            { label: 'Inscripciones', val: stats.enrollments, color: 'var(--accent-secondary)', icon: '📝' }
                        ].map((stat, i) => (
                            <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ fontSize: '2rem', background: 'var(--bg-secondary)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-main)' }}>{stat.val}</h3>
                                    <p style={{ color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2.5rem' }}>
                        <div className="card">
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '2rem' }}>Actividad del Sistema</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {activities.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-soft)' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.type === 'user' ? 'var(--accent-success)' : 'var(--accent-primary)' }} />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '0.95rem', fontWeight: '700' }}>{item.title}</p>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{item.date.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {activities.length === 0 && <p style={{ color: 'var(--text-dim)', fontWeight: '600' }}>No hay actividad reciente.</p>}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div className="card" style={{ background: 'var(--bg-secondary)', border: 'none' }}>
                                <h3 style={{ fontWeight: '800', marginBottom: '1.5rem' }}>Accesos Rápidos</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <button className="btn-premium btn-premium-primary" style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }} onClick={() => navigate('/admin/users')}>
                                        Gestionar Usuarios <span>→</span>
                                    </button>
                                    <button className="btn-premium btn-premium-primary" style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }} onClick={() => navigate('/admin/courses')}>
                                        Gestionar Cursos <span>→</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <footer style={{ background: 'white', padding: '2rem 3rem', borderTop: '1px solid var(--border-soft)', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-dim)', fontWeight: '700', fontSize: '0.85rem' }}>© {new Date().getFullYear()} LMS Pro - Admin</p>
                </footer>
            </div>
        </div>
    )
}

export default AdminDashboard
