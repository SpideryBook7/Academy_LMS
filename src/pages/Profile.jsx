import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const Profile = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)

    const [fullName, setFullName] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')
    const [description, setDescription] = useState('')
    const [email, setEmail] = useState('')

    useEffect(() => {
        const getProfile = async () => {
            setLoading(true)
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) { navigate('/') } else {
                setEmail(session.user.email)
                const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
                if (data) {
                    setFullName(data.full_name || '')
                    setAvatarUrl(data.avatar_url || '')
                    setDescription(data.description || '')
                }
            }
            setLoading(false)
        }
        getProfile()
    }, [navigate])

    const uploadAvatar = async (event) => {
        try {
            setUploading(true)
            const file = event.target.files[0]
            const filePath = `${Math.random()}.${file.name.split('.').pop()}`
            const { error } = await supabase.storage.from('avatars').upload(filePath, file)
            if (error) throw error
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
            setAvatarUrl(data.publicUrl)
        } catch (error) { alert(error.message) } finally { setUploading(false) }
    }

    const updateProfile = async (e) => {
        e.preventDefault()
        setSaving(true)
        const { data: { session } } = await supabase.auth.getSession()
        const { error } = await supabase.from('profiles').upsert({ id: session.user.id, full_name: fullName, avatar_url: avatarUrl, description: description })
        if (!error) alert('Perfil actualizado')
        setSaving(false)
    }

    if (loading) return <div style={{ background: 'var(--bg-main)', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><p style={{ fontWeight: '800' }}>Cargando perfil...</p></div>

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '280px' }}>
                <main style={{ flex: 1, padding: '2.5rem' }}>
                    <header style={{ marginBottom: '3rem' }}>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-1px' }}>
                            Mi <span style={{ color: 'var(--accent-primary)' }}>Perfil</span>
                        </h1>
                        <p style={{ color: 'var(--text-dim)', fontWeight: '500' }}>Administra tu información personal.</p>
                    </header>

                    <div className="card" style={{ maxWidth: '900px', padding: '3rem', display: 'grid', gridTemplateColumns: '250px 1fr', gap: '3rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <img src={avatarUrl || `https://ui-avatars.com/api/?name=U&background=3b82f6&color=fff`} style={{ width: '180px', height: '180px', borderRadius: '32px', objectFit: 'cover', border: '4px solid white', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }} alt="Avatar" />
                            <label style={{ display: 'inline-block', marginTop: '1.5rem', background: 'var(--bg-secondary)', padding: '0.6rem 1.2rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}>
                                {uploading ? 'Subiendo...' : 'Cambiar Imagen'}
                                <input type="file" onChange={uploadAvatar} style={{ display: 'none' }} />
                            </label>
                            <h3 style={{ marginTop: '2rem', fontWeight: '900' }}>{fullName || 'Usuario'}</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '600' }}>{email}</p>
                        </div>

                        <form onSubmit={updateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '0.6rem', display: 'block' }}>Nombre Completo</label>
                                <input className="input-premium" value={fullName} onChange={e => setFullName(e.target.value)} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '0.6rem', display: 'block' }}>Biografía</label>
                                <textarea className="input-premium" rows="4" value={description} onChange={e => setDescription(e.target.value)} style={{ resize: 'none' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn-premium btn-premium-primary" style={{ flex: 2 }}>{saving ? 'Guardando...' : 'Guardar Cambios'}</button>
                                <button type="button" onClick={() => supabase.auth.signOut().then(() => navigate('/'))} className="btn-premium" style={{ flex: 1, color: '#ef4444' }}>Cerrar Sesión</button>
                            </div>
                        </form>
                    </div>
                </main>
                <footer style={{ background: 'white', padding: '2rem 3rem', borderTop: '1px solid var(--border-soft)', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-dim)', fontWeight: '700', fontSize: '0.85rem' }}>© {new Date().getFullYear()} LMS Pro - Tu plataforma de aprendizaje continuo</p>
                </footer>
            </div>
        </div>
    )
}

export default Profile
