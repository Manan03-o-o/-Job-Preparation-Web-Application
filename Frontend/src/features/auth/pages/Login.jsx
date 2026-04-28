import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
    const { loading, handleLogin } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [mounted, setMounted] = useState(false);
    const [typedText, setTypedText] = useState('');
    const [currentPhraseIdx, setCurrentPhraseIdx] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    const phrases = [
        'Ace your next interview.',
        'Practice with AI precision.',
        'Build confidence daily.',
        'Land your dream job.',
        'Master any question.',
    ];

    // Typewriter effect
    useEffect(() => {
        const currentPhrase = phrases[currentPhraseIdx];
        let timeout;

        if (!isDeleting && typedText === currentPhrase) {
            timeout = setTimeout(() => setIsDeleting(true), 2000);
        } else if (isDeleting && typedText === '') {
            setIsDeleting(false);
            setCurrentPhraseIdx((prev) => (prev + 1) % phrases.length);
        } else {
            timeout = setTimeout(() => {
                setTypedText(
                    isDeleting
                        ? currentPhrase.substring(0, typedText.length - 1)
                        : currentPhrase.substring(0, typedText.length + 1)
                );
            }, isDeleting ? 35 : 70);
        }

        return () => clearTimeout(timeout);
    }, [typedText, isDeleting, currentPhraseIdx]);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({
            x: ((e.clientX - rect.left) / rect.width - 0.5) * 12,
            y: ((e.clientY - rect.top) / rect.height - 0.5) * 12,
        });
    };

    const handleMouseLeave = () => setMousePos({ x: 0, y: 0 });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await handleLogin({ email, password });
            navigate('/');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <main style={styles.loadingMain}>
                <style>{keyframes}</style>
                <div style={styles.loadingContainer}>
                    <div style={styles.neuralLoader}>
                        <div style={styles.neuralDot1} />
                        <div style={styles.neuralDot2} />
                        <div style={styles.neuralDot3} />
                    </div>
                    <p style={styles.loadingText}>Initializing AI...</p>
                </div>
            </main>
        );
    }

    return (
        <main style={styles.main}>
            <style>{keyframes}</style>

            {/* Background gradient orbs */}
            <div style={{ ...styles.orb, ...styles.orb1 }} />
            <div style={{ ...styles.orb, ...styles.orb2 }} />
            <div style={{ ...styles.orb, ...styles.orb3 }} />

            {/* Floating AI keywords */}
            {['Neural', 'GPT', 'AI', 'ML', 'Deep Learning', 'NLP', 'Transformer'].map((word, i) => (
                <span key={word} style={{
                    ...styles.floatingWord,
                    top: `${10 + (i * 13) % 80}%`,
                    left: `${5 + (i * 17) % 85}%`,
                    animationDelay: `${i * 0.7}s`,
                    animationDuration: `${8 + i * 2}s`,
                    fontSize: `${0.7 + Math.random() * 0.5}rem`,
                }}>
                    {word}
                </span>
            ))}

            <div style={styles.contentWrapper}>
                {/* Left branding section */}
                <div style={{
                    ...styles.brandSection,
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateX(0)' : 'translateX(-40px)',
                }}>
                    <div style={styles.brandBadge}>
                        <div style={styles.aiBrain}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e1034d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                <path d="M6 12v5c3 3 9 3 12 0v-5" />
                            </svg>
                        </div>
                        <span style={styles.brandName}>Prepify</span>
                    </div>

                    <h2 style={styles.brandTitle}>Your AI Interview Coach</h2>

                    <div style={styles.typewriterContainer}>
                        <span style={styles.typewriterText}>{typedText}</span>
                        <span style={styles.cursor}>|</span>
                    </div>

                    <div style={styles.statsRow}>
                        <div style={{
                            ...styles.statItem,
                            animationDelay: '0.8s',
                        }}>
                            <span style={styles.statNum}>Realistic Practice</span>
                            <span style={styles.statLabel}>AI-generated, up-to-date questions</span>
                        </div>
                        <div style={{
                            ...styles.statItem,
                            animationDelay: '0.95s',
                        }}>
                            <span style={styles.statNum}>Personalized Feedback</span>
                            <span style={styles.statLabel}>Actionable insights for every answer</span>
                        </div>
                    </div>
                </div>

                {/* Login card */}
                <div
                    style={{
                        ...styles.cardOuter,
                        opacity: mounted ? 1 : 0,
                        transform: mounted
                            ? `perspective(1000px) rotateY(${mousePos.x * 0.15}deg) rotateX(${-mousePos.y * 0.15}deg) translateY(0)`
                            : 'perspective(1000px) translateY(50px)',
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    <div style={styles.cardGlow} />
                    <div style={styles.card}>
                        <div style={styles.topAccent} />

                        <div style={styles.cardHeader}>
                            <h1 style={styles.title}>Sign In</h1>
                            <p style={styles.subtitle}>Continue your prep journey</p>
                        </div>

                        <form onSubmit={handleSubmit} autoComplete="off">
                            {/* Email */}
                            <div style={{
                                ...styles.inputGroup,
                                ...(focusedField === 'email' ? styles.inputGroupFocused : {}),
                                animationDelay: '0.4s',
                            }}>
                                <div style={styles.inputIconBox}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                        stroke={focusedField === 'email' ? '#e1034d' : '#555'}
                                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                        style={{ transition: 'all 0.3s ease' }}>
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </div>
                                <div style={styles.inputWrapper}>
                                    <input
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        type="email" id="email" name="email"
                                        placeholder=" " autoComplete="email" required
                                        style={styles.input}
                                    />
                                    <label htmlFor="email" style={{
                                        ...styles.label,
                                        ...(email || focusedField === 'email' ? styles.labelActive : {}),
                                        color: focusedField === 'email' ? '#e1034d' : email ? '#999' : '#555',
                                    }}>Email Address</label>
                                </div>
                                <div style={{
                                    ...styles.underline,
                                    transform: focusedField === 'email' ? 'scaleX(1)' : 'scaleX(0)',
                                }} />
                            </div>

                            {/* Password */}
                            <div style={{
                                ...styles.inputGroup,
                                ...(focusedField === 'password' ? styles.inputGroupFocused : {}),
                                animationDelay: '0.5s',
                            }}>
                                <div style={styles.inputIconBox}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                        stroke={focusedField === 'password' ? '#e1034d' : '#555'}
                                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                        style={{ transition: 'all 0.3s ease' }}>
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </div>
                                <div style={styles.inputWrapper}>
                                    <input
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        type={showPassword ? 'text' : 'password'}
                                        id="password" name="password"
                                        placeholder=" " autoComplete="current-password" required
                                        style={styles.input}
                                    />
                                    <label htmlFor="password" style={{
                                        ...styles.label,
                                        ...(password || focusedField === 'password' ? styles.labelActive : {}),
                                        color: focusedField === 'password' ? '#e1034d' : password ? '#999' : '#555',
                                    }}>Password</label>
                                </div>
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    style={styles.eyeBtn} tabIndex={-1}>
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                                <div style={{
                                    ...styles.underline,
                                    transform: focusedField === 'password' ? 'scaleX(1)' : 'scaleX(0)',
                                }} />
                            </div>

                            {/* Forgot password */}
                            <div style={styles.forgotRow}>
                                <Link to="/forgot-password" style={styles.forgotLink}
                                    onMouseEnter={e => e.currentTarget.style.color = '#e1034d'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#666'}>
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit */}
                            <button type="submit" disabled={isSubmitting}
                                style={{
                                    ...styles.submitBtn,
                                    ...(isSubmitting ? { opacity: 0.7, cursor: 'not-allowed' } : {}),
                                }}
                                onMouseEnter={e => {
                                    if (!isSubmitting) {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 10px 35px rgba(225,3,77,0.5)';
                                    }
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 25px rgba(225,3,77,0.35)';
                                }}>
                                {isSubmitting ? (
                                    <div style={styles.btnSpinner} />
                                ) : (
                                    <span style={styles.btnContent}>
                                        Start Practicing
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }}>
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                            <polyline points="12 5 19 12 12 19" />
                                        </svg>
                                    </span>
                                )}
                            </button>
                        </form>

                        <p style={styles.registerText}>
                            New to Prepify?{' '}
                            <Link to="/register" style={styles.registerLink}
                                onMouseEnter={e => e.currentTarget.style.textShadow = '0 0 15px rgba(225,3,77,0.5)'}
                                onMouseLeave={e => e.currentTarget.style.textShadow = 'none'}>
                                Create Account →
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
};

