import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { adminSupabase } from '../../lib/adminSupabase'
import AdminSidebar from '../../components/AdminSidebar'

const ExpandableEnrollments = ({ enrollments, getCourseTitle, onEnrollClick, onUnenrollClick }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const safeEnrollments = enrollments || [];
    const hasMoreThanTwo = safeEnrollments.length > 2;
    const visibleEnrollments = isExpanded ? safeEnrollments : safeEnrollments.slice(0, 2);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {visibleEnrollments.map((enrollment, idx) => (
                    <div key={idx} style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.4rem', 
                        backgroundColor: enrollment.completed ? '#dcfce7' : 'var(--bg-secondary)', 
                        padding: '0.4rem 0.8rem', borderRadius: '10px', border: '1px solid var(--border-soft)',
                        color: enrollment.completed ? '#166534' : 'var(--text-main)', fontWeight: '700', fontSize: '0.75rem'
                    }}>
                        {getCourseTitle(enrollment.course_id)}
                        <button onClick={() => onUnenrollClick(enrollment.course_id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem' }}>×</button>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={onEnrollClick} style={{ color: 'var(--accent-primary)', background: 'none', border: 'none', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>+ Inscribir</button>
                {hasMoreThanTwo && <button onClick={() => setIsExpanded(!isExpanded)} style={{ color: 'var(--text-dim)', background: 'none', border: 'none', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}>{isExpanded ? 'Ver menos' : `+${safeEnrollments.length - 2} más`}</button>}
            </div>
        </div>
    );
};

function AdminUsers() {
    const location = useLocation();
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(null); // User object
    const [newUser, setNewUser] = useState({ email: '', password: '', full_name: '', role: 'student' });

    useEffect(() => {
        fetchUsers();
        fetchCourses();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const { data } = await supabase.from('profiles').select('*, enrollments(course_id, completed)').order('created_at', { ascending: false });
        if (data) setUsers(data);
        setLoading(false);
    };

    const fetchCourses = async () => {
        const { data } = await supabase.from('courses').select('id, title');
        if (data) setCourses(data);
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const { data, error } = await adminSupabase.auth.admin.createUser({
                email: newUser.email,
                password: newUser.password,
                user_metadata: { full_name: newUser.full_name },
                email_confirm: true
            });
            if (error) throw error;
            if (data.user) {
                await supabase.from('profiles').upsert({ id: data.user.id, full_name: newUser.full_name, role: newUser.role, email: newUser.email });
                alert('Usuario creado con éxito');
                setShowCreateModal(false);
                fetchUsers();
            }
        } catch (err) { alert(err.message); }
    };

    const handleEnroll = async (courseId) => {
        const { error } = await supabase.from('enrollments').insert([{ user_id: showEnrollModal.id, course_id: courseId }]);
        if (error) alert(error.message);
        else { setShowEnrollModal(null); fetchUsers(); }
    };

    const handleUnenroll = async (userId, courseId) => {
        if (!confirm('¿Retirar inscripción?')) return;
        const { error } = await supabase.from('enrollments').delete().eq('user_id', userId).eq('course_id', courseId);
        if (error) alert(error.message);
        else fetchUsers();
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('¿Eliminar usuario permanentemente?')) return;
        const { error } = await adminSupabase.auth.admin.deleteUser(userId);
        if (error) alert(error.message);
        else fetchUsers();
    };

    const getCourseTitle = (id) => courses.find(c => c.id === id)?.title || 'Cargando...';

    const filteredUsers = users.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
            <AdminSidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '280px' }}>
                <main style={{ flex: 1, padding: '2.5rem' }}>
                    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
                        <div>
                            <h1 style={{ fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-1px' }}>Gestión de <span style={{ color: 'var(--accent-primary)' }}>Usuarios</span></h1>
                            <p style={{ color: 'var(--text-dim)', fontWeight: '500' }}>Administra el acceso de la plataforma.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input className="input-premium" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '300px' }} />
                            <button className="btn-premium btn-premium-primary" onClick={() => setShowCreateModal(true)}>+ Nuevo Usuario</button>
                        </div>
                    </header>

                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        <table style={{ margin: '0' }}>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Correo</th>
                                    <th>Especialidades</th>
                                    <th>Rol</th>
                                    <th style={{ textAlign: 'center' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user.id}>
                                        <td style={{ fontWeight: '800' }}>{user.full_name}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <ExpandableEnrollments 
                                                enrollments={user.enrollments} 
                                                getCourseTitle={getCourseTitle}
                                                onEnrollClick={() => setShowEnrollModal(user)}
                                                onUnenrollClick={(cid) => handleUnenroll(user.id, cid)}
                                            />
                                        </td>
                                        <td>
                                            <span style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', background: user.role === 'admin' ? 'var(--bg-secondary)' : 'rgba(59, 130, 246, 0.1)', color: user.role === 'admin' ? 'var(--text-dim)' : 'var(--accent-primary)' }}>{user.role?.toUpperCase()}</span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button onClick={() => handleDeleteUser(user.id)} style={{ color: '#ef4444', fontWeight: '800', border: 'none', background: 'none', cursor: 'pointer' }}>Eliminar</button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)', fontWeight: '700' }}>No se encontraron usuarios.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {loading && <div style={{ padding: '4rem', textAlign: 'center' }}>Cargando...</div>}
                    </div>
                </main>
                <footer style={{ background: 'white', padding: '2rem 3rem', borderTop: '1px solid var(--border-soft)', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-dim)', fontWeight: '700', fontSize: '0.85rem' }}>© {new Date().getFullYear()} LMS Pro - Admin</p>
                </footer>
            </div>

            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 style={{ marginBottom: '2rem', fontWeight: '900' }}>Nuevo Usuario</h2>
                        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <input className="input-premium" placeholder="Nombre completo" value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} required />
                            <input className="input-premium" type="email" placeholder="Correo" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required />
                            <input className="input-premium" type="password" placeholder="Contraseña" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required />
                            <select className="input-premium" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                                <option value="student">Estudiante</option>
                                <option value="admin">Administrador</option>
                            </select>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn-premium" style={{ flex: 1 }} onClick={() => setShowCreateModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-premium btn-premium-primary" style={{ flex: 2 }}>Crear Usuario</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEnrollModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 style={{ marginBottom: '1rem', fontWeight: '900' }}>Inscribir a {showEnrollModal.full_name}</h2>
                        <p style={{ color: 'var(--text-dim)', marginBottom: '2rem', fontSize: '0.9rem' }}>Selecciona una especialidad para inscribir al usuario.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                            {courses.filter(c => !showEnrollModal.enrollments?.some(e => e.course_id === c.id)).map(course => (
                                <button key={course.id} onClick={() => handleEnroll(course.id)} className="btn-premium" style={{ textAlign: 'left', background: 'var(--bg-secondary)' }}>{course.title}</button>
                            ))}
                            {courses.filter(c => !showEnrollModal.enrollments?.some(e => e.course_id === c.id)).length === 0 && <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-dim)', fontWeight: '600' }}>Ya está inscrito en todas las especialidades.</p>}
                        </div>
                        <button className="btn-premium" style={{ width: '100%', marginTop: '2rem' }} onClick={() => setShowEnrollModal(null)}>Cerrar</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminUsers;
