import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const Courses = () => {
    const navigate = useNavigate()
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filter, setFilter] = useState('all') // 'all', 'en-curso', 'completada'

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true)
            const { data: coursesData } = await supabase.from('courses').select('*').order('created_at', { ascending: false })
            
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                const { data: enrollments } = await supabase.from('enrollments').select('*').eq('user_id', session.user.id)
                const enrichedCourses = coursesData.map(course => {
                    const enrollment = enrollments?.find(e => e.course_id === course.id)
                    return {
                        ...course,
                        enrolled: !!enrollment,
                        completed: enrollment?.completed || false
                    }
                })
                setCourses(enrichedCourses)
            } else {
                setCourses(coursesData || [])
            }
            setLoading(false)
        }
        fetchCourses()
    }, [])

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase())
        if (filter === 'all') return matchesSearch
        if (filter === 'en-curso') return matchesSearch && course.enrolled && !course.completed
        if (filter === 'completada') return matchesSearch && course.completed
        return matchesSearch
    })

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
            <Sidebar />
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '280px' }}>
                <main style={{ flex: 1, padding: '2.5rem' }}>
                    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem' }}>
                        <div>
                            <h1 style={{ fontSize: '2.8rem', fontWeight: '900', letterSpacing: '-2px' }}>
                                Mis <span style={{ color: 'var(--accent-primary)' }}>Especialidades</span>
                            </h1>
                            <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', fontWeight: '500', marginTop: '0.5rem' }}>Gestiona y visualiza tu progreso académico en tiempo real.</p>
                        </div>
                    </header>

                    <div className="card" style={{ padding: '1.5rem', marginBottom: '3rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                            <input 
                                className="input-premium" 
                                placeholder="Buscar especialidad..." 
                                style={{ paddingLeft: '3rem' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.4rem', borderRadius: '14px' }}>
                            {['all', 'en-curso', 'completada'].map((f) => (
                                <button 
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    style={{ 
                                        padding: '0.6rem 1.2rem', 
                                        borderRadius: '10px', 
                                        border: 'none', 
                                        fontSize: '0.85rem',
                                        fontWeight: '800',
                                        cursor: 'pointer',
                                        background: filter === f ? 'var(--accent-primary)' : 'transparent',
                                        color: filter === f ? 'white' : 'var(--text-dim)',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    {f === 'all' ? 'Todos' : f === 'en-curso' ? 'En Curso' : 'Completada'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '5rem' }}>
                            <p style={{ fontWeight: '800', color: 'var(--text-dim)' }}>Cargando catálogo...</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                            {filteredCourses.map(course => (
                                <div key={course.id} className="card" style={{ padding: '0', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.3s' }}
                                     onClick={() => navigate(`/course/${course.id}`)}
                                >
                                    <div style={{ height: '200px', position: 'relative' }}>
                                        <img src={course.thumbnail_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                        {course.completed && (
                                            <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#10b981', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '900' }}>COMPLETADA</div>
                                        )}
                                    </div>
                                    <div style={{ padding: '1.5rem' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>{course.title}</h3>
                                        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '1.5rem', height: '2.8rem', overflow: 'hidden' }}>{course.description}</p>
                                        <button className="btn-premium btn-premium-primary" style={{ width: '100%' }}>
                                            {course.enrolled ? (course.completed ? 'Ver Certificado' : 'Continuar Aprendiendo') : 'Ver Detalles'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {filteredCourses.length === 0 && (
                                <div className="card" style={{ gridColumn: '1/-1', padding: '5rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                                    <h3 style={{ fontWeight: '900' }}>No se encontraron especialidades</h3>
                                    <p style={{ color: 'var(--text-dim)' }}>Prueba con otros términos de búsqueda o filtros.</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
                <footer style={{ background: 'white', padding: '2rem 3rem', borderTop: '1px solid var(--border-soft)', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-dim)', fontWeight: '700', fontSize: '0.85rem' }}>© {new Date().getFullYear()} LMS Pro - Tu plataforma de aprendizaje continuo</p>
                </footer>
            </div>
        </div>
    )
}

export default Courses
