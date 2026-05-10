import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const Dashboard = () => {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [avatarUrl, setAvatarUrl] = useState(null)
    const [loading, setLoading] = useState(true)
    const [myCourses, setMyCourses] = useState([])
    const [events, setEvents] = useState([])
    const [currentSlide, setCurrentSlide] = useState(0)

    const carouselSlides = [
        {
            id: 1,
            image: 'https://images.unsplash.com/photo-1517245366812-d403077e6e96?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
            title: "Excelencia Educativa",
            subtitle: "Explora nuestras nuevas especialidades diseñadas para el mercado actual."
        },
        {
            id: 2,
            image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
            title: "Comunidad de Aprendizaje",
            subtitle: "Conecta con expertos y colegas para potenciar tu crecimiento."
        }
    ]

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % carouselSlides.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    const checkUser = React.useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { navigate('/'); return; }
        setUser(session.user)

        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        if (profile) setAvatarUrl(profile.avatar_url)

        const { data: enrollments } = await supabase.from('enrollments').select('*, courses(*)').eq('user_id', session.user.id)
        if (enrollments) {
            setMyCourses(enrollments.map(e => ({
                id: e.courses.id,
                title: e.courses.title,
                thumbnail: e.courses.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                progress: e.completed ? 100 : 0,
                instructor: e.courses.instructor_name || 'Instructor Pro'
            })))
        }

        const { data: eventsData } = await supabase.from('calendar_events').select('*').eq('user_id', session.user.id).limit(3)
        if (eventsData) setEvents(eventsData)

        setLoading(false)
    }, [navigate])

    useEffect(() => {
        checkUser()
    }, [checkUser])

    if (loading) return null

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
            <Sidebar />
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '280px' }}>
                <main style={{ flex: 1, padding: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2.5rem' }}>
                    
                    {/* Center Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h1 style={{ fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-1px' }}>
                                    Hola, <span style={{ color: 'var(--accent-primary)' }}>{user?.user_metadata?.full_name?.split(' ')[0] || 'Estudiante'}</span>
                                </h1>
                                <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', fontWeight: '500' }}>Es un gran día para seguir aprendiendo.</p>
                            </div>
                        </header>

                        {/* Carousel Banner */}
                        <div style={{ 
                            height: '350px', 
                            borderRadius: 'var(--radius-xl)', 
                            overflow: 'hidden', 
                            position: 'relative',
                            boxShadow: 'var(--shadow-card)'
                        }}>
                            {carouselSlides.map((slide, idx) => (
                                <div key={slide.id} style={{
                                    position: 'absolute',
                                    inset: 0,
                                    opacity: currentSlide === idx ? 1 : 0,
                                    transition: 'opacity 1s ease-in-out'
                                }}>
                                    <img src={slide.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={slide.title} />
                                    <div style={{ 
                                        position: 'absolute', 
                                        inset: 0, 
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'flex-end',
                                        padding: '3rem'
                                    }}>
                                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.5rem', color: 'white' }}>{slide.title}</h2>
                                        <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)', maxWidth: '500px' }}>{slide.subtitle}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Courses Grid */}
                        <section>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Mis Especialidades</h2>
                                <button onClick={() => navigate('/courses')} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: '700', cursor: 'pointer' }}>Ver todas</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                {myCourses.map((course) => (
                                    <div key={course.id} className="card" style={{ padding: '1rem', cursor: 'pointer', transition: 'transform 0.3s' }}
                                         onClick={() => navigate(`/course/${course.id}`)}
                                    >
                                        <div style={{ height: '180px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem' }}>
                                            <img src={course.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={course.title} />
                                        </div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.5rem' }}>{course.title}</h3>
                                        <div style={{ height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                                            <div style={{ width: `${course.progress}%`, height: '100%', background: 'var(--accent-primary)' }} />
                                        </div>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-primary)' }}>{course.progress}% completado</span>
                                    </div>
                                ))}
                                {myCourses.length === 0 && (
                                    <div className="card" style={{ gridColumn: '1/-1', padding: '3rem', textAlign: 'center', background: 'white' }}>
                                        <p style={{ color: 'var(--text-dim)', fontWeight: '600' }}>Aún no estás inscrito en ninguna especialidad.</p>
                                        <button className="btn-premium btn-premium-primary" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/courses')}>Explorar Catálogo</button>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Panel */}
                    <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <img 
                                src={avatarUrl || `https://ui-avatars.com/api/?name=${user?.user_metadata?.full_name || 'U'}&background=3b82f6&color=fff`} 
                                style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '1rem', border: '3px solid var(--bg-secondary)' }} 
                                alt="Avatar"
                            />
                            <h4 style={{ fontWeight: '800', fontSize: '1.1rem' }}>{user?.user_metadata?.full_name || 'Estudiante'}</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '1.5rem' }}>Especialista en Formación</p>
                            <button className="btn-premium btn-premium-primary" style={{ width: '100%' }} onClick={() => navigate('/profile')}>Editar Perfil</button>
                        </div>

                        <div className="card">
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem' }}>Próximos Eventos</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {events.map(event => (
                                    <div key={event.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-primary)' }} />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '0.9rem', fontWeight: '700' }}>{event.title}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{new Date(event.start_time).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {events.length === 0 && <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>No hay eventos cercanos.</p>}
                            </div>
                            <button className="btn-premium" style={{ width: '100%', marginTop: '1.5rem', background: 'var(--bg-secondary)', color: 'var(--text-main)' }} onClick={() => navigate('/calendar')}>Ver Calendario</button>
                        </div>
                    </aside>
                </main>
                <footer style={{ background: 'white', padding: '2rem 3rem', borderTop: '1px solid var(--border-soft)', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-dim)', fontWeight: '700', fontSize: '0.85rem' }}>© {new Date().getFullYear()} LMS Pro - Tu plataforma de aprendizaje continuo</p>
                </footer>
            </div>
        </div>
    )
}

export default Dashboard