const keyframes = `
    @keyframes float1 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(60px, -80px) scale(1.1); }
        66% { transform: translate(-40px, -40px) scale(0.95); }
    }
    @keyframes float2 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(-70px, 60px) scale(1.15); }
        66% { transform: translate(50px, -30px) scale(0.9); }
    }
    @keyframes float3 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(50px, 50px) scale(1.05); }
        66% { transform: translate(-30px, 40px) scale(0.95); }
    }
    @keyframes floatWord {
        0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.06; }
        50% { transform: translateY(-20px) rotate(3deg); opacity: 0.12; }
    }
    @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
    }
    @keyframes slideUp {
        from { opacity: 0; transform: translateY(25px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideRight {
        from { opacity: 0; transform: translateX(-25px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes topAccentAnim {
        0% { width: 0; opacity: 0; }
        100% { width: 50px; opacity: 1; }
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    @keyframes shimmer {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
    }
    @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.6; }
        50% { transform: scale(1.3); opacity: 1; }
    }
    @keyframes neuralPulse {
        0%, 100% { transform: scale(0.8); opacity: 0.3; }
        50% { transform: scale(1.2); opacity: 1; }
    }
    @keyframes statSlide {
        from { opacity: 0; transform: translateY(15px) scale(0.9); }
        to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes brainGlow {
        0%, 100% { filter: drop-shadow(0 0 8px rgba(225,3,77,0.3)); }
        50% { filter: drop-shadow(0 0 20px rgba(225,3,77,0.7)); }
    }
`;

