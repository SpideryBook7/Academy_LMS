import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const Calendar = () => {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [avatarUrl, setAvatarUrl] = useState(null)
    const [userRole, setUserRole] = useState(null)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(new Date())

    const [events, setEvents] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [newEvent, setNewEvent] = useState({ title: '', time: '12:00', type: 'event' })

    const fetchEvents = async (userId) => {
        const { data } = await supabase.from('calendar_events').select('*').eq('user_id', userId)
        if (data) setEvents(data.map(e => ({ ...e, date: new Date(e.start_time) })))
    }

    const handleCreateEvent = async (e) => {
        e.preventDefault()
        if (!user) return
        const [hours, minutes] = newEvent.time.split(':')
        const startDateTime = new Date(selectedDate)
        startDateTime.setHours(parseInt(hours), parseInt(minutes))

        const { data, error } = await supabase.from('calendar_events').insert([{
            user_id: user.id,
            title: newEvent.title,
            start_time: startDateTime.toISOString(),
            type: newEvent.type,
            color: '#3b82f6'
        }]).select()

        if (data) {
            setEvents([...events, { ...data[0], date: new Date(data[0].start_time) }])
            setShowModal(false)
            setNewEvent({ title: '', time: '12:00', type: 'event' })
        }
    }

    const handleDeleteEvent = async (eventId) => {
        if (!confirm('¿Eliminar evento?')) return
        const { error } = await supabase.from('calendar_events').delete().eq('id', eventId)
        if (!error) setEvents(events.filter(e => e.id !== eventId))
    }

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) { navigate('/') } else {
                setUser(session.user)
                const { data } = await supabase.from('profiles').select('avatar_url, role').eq('id', session.user.id).single()
                if (data) { setAvatarUrl(data.avatar_url); setUserRole(data.role); }
                fetchEvents(session.user.id)
            }
        }
        getUser()
    }, [navigate])

    const renderCalendarGrid = () => {
        const days = []
        const today = new Date()
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
        const startingDay = firstDayOfMonth.getDay()

        for (let i = 0; i < startingDay; i++) {
            days.push(<div key={`empty-${i}`} style={{ height: '80px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-soft)' }}></div>)
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()
            const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth()
            const dayEvents = events.filter(e => e.date.getDate() === day && e.date.getMonth() === currentDate.getMonth())

            days.push(
                <div key={day} onClick={() => setSelectedDate(currentDayDate)} className="card" style={{ 
                    height: '80px', padding: '0.5rem', cursor: 'pointer', borderRadius: '0', margin: '0', 
                    border: '1px solid var(--border-soft)', background: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'white',
                    display: 'flex', flexDirection: 'column', gap: '4px'
                }}>
                    <span style={{ 
                        fontSize: '0.8rem', fontWeight: '800', width: '24px', height: '24px', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', borderRadius: '6px',
                        background: isToday ? 'var(--accent-primary)' : 'transparent',
                        color: isToday ? 'white' : 'var(--text-main)'
                    }}>{day}</span>
                    {dayEvents.slice(0, 2).map((e, idx) => (
                        <div key={idx} style={{ fontSize: '0.65rem', background: 'var(--bg-secondary)', padding: '2px 4px', borderRadius: '4px', borderLeft: '3px solid var(--accent-primary)', overflow: 'hidden', whiteSpace: 'nowrap' }}>{e.title}</div>
                    ))}
                </div>
            )
        }
        return days
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '280px' }}>
                <main style={{ flex: 1, padding: '2.5rem' }}>
                    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                        <div>
                            <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-1px' }}>
                                Mi <span style={{ color: 'var(--accent-primary)' }}>Calendario</span>
                            </h1>
                            <p style={{ color: 'var(--text-dim)', fontWeight: '500' }}>Organiza tus actividades académicas.</p>
                        </div>
                        <div onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                            <img src={avatarUrl || `https://ui-avatars.com/api/?name=U&background=3b82f6&color=fff`} style={{ width: '48px', height: '48px', borderRadius: '12px' }} alt="User" />
                        </div>
                    </header>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2rem', minHeight: '600px' }}>
                        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: '900', textTransform: 'capitalize' }}>{currentDate.toLocaleString('es-MX', { month: 'long', year: 'numeric' })}</h2>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn-premium" style={{ padding: '0.5rem' }} onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>←</button>
                                    <button className="btn-premium" style={{ padding: '0.5rem' }} onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>→</button>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                                {['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'].map(d => <div key={d}>{d}</div>)}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', border: '1px solid var(--border-soft)', borderRadius: '12px', overflow: 'hidden', flex: 1 }}>
                                {renderCalendarGrid()}
                            </div>
                        </div>

                        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '900', marginBottom: '1rem' }}>Agenda del día</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '1.5rem', fontWeight: '600' }}>{selectedDate.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                            
                            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {events.filter(e => e.date.toDateString() === selectedDate.toDateString()).map(e => (
                                    <div key={e.id} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px', borderLeft: '4px solid var(--accent-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ fontWeight: '800', fontSize: '0.9rem' }}>{e.title}</h4>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{e.date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} • {e.type}</p>
                                        </div>
                                        <button onClick={() => handleDeleteEvent(e.id)} style={{ color: '#ef4444', fontWeight: '900', border: 'none', background: 'none', cursor: 'pointer' }}>×</button>
                                    </div>
                                ))}
                                {events.filter(e => e.date.toDateString() === selectedDate.toDateString()).length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textAlign: 'center', marginTop: '2rem' }}>No hay eventos para hoy.</p>}
                            </div>
                            
                            <button className="btn-premium btn-premium-primary" style={{ marginTop: '1.5rem', width: '100%' }} onClick={() => setShowModal(true)}>+ Nuevo Evento</button>
                        </div>
                    </div>
                </main>
                <footer style={{ background: 'white', padding: '2rem 3rem', borderTop: '1px solid var(--border-soft)', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-dim)', fontWeight: '700', fontSize: '0.85rem' }}>© {new Date().getFullYear()} LMS Pro - Tu plataforma de aprendizaje continuo</p>
                </footer>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '400px' }}>
                        <h2 style={{ marginBottom: '2rem', fontWeight: '900' }}>Nuevo Evento</h2>
                        <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '0.5rem', display: 'block' }}>Título</label>
                                <input className="input-premium" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} required />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '0.5rem', display: 'block' }}>Hora</label>
                                    <input type="time" className="input-premium" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} required />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '0.5rem', display: 'block' }}>Tipo</label>
                                    <select className="input-premium" value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})}>
                                        <option value="event">Evento</option>
                                        <option value="deadline">Entrega</option>
                                        <option value="exam">Examen</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn-premium" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-premium btn-premium-primary" style={{ flex: 1 }}>Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Calendar
