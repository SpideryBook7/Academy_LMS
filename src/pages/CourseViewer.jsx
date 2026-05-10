import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Sidebar from '../components/Sidebar'
import confetti from 'canvas-confetti'

const CourseViewer = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [course, setCourse] = useState(null)
    const [lessons, setLessons] = useState([])
    const [activeLesson, setActiveLesson] = useState(null)
    const [loading, setLoading] = useState(true)
    const [completedLessons, setCompletedLessons] = useState([])
    const [avatarUrl, setAvatarUrl] = useState('')

    const updateCompletedLessons = useCallback(() => {
        if (id) {
            const data = localStorage.getItem(`lms_completed_${id}`) || '[]'
            setCompletedLessons(JSON.parse(data))
        }
    }, [id])

    useEffect(() => {
        updateCompletedLessons()
        const fetchDetails = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return navigate('/')
            
            const { data: profile } = await supabase.from('profiles').select('avatar_url').eq('id', session.user.id).single()
            if (profile) setAvatarUrl(profile.avatar_url)

            const { data: courseData } = await supabase.from('courses').select('*').eq('id', id).single()
            if (courseData) setCourse(courseData)

            const { data: lessonsData } = await supabase.from('lessons').select('*').eq('course_id', id).order('order', { ascending: true })
            if (lessonsData) {
                setLessons(lessonsData)
                setActiveLesson(lessonsData[0])
            }
            setLoading(false)
        }
        fetchDetails()
    }, [id, navigate, updateCompletedLessons])

    const markAsCompleted = async (lessonId) => {
        const completed = [...completedLessons]
        if (!completed.includes(lessonId)) {
            completed.push(lessonId)
            localStorage.setItem(`lms_completed_${id}`, JSON.stringify(completed))
            setCompletedLessons(completed)
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                await supabase.from('enrollments').update({ progress_data: completed }).eq('course_id', id).eq('user_id', session.user.id)
            }
        }
    }

    const getYouTubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
        const match = url?.match(regExp)
        return (match && match[2].length === 11) ? match[2] : null
    }

    if (loading) return <div style={{ background: 'var(--bg-main)', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><p>Cargando...</p></div>
    if (!course) return null

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
            <Sidebar />
            <main style={{ marginLeft: '280px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <header style={{ padding: '1.5rem 2.5rem', background: 'white', borderBottom: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <button onClick={() => navigate('/courses')} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: '800', cursor: 'pointer', marginBottom: '0.2rem' }}>← Volver</button>
                        <h1 style={{ fontSize: '1.2rem', fontWeight: '900', margin: 0 }}>{course.title}</h1>
                    </div>
                    <img src={avatarUrl || `https://ui-avatars.com/api/?name=U&background=3b82f6&color=fff`} style={{ width: '40px', height: '40px', borderRadius: '10px' }} alt="" />
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', flex: 1, overflow: 'hidden' }}>
                    <div style={{ padding: '2.5rem', overflowY: 'auto' }}>
                        {activeLesson?.content_type === 'video' ? (
                            <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-card)', background: 'black' }}>
                                <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${getYouTubeId(activeLesson.video_url)}`} frameBorder="0" allowFullScreen></iframe>
                            </div>
                        ) : activeLesson?.content_type === 'quiz' ? (
                            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                                <h2 style={{ fontWeight: '900', marginBottom: '1.5rem' }}>Evaluación: {activeLesson.title}</h2>
                                <p style={{ color: 'var(--text-dim)', marginBottom: '2.5rem' }}>Responde las preguntas para completar esta lección.</p>
                                <button className="btn-premium btn-premium-primary" onClick={() => markAsCompleted(activeLesson.id)}>Completar Evaluación</button>
                            </div>
                        ) : (
                            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                                <h2 style={{ fontWeight: '900', marginBottom: '1.5rem' }}>{activeLesson?.title}</h2>
                                <p style={{ color: 'var(--text-dim)', marginBottom: '2.5rem' }}>Recurso externo disponible para consulta.</p>
                                <a href={activeLesson?.video_url} target="_blank" className="btn-premium btn-premium-primary" onClick={() => markAsCompleted(activeLesson?.id)}>Abrir Recurso</a>
                            </div>
                        )}
                        <div style={{ marginTop: '2.5rem' }}>
                            <h2 style={{ fontWeight: '900' }}>{activeLesson?.title}</h2>
                            <p style={{ color: 'var(--text-dim)', marginTop: '1rem', lineHeight: '1.6' }}>En esta lección aprenderás los fundamentos necesarios para dominar este módulo. Asegúrate de revisar todo el material.</p>
                        </div>
                    </div>

                    <div style={{ background: 'white', borderLeft: '1px solid var(--border-soft)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-soft)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '900' }}>Contenido del curso</h3>
                            <div style={{ marginTop: '0.8rem', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px' }}>
                                <div style={{ width: `${(completedLessons.length / lessons.length) * 100}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: '3px' }}></div>
                            </div>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {lessons.map((lesson, idx) => (
                                <div 
                                    key={lesson.id} 
                                    onClick={() => setActiveLesson(lesson)}
                                    style={{ 
                                        padding: '1.25rem 1.5rem', cursor: 'pointer', borderBottom: '1px solid var(--border-soft)',
                                        background: activeLesson?.id === lesson.id ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                                        display: 'flex', alignItems: 'center', gap: '1rem'
                                    }}
                                >
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '900', color: completedLessons.includes(lesson.id) ? 'white' : 'var(--text-dim)', background: completedLessons.includes(lesson.id) ? 'var(--accent-success)' : 'transparent' }}>
                                        {completedLessons.includes(lesson.id) ? '✓' : idx + 1}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.85rem', fontWeight: activeLesson?.id === lesson.id ? '800' : '600', color: activeLesson?.id === lesson.id ? 'var(--accent-primary)' : 'var(--text-main)' }}>{lesson.title}</p>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '700' }}>{lesson.content_type?.toUpperCase()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <footer style={{ padding: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--border-soft)', background: 'white' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '700' }}>© {new Date().getFullYear()} LMS Pro - Todos los derechos reservados</p>
                </footer>
            </main>
        </div>
    )
}

export default CourseViewer
