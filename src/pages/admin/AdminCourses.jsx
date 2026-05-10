import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import AdminSidebar from '../../components/AdminSidebar'

const AdminCourses = () => {
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [lessons, setLessons] = useState([])
    const [showCourseModal, setShowCourseModal] = useState(null) // 'create' or course object
    const [showLessonModal, setShowLessonModal] = useState(null) // 'create' or lesson object

    useEffect(() => { fetchCourses() }, [])

    const fetchCourses = async () => {
        setLoading(true)
        const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false })
        if (data) setCourses(data)
        setLoading(false)
    }

    const fetchLessons = async (courseId) => {
        const { data } = await supabase.from('lessons').select('*').eq('course_id', courseId).order('order', { ascending: true })
        if (data) setLessons(data)
    }

    const handleSaveCourse = async (e) => {
        e.preventDefault()
        const courseData = { title: e.target.title.value, description: e.target.description.value, thumbnail_url: e.target.thumbnail_url.value }
        if (showCourseModal === 'create') {
            await supabase.from('courses').insert([courseData])
        } else {
            await supabase.from('courses').update(courseData).eq('id', showCourseModal.id)
        }
        setShowCourseModal(null); fetchCourses();
    }

    const handleSaveLesson = async (e) => {
        e.preventDefault()
        const lessonData = { 
            course_id: selectedCourse.id, 
            title: e.target.title.value, 
            content_type: e.target.content_type.value, 
            video_url: e.target.video_url.value,
            order: showLessonModal === 'create' ? lessons.length : showLessonModal.order
        }
        if (showLessonModal === 'create') {
            await supabase.from('lessons').insert([lessonData])
        } else {
            await supabase.from('lessons').update(lessonData).eq('id', showLessonModal.id)
        }
        setShowLessonModal(null); fetchLessons(selectedCourse.id);
    }

    const moveLesson = async (index, direction) => {
        const newLessons = [...lessons]
        const targetIndex = index + direction
        if (targetIndex < 0 || targetIndex >= lessons.length) return
        [newLessons[index], newLessons[targetIndex]] = [newLessons[targetIndex], newLessons[index]]
        setLessons(newLessons)
        for (let i = 0; i < newLessons.length; i++) {
            await supabase.from('lessons').update({ order: i }).eq('id', newLessons[i].id)
        }
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
            <AdminSidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '280px' }}>
                <main style={{ flex: 1, padding: '2.5rem' }}>
                    {!selectedCourse ? (
                        <>
                            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
                                <div>
                                    <h1 style={{ fontSize: '2.2rem', fontWeight: '900' }}>Gestión de <span style={{ color: 'var(--accent-primary)' }}>Especialidades</span></h1>
                                    <p style={{ color: 'var(--text-dim)', fontWeight: '500' }}>Administra el catálogo académico.</p>
                                </div>
                                <button className="btn-premium btn-premium-primary" onClick={() => setShowCourseModal('create')}>+ Nueva Especialidad</button>
                            </header>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                                {courses.map(course => (
                                    <div key={course.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                                        <img src={course.thumbnail_url} style={{ width: '100%', height: '180px', objectFit: 'cover' }} alt="" />
                                        <div style={{ padding: '1.5rem' }}>
                                            <h3 style={{ fontWeight: '800', marginBottom: '0.5rem' }}>{course.title}</h3>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '1.5rem', height: '3.2rem', overflow: 'hidden' }}>{course.description}</p>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn-premium btn-premium-primary" style={{ flex: 1 }} onClick={() => { setSelectedCourse(course); fetchLessons(course.id); }}>Contenido</button>
                                                <button className="btn-premium" onClick={() => setShowCourseModal(course)}>Editar</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {courses.length === 0 && !loading && (
                                    <div className="card" style={{ gridColumn: '1/-1', padding: '5rem', textAlign: 'center' }}>
                                        <p style={{ color: 'var(--text-dim)', fontWeight: '700' }}>No hay especialidades creadas aún.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
                                <div>
                                    <button onClick={() => setSelectedCourse(null)} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: '800', cursor: 'pointer', marginBottom: '1rem' }}>← Volver</button>
                                    <h1 style={{ fontSize: '2.2rem', fontWeight: '900' }}>Contenido de <span style={{ color: 'var(--accent-primary)' }}>{selectedCourse.title}</span></h1>
                                </div>
                                <button className="btn-premium btn-premium-primary" onClick={() => setShowLessonModal('create')}>+ Añadir Lección</button>
                            </header>

                            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                                <table style={{ margin: '0' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '80px' }}>Orden</th>
                                            <th>Título</th>
                                            <th>Tipo</th>
                                            <th style={{ textAlign: 'right' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lessons.map((lesson, idx) => (
                                            <tr key={lesson.id}>
                                                <td style={{ fontWeight: '800' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={() => moveLesson(idx, -1)} disabled={idx === 0} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>▲</button>
                                                        <button onClick={() => moveLesson(idx, 1)} disabled={idx === lessons.length - 1} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>▼</button>
                                                    </div>
                                                </td>
                                                <td style={{ fontWeight: '700' }}>{lesson.title}</td>
                                                <td><span style={{ fontSize: '0.7rem', fontWeight: '800', background: 'var(--bg-secondary)', padding: '0.3rem 0.6rem', borderRadius: '6px' }}>{lesson.content_type?.toUpperCase()}</span></td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button onClick={() => setShowLessonModal(lesson)} style={{ color: 'var(--accent-primary)', border: 'none', background: 'none', fontWeight: '800', cursor: 'pointer', marginRight: '1rem' }}>Editar</button>
                                                    <button onClick={async () => { if(confirm('¿Eliminar lección?')) { await supabase.from('lessons').delete().eq('id', lesson.id); fetchLessons(selectedCourse.id); } }} style={{ color: '#ef4444', border: 'none', background: 'none', fontWeight: '800', cursor: 'pointer' }}>Eliminar</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {lessons.length === 0 && (
                                            <tr>
                                                <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)', fontWeight: '700' }}>Esta especialidad no tiene lecciones aún.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </main>
                <footer style={{ background: 'white', padding: '2rem 3rem', borderTop: '1px solid var(--border-soft)', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-dim)', fontWeight: '700', fontSize: '0.85rem' }}>© {new Date().getFullYear()} LMS Pro - Admin</p>
                </footer>
            </div>

            {showCourseModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 style={{ marginBottom: '2rem', fontWeight: '900' }}>{showCourseModal === 'create' ? 'Nueva Especialidad' : 'Editar Especialidad'}</h2>
                        <form onSubmit={handleSaveCourse} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <input name="title" className="input-premium" placeholder="Título" defaultValue={showCourseModal?.title || ''} required />
                            <textarea name="description" className="input-premium" placeholder="Descripción" rows="3" defaultValue={showCourseModal?.description || ''} required />
                            <input name="thumbnail_url" className="input-premium" placeholder="URL Imagen" defaultValue={showCourseModal?.thumbnail_url || ''} required />
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" className="btn-premium" style={{ flex: 1 }} onClick={() => setShowCourseModal(null)}>Cancelar</button>
                                <button type="submit" className="btn-premium btn-premium-primary" style={{ flex: 2 }}>Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showLessonModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 style={{ marginBottom: '2rem', fontWeight: '900' }}>{showLessonModal === 'create' ? 'Añadir Lección' : 'Editar Lección'}</h2>
                        <form onSubmit={handleSaveLesson} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <input name="title" className="input-premium" placeholder="Título" defaultValue={showLessonModal?.title || ''} required />
                            <select name="content_type" className="input-premium" defaultValue={showLessonModal?.content_type || 'video'}>
                                <option value="video">Video (YouTube)</option>
                                <option value="quiz">Cuestionario (JSON)</option>
                                <option value="link">Material/Enlace</option>
                            </select>
                            <textarea name="video_url" className="input-premium" placeholder="URL o JSON del cuestionario" rows="4" defaultValue={showLessonModal?.video_url || ''} required />
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" className="btn-premium" style={{ flex: 1 }} onClick={() => setShowLessonModal(null)}>Cancelar</button>
                                <button type="submit" className="btn-premium btn-premium-primary" style={{ flex: 2 }}>Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminCourses
