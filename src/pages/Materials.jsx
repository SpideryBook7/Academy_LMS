import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const Materials = () => {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [avatarUrl, setAvatarUrl] = useState(null)
    const [userRole, setUserRole] = useState(null)

    const [materials, setMaterials] = useState([])
    const [loadingMaterials, setLoadingMaterials] = useState(true)
    const [courseResources, setCourseResources] = useState([])
    const [loadingCourseResources, setLoadingCourseResources] = useState(true)

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) { navigate('/') } else {
                setUser(session.user)
                const { data } = await supabase.from('profiles').select('avatar_url, role').eq('id', session.user.id).single()
                if (data) {
                    setAvatarUrl(data.avatar_url)
                    setUserRole(data.role)
                }
                fetchUserMaterials(session.user.id);
                fetchCourseResources(session.user.id);
            }
        }
        getUser()
    }, [navigate])

    const fetchUserMaterials = async (userId) => {
        const { data } = await supabase.from('user_materials').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (data) setMaterials(data);
        setLoadingMaterials(false);
    };

    const fetchCourseResources = async (userId) => {
        const { data: enroll } = await supabase.from('enrollments').select('course_id').eq('user_id', userId)
        if (enroll && enroll.length > 0) {
            const ids = enroll.map(e => e.course_id)
            const { data: courses } = await supabase.from('courses').select('id, title').in('id', ids)
            const { data: lessons } = await supabase.from('lessons').select('*').in('course_id', ids).in('content_type', ['link', 'pdf', 'document', 'audio', 'file'])
            if (courses && lessons) {
                setCourseResources(courses.map(c => ({ ...c, resources: lessons.filter(l => l.course_id === c.id) })))
            }
        }
        setLoadingCourseResources(false)
    }

    const MaterialCard = ({ file, isCertification = false }) => (
        <div 
            onClick={() => window.open(file.url || file.video_url, '_blank')}
            className="card" 
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{ width: '48px', height: '48px', background: isCertification ? '#fef3c7' : '#dcfce7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                {isCertification ? '📜' : '📁'}
            </div>
            <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--text-main)' }}>{file.title}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600' }}>{isCertification ? 'CERTIFICACIÓN' : 'DOCUMENTO'}</p>
            </div>
            <div style={{ color: 'var(--accent-primary)', fontWeight: '900' }}>→</div>
        </div>
    )

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '280px' }}>
                <main style={{ flex: 1, padding: '2.5rem' }}>
                    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
                        <div>
                            <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-1px' }}>
                                Mis <span style={{ color: 'var(--accent-primary)' }}>Materiales</span>
                            </h1>
                            <p style={{ color: 'var(--text-dim)', fontWeight: '500' }}>Consulta tus documentos y certificaciones.</p>
                        </div>
                        <div onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontWeight: '800', fontSize: '1rem' }}>{user?.user_metadata?.full_name || 'Estudiante'}</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '700' }}>{userRole?.toUpperCase()}</p>
                            </div>
                            <img src={avatarUrl || `https://ui-avatars.com/api/?name=U&background=3b82f6&color=fff`} style={{ width: '52px', height: '52px', borderRadius: '14px', border: '2px solid var(--border-soft)' }} alt="User" />
                        </div>
                    </header>

                    <section style={{ marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ width: '4px', height: '24px', background: 'var(--accent-primary)', borderRadius: '4px' }}></span>
                            Documentos Adicionales
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {materials.filter(m => m.category !== 'Certificaciones').map((m, i) => <MaterialCard key={i} file={m} />)}
                            {materials.length === 0 && !loadingMaterials && <p style={{ color: 'var(--text-dim)', fontWeight: '600' }}>No hay documentos disponibles.</p>}
                        </div>
                    </section>

                    <section style={{ marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ width: '4px', height: '24px', background: 'var(--accent-success)', borderRadius: '4px' }}></span>
                            Certificaciones Obtenidas
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {materials.filter(m => m.category === 'Certificaciones').map((m, i) => <MaterialCard key={i} file={m} isCertification />)}
                            {materials.filter(m => m.category === 'Certificaciones').length === 0 && !loadingMaterials && <p style={{ color: 'var(--text-dim)', fontWeight: '600' }}>Aún no has obtenido certificaciones.</p>}
                        </div>
                    </section>
                </main>
                <footer style={{ background: 'white', padding: '2rem 3rem', borderTop: '1px solid var(--border-soft)', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-dim)', fontWeight: '700', fontSize: '0.85rem' }}>© {new Date().getFullYear()} LMS Pro - Tu plataforma de aprendizaje continuo</p>
                </footer>
            </div>
        </div>
    )
}

export default Materials
