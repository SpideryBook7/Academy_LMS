import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const Home = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            const { data: { user } } = await supabase.auth.getUser();
            const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
            if (profile?.role === "admin") navigate("/admin/dashboard");
            else navigate("/dashboard");
        } catch (error) {
            alert("Acceso denegado: Por favor verifica tus credenciales");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            background: 'var(--bg-main)',
            color: 'var(--text-main)',
            fontFamily: 'var(--font-family)'
        }}>
            {/* Left Column: Vision & Hero */}
            <div style={{
                flex: 1.2,
                padding: '5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                background: 'white',
                borderRight: '1px solid var(--border-soft)'
            }}>
                <div style={{ marginBottom: '4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                        <div style={{ 
                            width: '48px', height: '48px', background: 'var(--accent-primary)', borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900'
                        }}>🎓</div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-1px' }}>LMS <span style={{ color: 'var(--accent-primary)' }}>PRO</span></h1>
                    </div>
                    <h2 style={{ fontSize: '4rem', fontWeight: '900', lineHeight: '1', marginBottom: '2rem', letterSpacing: '-2px' }}>
                        Transforma tu <span style={{ color: 'var(--accent-primary)' }}>Futuro</span> Académico
                    </h2>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', maxWidth: '500px', lineHeight: '1.6' }}>
                        La plataforma de gestión de aprendizaje diseñada para la excelencia, el crecimiento y la innovación educativa.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '4rem' }}>
                    <div>
                        <p style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-main)' }}>100%</p>
                        <p style={{ color: 'var(--text-dim)', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase' }}>Cloud Native</p>
                    </div>
                    <div style={{ width: '1px', background: 'var(--border-soft)' }} />
                    <div>
                        <p style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-main)' }}>24/7</p>
                        <p style={{ color: 'var(--text-dim)', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase' }}>Disponibilidad</p>
                    </div>
                </div>
            </div>

            {/* Right Column: Auth Panel */}
            <div style={{
                flex: 0.8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem'
            }}>
                <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '3rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>Iniciar Sesión</h3>
                        <p style={{ color: 'var(--text-dim)', fontWeight: '600' }}>Accede a tu panel personalizado</p>
                    </div>

                    <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Email Corporativo</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="usuario@lms.com"
                                required
                                className="input-premium"
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="input-premium"
                            />
                        </div>

                        <button type="submit" disabled={loading} className="btn-premium btn-premium-primary" style={{ marginTop: '1rem', width: '100%', padding: '1rem' }}>
                            {loading ? "Verificando..." : "Entrar al Sistema"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Home;
