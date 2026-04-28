import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
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
    const [passwordStrength, setPasswordStrength] = useState(0);

    const { loading, handleRegister } = useAuth();

    const phrases = [
        'Begin your AI journey today.',
        'Unlimited mock interviews.',
        'Personalized feedback instantly.',
        'Crack any technical round.',
        'From beginner to pro.',
    ];

    // Password strength calculator
    useEffect(() => {
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 10) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        setPasswordStrength(strength);
    }, [password]);

    const getStrengthColor = () => {
        if (passwordStrength <= 1) return '#ff4444';
        if (passwordStrength <= 2) return '#ffaa00';
        if (passwordStrength <= 3) return '#ffdd00';
        return '#44ff88';
    };

    const getStrengthLabel = () => {
        if (!password) return '';
        if (passwordStrength <= 1) return 'Weak';
        if (passwordStrength <= 2) return 'Fair';
        if (passwordStrength <= 3) return 'Good';
        return 'Strong';
    };

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
            await handleRegister({ username, email, password });
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
                    <p style={styles.loadingText}>Setting things up...</p>
                </div>
            </main>
        );
    }

    return (
        <main style={styles.main}>
            <style>{keyframes}</style>

            <div style={{ ...styles.orb, ...styles.orb1 }} />
            <div style={{ ...styles.orb, ...styles.orb2 }} />
            <div style={{ ...styles.orb, ...styles.orb3 }} />

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
                {/* Left branding */}
                <div style={{
                    ...styles.brandSection,
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateX(0)' : 'translateX(-40px)',
                }}>
                    <div style={styles.brandBadge}>
                        <div style={styles.aiBrain}>
                            {/* Graduation cap icon */}
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e1034d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 7.42l-10-4-10 4 10 4 10-4z" />
                                <path d="M4 10v6a8 3 0 0 0 16 0v-6" />
                                <line x1="12" y1="14" x2="12" y2="21" />
                            </svg>
                        </div>
                        <span style={styles.brandName}>Prepify</span>
                    </div>

                    <h2 style={styles.brandTitle}>Start Your AI-Powered Prep</h2>

                    <div style={styles.typewriterContainer}>
                        <span style={styles.typewriterText}>{typedText}</span>
                        <span style={styles.cursor}>|</span>
                    </div>

                    {/* Feature list */}
                    <div style={styles.featureList}>
                        {[
                            { icon: '🎯', text: 'Targeted practice for your role' },
                            { icon: '🤖', text: 'AI-generated follow-up questions' },
                            { icon: '📊', text: 'Performance analytics & insights' },
                            { icon: '⚡', text: 'Real-time feedback on answers' },
                        ].map((feat, i) => (
                            <div key={i} style={{
                                ...styles.featureItem,
                                animationDelay: `${0.8 + i * 0.12}s`,
                            }}>
                                <span style={styles.featureIcon}>{feat.icon}</span>
                                <span style={styles.featureText}>{feat.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Feature highlights only, no stats row */}
                </div>

                {/* Register card */}
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

                        {/* Step indicator */}
                        <div style={styles.stepIndicator}>
                            <div style={{
                                ...styles.stepDot,
                                ...(username ? styles.stepDotCompleted : styles.stepDotActive),
                            }}>
                                {username ? (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : '1'}
                            </div>
                            <div style={{
                                ...styles.stepLine,
                                background: username ? '#e1034d' : 'rgba(255,255,255,0.08)',
                            }} />
                            <div style={{
                                ...styles.stepDot,
                                ...(email ? styles.stepDotCompleted : username ? styles.stepDotActive : styles.stepDotInactive),
                            }}>
                                {email ? (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : '2'}
                            </div>
                            <div style={{
                                ...styles.stepLine,
                                background: email ? '#e1034d' : 'rgba(255,255,255,0.08)',
                            }} />
                            <div style={{
                                ...styles.stepDot,
                                ...(password ? styles.stepDotCompleted : email ? styles.stepDotActive : styles.stepDotInactive),
                            }}>
                                {password ? (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : '3'}
                            </div>
                        </div>

                        <div style={styles.cardHeader}>
                            <h1 style={styles.title}>Create Account</h1>
                            <p style={styles.subtitle}>Join thousands of successful candidates</p>
                        </div>

                        <form onSubmit={handleSubmit} autoComplete="off">
                            {/* Username */}
                            <div style={{
                                ...styles.inputGroup,
                                ...(focusedField === 'username' ? styles.inputGroupFocused : {}),
                                animationDelay: '0.35s',
                            }}>
                                <div style={styles.inputIconBox}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                        stroke={focusedField === 'username' ? '#e1034d' : '#555'}
                                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                        style={{ transition: 'all 0.3s ease' }}>
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <div style={styles.inputWrapper}>
                                    <input
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        onFocus={() => setFocusedField('username')}
                                        onBlur={() => setFocusedField(null)}
                                        type="text" id="username" name="username"
                                        placeholder=" " autoComplete="username" required
                                        style={styles.input}
                                    />
                                    <label htmlFor="username" style={{
                                        ...styles.label,
                                        ...(username || focusedField === 'username' ? styles.labelActive : {}),
                                        color: focusedField === 'username' ? '#e1034d' : username ? '#999' : '#555',
                                    }}>Username</label>
                                </div>
                                {username && (
                                    <div style={styles.validIcon}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#44ff88" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                )}
                                <div style={{
                                    ...styles.underline,
                                    transform: focusedField === 'username' ? 'scaleX(1)' : 'scaleX(0)',
                                }} />
                            </div>

                            {/* Email */}
                            <div style={{
                                ...styles.inputGroup,
                                ...(focusedField === 'email' ? styles.inputGroupFocused : {}),
                                animationDelay: '0.45s',
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
                                {email && email.includes('@') && (
                                    <div style={styles.validIcon}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#44ff88" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                )}
                                <div style={{
                                    ...styles.underline,
                                    transform: focusedField === 'email' ? 'scaleX(1)' : 'scaleX(0)',
                                }} />
                            </div>

                            {/* Password */}
                            <div style={{
                                ...styles.inputGroup,
                                ...(focusedField === 'password' ? styles.inputGroupFocused : {}),
                                animationDelay: '0.55s',
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
                                        placeholder=" " autoComplete="new-password" required
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

                            {/* Password strength bar */}
                            {password && (
                                <div style={styles.strengthContainer}>
                                    <div style={styles.strengthBarBg}>
                                        <div style={{
                                            ...styles.strengthBarFill,
                                            width: `${(passwordStrength / 5) * 100}%`,
                                            background: getStrengthColor(),
                                            boxShadow: `0 0 12px ${getStrengthColor()}40`,
                                        }} />
                                    </div>
                                    <span style={{
                                        ...styles.strengthLabel,
                                        color: getStrengthColor(),
                                    }}>{getStrengthLabel()}</span>
                                </div>
                            )}

                            {/* Submit */}
                            <button type="submit" disabled={isSubmitting}
                                style={{
                                    ...styles.submitBtn,
                                    marginTop: password ? '1.2rem' : '1.8rem',
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
                                        Get Started Free
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }}>
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                            <polyline points="12 5 19 12 12 19" />
                                        </svg>
                                    </span>
                                )}
                            </button>
                        </form>

                        <p style={styles.termsText}>
                            By signing up, you agree to our{' '}
                            <span style={styles.termsLink}>Terms</span> &{' '}
                            <span style={styles.termsLink}>Privacy Policy</span>
                        </p>

                        <div style={styles.divider}>
                            <div style={styles.dividerLine} />
                            <span style={styles.dividerText}>or</span>
                            <div style={styles.dividerLine} />
                        </div>

                        <p style={styles.loginText}>
                            Already have an account?{' '}
                            <Link to="/login" style={styles.loginLink}
                                onMouseEnter={e => e.currentTarget.style.textShadow = '0 0 15px rgba(225,3,77,0.5)'}
                                onMouseLeave={e => e.currentTarget.style.textShadow = 'none'}>
                                Sign In →
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
    @keyframes neuralPulse {
        0%, 100% { transform: scale(0.8); opacity: 0.3; }
        50% { transform: scale(1.2); opacity: 1; }
    }
    @keyframes featureSlide {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes statSlide {
        from { opacity: 0; transform: translateY(15px) scale(0.9); }
        to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes brainGlow {
        0%, 100% { filter: drop-shadow(0 0 8px rgba(225,3,77,0.3)); }
        50% { filter: drop-shadow(0 0 20px rgba(225,3,77,0.7)); }
    }
    @keyframes strengthPulse {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
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
        maxWidth: 1000,
        width: '100%',
        padding: '2rem',
    },
    // Brand
    brandSection: {
        flex: 1,
        transition: 'all 1s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2rem',
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
        fontSize: '2rem',
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
        fontSize: '1.1rem',
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
    featureList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        marginTop: '0.3rem',
    },
    featureItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.6rem 0.9rem',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '0.65rem',
        border: '1px solid rgba(255,255,255,0.04)',
        animation: 'featureSlide 0.5s ease-out both',
        transition: 'all 0.3s ease',
    },
    featureIcon: {
        fontSize: '1.1rem',
    },
    featureText: {
        color: '#aaa',
        fontSize: '0.88rem',
        fontWeight: 400,
    },
    statsRow: {
        display: 'flex',
        gap: '1rem',
        marginTop: '0.5rem',
    },
    statItem: {
        display: 'flex',
        flexDirection: 'column',
        padding: '0.7rem 1rem',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '0.8rem',
        border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(10px)',
        animation: 'statSlide 0.5s ease-out both',
    },
    statNum: {
        fontSize: '1.2rem',
        fontWeight: 700,
        color: '#e1034d',
    },
    statLabel: {
        fontSize: '0.7rem',
        color: '#666',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginTop: '0.1rem',
    },
    // Card
    cardOuter: {
        position: 'relative',
        transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1)',
        transformStyle: 'preserve-3d',
        flex: '0 0 420px',
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
        padding: '2.2rem 2rem',
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
    // Step indicator
    stepIndicator: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        marginBottom: '1.5rem',
        animation: 'slideUp 0.5s ease-out 0.25s both',
    },
    stepDot: {
        width: 28, height: 28,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.72rem',
        fontWeight: 700,
        transition: 'all 0.4s ease',
        flexShrink: 0,
    },
    stepDotActive: {
        background: 'rgba(225,3,77,0.15)',
        border: '2px solid #e1034d',
        color: '#e1034d',
        boxShadow: '0 0 15px rgba(225,3,77,0.3)',
    },
    stepDotCompleted: {
        background: '#e1034d',
        border: '2px solid #e1034d',
        color: 'white',
        boxShadow: '0 0 15px rgba(225,3,77,0.4)',
    },
    stepDotInactive: {
        background: 'rgba(255,255,255,0.03)',
        border: '2px solid rgba(255,255,255,0.1)',
        color: '#555',
    },
    stepLine: {
        width: 40, height: 2,
        borderRadius: 2,
        transition: 'background 0.4s ease',
    },
    cardHeader: {
        marginBottom: '1.5rem',
        animation: 'slideUp 0.5s ease-out 0.3s both',
    },
    title: {
        margin: 0,
        fontSize: '1.6rem',
        fontWeight: 700,
        color: 'white',
        letterSpacing: '-0.3px',
    },
    subtitle: {
        margin: '0.3rem 0 0',
        fontSize: '0.85rem',
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
        marginBottom: '0.9rem',
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
        padding: '1.05rem 0.9rem 0.5rem',
        background: 'rgba(255,255,255,0.07)',
        border: 'none',
        outline: 'none',
        color: 'white',
        fontSize: '0.93rem',
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
        fontSize: '0.88rem',
        color: '#555',
        pointerEvents: 'none',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        fontWeight: 400,
    },
    labelActive: {
        top: '0.38rem',
        transform: 'translateY(0)',
        fontSize: '0.66rem',
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
    validIcon: {
        padding: '0 0.8rem',
        display: 'flex',
        alignItems: 'center',
        animation: 'strengthPulse 0.3s ease-out',
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
    // Strength
    strengthContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        marginTop: '-0.2rem',
        marginBottom: '0.2rem',
        animation: 'strengthPulse 0.3s ease-out',
    },
    strengthBarBg: {
        flex: 1,
        height: 3,
        background: 'rgba(255,255,255,0.06)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    strengthBarFill: {
        height: '100%',
        borderRadius: 4,
        transition: 'all 0.4s ease',
    },
    strengthLabel: {
        fontSize: '0.72rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        flexShrink: 0,
        transition: 'color 0.3s ease',
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
        animation: 'slideUp 0.5s ease-out 0.65s both',
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
    termsText: {
        textAlign: 'center',
        color: '#555',
        fontSize: '0.75rem',
        marginTop: '1rem',
        marginBottom: '0.8rem',
        animation: 'slideUp 0.5s ease-out 0.7s both',
    },
    termsLink: {
        color: '#888',
        cursor: 'pointer',
        textDecoration: 'underline',
        textUnderlineOffset: '2px',
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        animation: 'slideUp 0.5s ease-out 0.75s both',
    },
    dividerLine: {
        flex: 1,
        height: 1,
        background: 'rgba(255,255,255,0.06)',
    },
    dividerText: {
        color: '#444',
        fontSize: '0.78rem',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    loginText: {
        textAlign: 'center',
        color: '#666',
        fontSize: '0.9rem',
        marginTop: '0.8rem',
        marginBottom: 0,
        animation: 'slideUp 0.5s ease-out 0.8s both',
    },
    loginLink: {
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

export default Register;