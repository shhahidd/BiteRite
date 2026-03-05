import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Eye, EyeOff, Activity, ShieldCheck, Zap } from 'lucide-react';

const Auth = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                const { data, error } = await supabase
                    .from('admin')
                    .select('*')
                    .eq('emailid', email)
                    .eq('password', password)
                    .single();

                if (error || !data) {
                    throw new Error('Invalid email or password');
                }
                onLogin(data);
            } else {
                const { data, error } = await supabase
                    .from('admin')
                    .insert([
                        { username, emailid: email, password }
                    ])
                    .select()
                    .single();

                if (error) throw error;
                onLogin(data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: 'var(--bg-color)',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Background Effects */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                left: '-10%',
                width: '50vw',
                height: '50vw',
                background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 60%)',
                filter: 'blur(100px)',
                zIndex: 0
            }}></div>
            <div style={{
                position: 'absolute',
                bottom: '-20%',
                right: '-10%',
                width: '60vw',
                height: '60vw',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 60%)',
                filter: 'blur(120px)',
                zIndex: 0
            }}></div>

            {/* Left Side - Branding (Desktop Only) */}
            <div className="auth-branding" style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem',
                zIndex: 1,
                borderRight: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(15, 23, 42, 0.4)'
            }}>
                <div style={{ maxWidth: '500px' }}>
                    <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--neon-cyan)', borderRadius: '16px', marginBottom: '2rem', boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)' }}>
                        <Activity size={32} color="black" />
                    </div>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', background: 'linear-gradient(135deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: '1.2' }}>
                        Welcome to BiteRite.
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '3rem', lineHeight: '1.6' }}>
                        Your intelligent, data-driven nutritional companion. Log meals, track macros, and achieve your health goals with AI-powered insights.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '10px', color: 'var(--neon-blue)' }}><Zap size={20} /></div>
                            <div>
                                <h4 style={{ color: 'white', marginBottom: '0.2rem' }}>AI Meal Suggestions</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Get personalized recipes based on what's in your fridge.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '10px', color: 'var(--neon-green)' }}><ShieldCheck size={20} /></div>
                            <div>
                                <h4 style={{ color: 'white', marginBottom: '0.2rem' }}>Data Privacy First</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Your logs and macros are isolated and secured locally.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2rem',
                zIndex: 1
            }}>
                <div className="glass-panel" style={{
                    maxWidth: '420px',
                    width: '100%',
                    padding: '3rem 2.5rem',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    borderLeft: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(18, 25, 43, 0.65)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'white', fontSize: '2rem' }}>
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
                        {isLogin ? 'Enter your details to access your dashboard.' : 'Start your journey to better nutrition today.'}
                    </p>

                    <form onSubmit={handleAuth}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {!isLogin && (
                                <div className="auth-form-group">
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Username</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="fitness_guru"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        style={{ height: '50px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}
                                    />
                                </div>
                            )}
                            <div className="auth-form-group">
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Email Address</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{ height: '50px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}
                                />
                            </div>
                            <div className="auth-form-group">
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-control"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        style={{ height: '50px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', paddingRight: '45px', width: '100%' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '15px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--text-muted)',
                                            cursor: 'pointer',
                                            padding: 0,
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid var(--neon-red)', padding: '10px 15px', color: 'white', fontSize: '0.85rem', marginTop: '1.5rem', borderRadius: '0 4px 4px 0' }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{
                                width: '100%',
                                marginTop: '2rem',
                                height: '50px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-blue))',
                                border: 'none',
                                boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)'
                            }}
                        >
                            {loading ? 'Processing...' : (isLogin ? 'Sign In to Dashboard' : 'Create Free Account')}
                        </button>

                        <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                {isLogin ? "New to BiteRite? " : "Already tracking? "}
                                <button
                                    type="button"
                                    onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--neon-cyan)',
                                        cursor: 'pointer',
                                        padding: 0,
                                        fontSize: '0.9rem',
                                        fontWeight: 'bold',
                                        textDecoration: 'underline',
                                        textUnderlineOffset: '4px'
                                    }}
                                >
                                    {isLogin ? 'Sign Up' : 'Log In'}
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
            {/* Adding basic responsive hiding logic inside the component via inline style fallback */}
            <style>
                {`
                    @media (max-width: 900px) {
                        .auth-branding {
                            display: none !important;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default Auth;