const styles = {
    main: {
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(145deg, #06060a 0%, #0d0d14 30%, #12080e 60%, #08080f 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: "'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif",
    },
    orb: {
        position: 'absolute',
        borderRadius: '50%',
        filter: 'blur(100px)',
        pointerEvents: 'none',
        zIndex: 0,
    },
    orb1: {
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(225,3,77,0.12) 0%, transparent 70%)',
        top: '-15%', right: '-10%',
        animation: 'float1 20s ease-in-out infinite',
    },
    orb2: {
        width: 450, height: 450,
        background: 'radial-gradient(circle, rgba(80,120,255,0.08) 0%, transparent 70%)',
        bottom: '-15%', left: '-10%',
        animation: 'float2 25s ease-in-out infinite',
    },
    orb3: {
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(150,80,255,0.06) 0%, transparent 60%)',
        top: '20%', left: '30%',
        animation: 'float3 22s ease-in-out infinite',
    },
    floatingWord: {
        position: 'absolute',
        color: 'rgba(255,255,255,0.06)',
        fontWeight: 700,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        pointerEvents: 'none',
        zIndex: 0,
        animation: 'floatWord 8s ease-in-out infinite',
        userSelect: 'none',
    },
    contentWrapper: {
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: '4rem',
        maxWidth: 950,
        width: '100%',
        padding: '2rem',
    },
    // Brand section
    brandSection: {
        flex: 1,
        transition: 'all 1s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    brandBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.7rem',
        animation: 'slideRight 0.6s ease-out 0.2s both',
    },
    aiBrain: {
        width: 48, height: 48,
        borderRadius: '0.8rem',
        background: 'rgba(225,3,77,0.1)',
        border: '1px solid rgba(225,3,77,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'brainGlow 3s ease-in-out infinite',
    },
    brandName: {
        fontSize: '1.6rem',
        fontWeight: 800,
        background: 'linear-gradient(135deg, #e1034d, #ff6b6b)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '-0.5px',
    },
    brandTitle: {
        fontSize: '2.2rem',
        fontWeight: 700,
        color: 'white',
        lineHeight: 1.2,
        letterSpacing: '-0.5px',
        margin: 0,
        animation: 'slideRight 0.6s ease-out 0.35s both',
    },
    typewriterContainer: {
        minHeight: '2rem',
        animation: 'slideRight 0.6s ease-out 0.5s both',
    },
    typewriterText: {
        fontSize: '1.15rem',
        color: '#888',
        fontWeight: 400,
    },
    cursor: {
        color: '#e1034d',
        fontWeight: 300,
        fontSize: '1.3rem',
        animation: 'blink 1s step-end infinite',
        marginLeft: '2px',
    },
    statsRow: {
        display: 'flex',
        gap: '1.5rem',
        marginTop: '0.5rem',
    },
    statItem: {
        display: 'flex',
        flexDirection: 'column',
        padding: '0.8rem 1.2rem',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '0.8rem',
        border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(10px)',
        animation: 'statSlide 0.5s ease-out both',
    },
    statNum: {
        fontSize: '1.3rem',
        fontWeight: 700,
        color: '#e1034d',
    },
    statLabel: {
        fontSize: '0.75rem',
        color: '#666',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginTop: '0.15rem',
    },
    // Card
    cardOuter: {
        position: 'relative',
        transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1)',
        transformStyle: 'preserve-3d',
        flex: '0 0 400px',
    },
    cardGlow: {
        position: 'absolute',
        top: -30, left: -30, right: -30, bottom: -30,
        borderRadius: '2rem',
        background: 'radial-gradient(ellipse at center, rgba(225,3,77,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: -1,
    },
    card: {
        background: 'rgba(14, 14, 20, 0.75)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderRadius: '1.4rem',
        border: '1px solid rgba(255,255,255,0.06)',
        padding: '2.5rem 2.2rem',
        boxShadow: '0 30px 70px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
        position: 'relative',
        overflow: 'hidden',
    },
    topAccent: {
        position: 'absolute',
        top: 0, left: '50%',
        transform: 'translateX(-50%)',
        height: 2,
        background: 'linear-gradient(90deg, transparent, #e1034d, transparent)',
        borderRadius: '0 0 4px 4px',
        animation: 'topAccentAnim 1s ease-out 0.3s both',
    },
    cardHeader: {
        marginBottom: '2rem',
        animation: 'slideUp 0.5s ease-out 0.3s both',
    },
    title: {
        margin: 0,
        fontSize: '1.7rem',
        fontWeight: 700,
        color: 'white',
        letterSpacing: '-0.3px',
    },
    subtitle: {
        margin: '0.3rem 0 0',
        fontSize: '0.9rem',
        color: '#666',
        fontWeight: 400,
    },
    inputGroup: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.025)',
        borderRadius: '0.75rem',
        border: '1.5px solid rgba(255,255,255,0.06)',
        marginBottom: '1rem',
        transition: 'all 0.35s ease',
        overflow: 'hidden',
        animation: 'slideUp 0.5s ease-out both',
    },
    inputGroupFocused: {
        borderColor: 'rgba(225,3,77,0.4)',
        background: 'rgba(225,3,77,0.02)',
        boxShadow: '0 0 25px rgba(225,3,77,0.08), inset 0 0 15px rgba(225,3,77,0.02)',
    },
    inputIconBox: {
        padding: '0 0 0 0.9rem',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
    },
    inputWrapper: {
        position: 'relative',
        flex: 1,
    },
    input: {
        width: '100%',
        padding: '1.1rem 0.9rem 0.55rem',
        background: 'rgba(255,255,255,0.07)',
        border: 'none',
        outline: 'none',
        color: 'white',
        fontSize: '0.95rem',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
        transition: 'background 0.2s',
    },
    label: {
        position: 'absolute',
        left: '0.9rem',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '0.9rem',
        color: '#555',
        pointerEvents: 'none',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        fontWeight: 400,
    },
    labelActive: {
        top: '0.4rem',
        transform: 'translateY(0)',
        fontSize: '0.68rem',
        fontWeight: 600,
        letterSpacing: '0.3px',
    },
    underline: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: 2,
        background: 'linear-gradient(90deg, #e1034d, #ff6b6b, #e1034d)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s linear infinite',
        transition: 'transform 0.35s ease',
        transformOrigin: 'center',
    },
    eyeBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '0 0.9rem',
        display: 'flex',
        alignItems: 'center',
        opacity: 0.5,
        transition: 'opacity 0.2s',
    },
    forgotRow: {
        textAlign: 'right',
        marginBottom: '1.5rem',
        animation: 'slideUp 0.5s ease-out 0.55s both',
    },
    forgotLink: {
        color: '#666',
        fontSize: '0.82rem',
        textDecoration: 'none',
        fontWeight: 500,
        transition: 'color 0.2s ease',
    },
    submitBtn: {
        width: '100%',
        padding: '0.95rem 0',
        background: 'linear-gradient(135deg, #e1034d 0%, #b8023e 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '0.75rem',
        fontSize: '1rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 25px rgba(225,3,77,0.35)',
        fontFamily: 'inherit',
        letterSpacing: '0.2px',
        position: 'relative',
        overflow: 'hidden',
        animation: 'slideUp 0.5s ease-out 0.6s both',
    },
    btnContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnSpinner: {
        width: 22, height: 22,
        border: '3px solid rgba(255,255,255,0.3)',
        borderTop: '3px solid white',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        margin: '0 auto',
    },
    registerText: {
        textAlign: 'center',
        color: '#666',
        fontSize: '0.9rem',
        marginTop: '1.5rem',
        marginBottom: 0,
        animation: 'slideUp 0.5s ease-out 0.7s both',
    },
    registerLink: {
        color: '#e1034d',
        fontWeight: 600,
        textDecoration: 'none',
        transition: 'all 0.3s ease',
    },
    // Loading
    loadingMain: {
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(145deg, #06060a, #0d0d14)',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
    },
    neuralLoader: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
    },
    neuralDot1: {
        width: 12, height: 12,
        borderRadius: '50%',
        background: '#e1034d',
        animation: 'neuralPulse 1.4s ease-in-out infinite',
    },
    neuralDot2: {
        width: 12, height: 12,
        borderRadius: '50%',
        background: '#ff6b6b',
        animation: 'neuralPulse 1.4s ease-in-out 0.2s infinite',
    },
    neuralDot3: {
        width: 12, height: 12,
        borderRadius: '50%',
        background: '#e1034d',
        animation: 'neuralPulse 1.4s ease-in-out 0.4s infinite',
    },
    loadingText: {
        color: '#888',
        fontSize: '1rem',
        fontWeight: 500,
        letterSpacing: '3px',
        textTransform: 'uppercase',
        background: 'linear-gradient(90deg, #666, #e1034d, #666)',
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: 'shimmer 2s linear infinite',
    },
};

export default Login;