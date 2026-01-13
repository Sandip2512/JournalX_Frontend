import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { Sun, Moon } from "lucide-react";
import Background3D from "@/components/landing/Background3D";
import "./Landing.css";

const Landing = () => {
    const { isAuthenticated } = useAuth();
    const { theme, setTheme } = useTheme();
    const [showAuth, setShowAuth] = useState(false);
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    // Redirect authenticated users to dashboard
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const faqs = [
        {
            q: "Which brokers can I connect to JournalX?",
            a: "JournalX supports all major brokers via manual entry. We are also actively developing direct API integrations for seamless, automated syncing."
        },
        {
            q: "Can I execute trades through JournalX?",
            a: "JournalX is a specialized journaling and analytics platform, not a trading terminal. You execute trades on your broker and log them here for deep performance analysis."
        },
        {
            q: "Is there a free trial available?",
            a: "Yes! Our Free plan allows you to log up to 20 trades per month with basic dashboard access, perpetually—no credit card or trial period required."
        },
        {
            q: "What about privacy when sharing trades?",
            a: "You have full control. You can choose to share specific trades with the community or keep everything 100% private. Your account balance is never shared."
        },
        {
            q: "How secure is my trading data?",
            a: "We use bank-grade 256-bit encryption and secure cloud infrastructure. Your data is backed up daily and remains your property at all times."
        }
    ];

    return (
        <div className="landing-page-wrapper">
            <Background3D />

            {/* Header / Navigation */}
            <header style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                padding: '1.25rem 0',
                background: 'rgba(10, 10, 15, 0.7)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{
                        fontSize: '1.75rem',
                        fontWeight: '800',
                        letterSpacing: '-0.04em',
                        fontFamily: "'Outfit', sans-serif",
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <span style={{ color: 'var(--color-text-primary)' }}>Journal</span>
                        <span style={{
                            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))'
                        }}>X</span>
                    </div>

                    <div className="nav-links" style={{ display: 'flex', gap: '2.5rem', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                        {['Features', 'Community', 'Pricing', 'FAQ'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} style={{
                                color: 'var(--color-text-secondary)',
                                fontWeight: '500',
                                fontSize: '0.95rem',
                                textDecoration: 'none',
                                transition: 'color 0.2s'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                            >
                                {item}
                            </a>
                        ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={toggleTheme}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '1.2rem',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                        >
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                        <button className="btn btn-primary" onClick={() => setShowAuth(true)} style={{ padding: '0.75rem 1.75rem', borderRadius: '30px', fontWeight: '700' }}>
                            Open App
                        </button>
                    </div>
                </div>
            </header>

            <AuthDialog open={showAuth} onOpenChange={setShowAuth} />

            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <div style={{ marginBottom: '1.5rem' }}>
                            <span style={{
                                padding: '0.6rem 1.2rem',
                                background: 'var(--glass-bg)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '100px',
                                color: 'var(--color-accent-blue)',
                                fontWeight: '600',
                                fontSize: '0.85rem',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                boxShadow: 'var(--shadow-sm)'
                            }}>
                                JournalX
                            </span>
                        </div>
                        <h1 className="hero-title" style={{ fontSize: 'clamp(3.5rem, 7vw, 5.5rem)', lineHeight: '1.1' }}>
                            <span className="text-execution">
                                From Execution
                            </span> <br />
                            <span className="text-excellence" style={{ filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))' }}>
                                to Excellence.
                            </span>
                        </h1>
                        <p className="hero-subtitle" style={{ fontSize: '1.25rem', maxWidth: '650px', margin: '0 auto 2.5rem', color: 'var(--color-text-secondary)' }}>
                            The all-in-one trading journal for serious traders. Log trades, track performance, analyze patterns, and connect with a community of elite traders.
                        </p>
                        <div className="hero-cta">
                            <button onClick={() => setShowAuth(true)} className="btn btn-primary">Start Free</button>
                            <a href="#features" className="btn btn-secondary">Explore Features</a>
                        </div>
                    </div>

                    {/* Real Dashboard Preview */}
                    <div className="hero-visual">
                        <div className="dashboard-preview">
                            <img src="/assets/dashboard_main.png"
                                alt="JournalX Dashboard - Performance tracking with equity curve and growth targets"
                                style={{ width: '100%', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl), var(--shadow-glow-blue)', border: '1px solid var(--glass-border)' }} />
                        </div>
                    </div>
                </div>
            </section>



            {/* Features Section - 3 Column Cards */}
            <section id="features" className="section" style={{ paddingTop: '8rem', paddingBottom: '6rem' }}>
                <div className="container">
                    {/* Section Header */}
                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        <span style={{
                            padding: '0.5rem 1.2rem',
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '100px',
                            color: 'var(--color-accent-blue)',
                            fontWeight: '600',
                            fontSize: '0.75rem',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase'
                        }}>
                            FEATURES
                        </span>
                    </div>
                    <h2 style={{
                        fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                        textAlign: 'center',
                        marginBottom: '1rem',
                        fontWeight: '800',
                        color: 'var(--color-text-primary)'
                    }}>
                        Everything You Need to <br /> Master Your Trading
                    </h2>
                    <p style={{
                        textAlign: 'center',
                        fontSize: '1.15rem',
                        color: 'var(--color-text-secondary)',
                        maxWidth: '700px',
                        margin: '0 auto 4rem'
                    }}>
                        Comprehensive tools for trade logging, PnL analysis, journaling, and community engagement.
                    </p>

                    {/* 3-Column Feature Cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '2rem',
                        maxWidth: '1200px',
                        margin: '0 auto'
                    }}>
                        {/* Card 1: Automated Journaling */}
                        <div style={{
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '16px',
                            padding: '2.5rem 2rem',
                            backdropFilter: 'blur(10px)',
                            transition: 'transform 0.3s, box-shadow 0.3s',
                            boxShadow: 'var(--shadow-md)'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                            }}>
                            {/* Icon */}
                            <div style={{
                                width: '56px',
                                height: '56px',
                                background: 'rgba(59, 130, 246, 0.15)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.5rem',
                                fontSize: '1.75rem'
                            }}>
                                📊
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
                                Powerful Trade Ingestion
                            </h3>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                                Log trades manually with single or multi-leg entries. Edit, delete, and bulk tag trades effortlessly. Support for equities and options with contract multipliers.
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Manual single & multi-leg trade entry
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Bulk tagging & editing
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Options contract multipliers
                                </li>
                            </ul>
                        </div>

                        {/* Card 2: Advanced Analytics */}
                        <div style={{
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '16px',
                            padding: '2.5rem 2rem',
                            backdropFilter: 'blur(10px)',
                            transition: 'transform 0.3s, box-shadow 0.3s',
                            boxShadow: 'var(--shadow-md)'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                            }}>
                            {/* Icon */}
                            <div style={{
                                width: '56px',
                                height: '56px',
                                background: 'rgba(59, 130, 246, 0.15)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.5rem',
                                fontSize: '1.75rem'
                            }}>
                                📈
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
                                Performance Dashboard
                            </h3>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                                Track your equity curve, monitor growth targets (Weekly, Monthly, Yearly), and visualize your win rate with live performance data.
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Live equity curve tracking
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Growth targets (Weekly/Monthly/Yearly)
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Win rate & volume analytics
                                </li>
                            </ul>
                        </div>

                        {/* Card 3: Community */}
                        <div style={{
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '16px',
                            padding: '2.5rem 2rem',
                            backdropFilter: 'blur(10px)',
                            transition: 'transform 0.3s, box-shadow 0.3s',
                            boxShadow: 'var(--shadow-md)',
                            position: 'relative'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                            }}>
                            {/* Icon */}
                            <div style={{
                                width: '56px',
                                height: '56px',
                                background: 'rgba(59, 130, 246, 0.15)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.5rem',
                                fontSize: '1.75rem'
                            }}>
                                👥
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
                                Community & Collaboration
                            </h3>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                                Connect with traders worldwide. Share insights, discuss strategies, and grow together in a supportive trading community.
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Active trading community
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Share strategies & insights
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Discussion forums
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Showcase - Photos with Descriptions */}
            <section className="section" style={{ paddingTop: '6rem', paddingBottom: '6rem', background: 'rgba(15, 23, 42, 0.3)' }}>
                <div className="container">
                    {/* Showcase 1: Dashboard */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                        gap: '4rem',
                        alignItems: 'center',
                        marginBottom: '6rem'
                    }}>
                        <div>
                            <span style={{
                                color: 'var(--color-accent-blue)',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase'
                            }}>
                                Performance Tracking
                            </span>
                            <h3 style={{
                                fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                                fontWeight: '800',
                                marginTop: '1rem',
                                marginBottom: '1.5rem',
                                color: 'var(--color-text-primary)',
                                lineHeight: '1.2'
                            }}>
                                Your Trading Command Center
                            </h3>
                            <p style={{
                                color: 'var(--color-text-secondary)',
                                fontSize: '1.1rem',
                                lineHeight: '1.7',
                                marginBottom: '2rem'
                            }}>
                                Monitor your equity curve in real-time, track growth targets across multiple timeframes, and visualize your win rate—all in one powerful dashboard.
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                    <span style={{ color: '#3b82f6', fontSize: '1.25rem' }}>✓</span>
                                    <span>Live equity curve with historical performance data</span>
                                </li>
                                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                    <span style={{ color: '#3b82f6', fontSize: '1.25rem' }}>✓</span>
                                    <span>Weekly, Monthly, and Yearly profit targets</span>
                                </li>
                                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                    <span style={{ color: '#3b82f6', fontSize: '1.25rem' }}>✓</span>
                                    <span>Win rate percentage and total trade volume</span>
                                </li>
                            </ul>
                        </div>
                        <div style={{
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <img src="/assets/dashboard_main.png" alt="JournalX Dashboard" style={{ width: '100%', display: 'block' }} />
                        </div>
                    </div>


                    {/* Showcase 3: Traders Diary (Reversed) */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                        gap: '4rem',
                        alignItems: 'center',
                        marginBottom: '6rem'
                    }}>
                        <div style={{
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            order: 1
                        }}>
                            <img src="/assets/calendar.png" alt="Traders Diary Calendar" style={{ width: '100%', display: 'block' }} />
                        </div>
                        <div style={{ order: 2 }}>
                            <span style={{
                                color: 'var(--color-accent-blue)',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase'
                            }}>
                                Traders Diary
                            </span>
                            <h3 style={{
                                fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                                fontWeight: '800',
                                marginTop: '1rem',
                                marginBottom: '1.5rem',
                                color: 'var(--color-text-primary)',
                                lineHeight: '1.2'
                            }}>
                                Visualize Your Consistency
                            </h3>
                            <p style={{
                                color: 'var(--color-text-secondary)',
                                fontSize: '1.1rem',
                                lineHeight: '1.7',
                                marginBottom: '2rem'
                            }}>
                                Get a high-level view of your trading month. Identify winning streaks, manage drawdowns, and keep your momentum alive with a visual heat map of your performance.
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                    <span style={{ color: '#3b82f6', fontSize: '1.25rem' }}>✓</span>
                                    <span>Interactive monthly performance calendar</span>
                                </li>
                                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                    <span style={{ color: '#3b82f6', fontSize: '1.25rem' }}>✓</span>
                                    <span>Profit/Loss visualizations per day</span>
                                </li>
                                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                    <span style={{ color: '#3b82f6', fontSize: '1.25rem' }}>✓</span>
                                    <span>Streak tracking and monthly summaries</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Showcase 4: Analytics */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                        gap: '4rem',
                        alignItems: 'center',
                        marginBottom: '6rem'
                    }}>
                        <div>
                            <span style={{
                                color: 'var(--color-accent-blue)',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase'
                            }}>
                                Deep Analytics
                            </span>
                            <h3 style={{
                                fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                                fontWeight: '800',
                                marginTop: '1rem',
                                marginBottom: '1.5rem',
                                color: 'var(--color-text-primary)',
                                lineHeight: '1.2'
                            }}>
                                Data-Driven Insights
                            </h3>
                            <p style={{
                                color: 'var(--color-text-secondary)',
                                fontSize: '1.1rem',
                                lineHeight: '1.7',
                                marginBottom: '2rem'
                            }}>
                                Visualize your performance with advanced charts. Analyze win/loss ratios, track performance by symbol, and identify patterns that lead to profitable trades.
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                    <span style={{ color: '#3b82f6', fontSize: '1.25rem' }}>✓</span>
                                    <span>Win/Loss ratio pie charts with percentages</span>
                                </li>
                                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                    <span style={{ color: '#3b82f6', fontSize: '1.25rem' }}>✓</span>
                                    <span>Performance breakdown by trading symbol</span>
                                </li>
                                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                    <span style={{ color: '#3b82f6', fontSize: '1.25rem' }}>✓</span>
                                    <span>Interactive equity curve visualization</span>
                                </li>
                            </ul>
                        </div>
                        <div style={{
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <img src="/assets/analytics.png" alt="Analytics Dashboard" style={{ width: '100%', display: 'block' }} />
                        </div>
                    </div>

                    {/* Showcase 5: JournalX Report (Reversed) */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                        gap: '4rem',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            order: 1,
                            maxWidth: '420px',
                            margin: '0 auto'
                        }}>
                            <img src="/assets/ai_report.png" alt="JournalX AI Performance Report" style={{ width: '100%', display: 'block' }} />
                        </div>
                        <div style={{ order: 2 }}>
                            <span style={{
                                color: 'var(--color-accent-blue)',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase'
                            }}>
                                AI Intelligence
                            </span>
                            <h3 style={{
                                fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                                fontWeight: '800',
                                marginTop: '1rem',
                                marginBottom: '1.5rem',
                                color: 'var(--color-text-primary)',
                                lineHeight: '1.2'
                            }}>
                                JournalX Performance Reports
                            </h3>
                            <p style={{
                                color: 'var(--color-text-secondary)',
                                fontSize: '1.1rem',
                                lineHeight: '1.7',
                                marginBottom: '2rem'
                            }}>
                                Stop guessing why you won or lost. Our AI analyzes your trading journal to generate detailed psychological and technical reports, revealing hidden patterns in your behavior.
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                    <span style={{ color: '#3b82f6', fontSize: '1.25rem' }}>✓</span>
                                    <span>Auto-generated Yearly and Monthly reviews</span>
                                </li>
                                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                    <span style={{ color: '#3b82f6', fontSize: '1.25rem' }}>✓</span>
                                    <span>Psychological insights and performance metrics</span>
                                </li>
                                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                    <span style={{ color: '#3b82f6', fontSize: '1.25rem' }}>✓</span>
                                    <span>Symbol dominance and Profit Factor analysis</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Community Section */}
            <section id="community" className="section" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
                <div className="container">
                    {/* Community Header */}
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <div style={{
                            display: 'inline-block',
                            padding: '6px 16px',
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '20px',
                            color: 'var(--color-accent-blue)',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            letterSpacing: '0.05em',
                            marginBottom: '1.5rem',
                            textTransform: 'uppercase'
                        }}>
                            Community
                        </div>
                        <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: '800', marginBottom: '1.5rem', lineHeight: '1.1', color: 'var(--color-text-primary)' }}>
                            Trade Together, <br />
                            <span className="text-gradient">Grow Together</span>
                        </h2>
                        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
                            Connect with like-minded traders. Share trades, get feedback, and learn from the best.
                        </p>
                    </div>

                    {/* Community Showcase 1: Profiles */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                        gap: '5rem',
                        alignItems: 'center',
                        marginBottom: '8rem'
                    }}>
                        <div>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: 'rgba(59, 130, 246, 0.1)',
                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.5rem',
                                color: '#3b82f6',
                                fontSize: '1.5rem'
                            }}>
                                👥
                            </div>
                            <h3 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '1.25rem', color: 'var(--color-text-primary)' }}>
                                Member <span style={{ color: '#3b82f6' }}>Directory & Profiles</span>
                            </h3>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '2rem' }}>
                                Create your trader profile, showcase your stats, and discover other traders. Build your network and find trading partners.
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-secondary)', fontSize: '1.05rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Customizable profiles
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-secondary)', fontSize: '1.05rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Performance badges
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-secondary)', fontSize: '1.05rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Follow favorite traders
                                </li>
                            </ul>
                        </div>
                        <div style={{
                            borderRadius: '20px',
                            overflow: 'hidden',
                            boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            background: 'rgba(30, 41, 59, 0.5)',
                            padding: '1rem'
                        }}>
                            <img src="/assets/community_hub.png" alt="Community Hub" style={{ width: '100%', borderRadius: '12px', display: 'block' }} />
                        </div>
                    </div>

                    {/* Community Showcase 2: Feed (Reversed) */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                        gap: '5rem',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            borderRadius: '20px',
                            overflow: 'hidden',
                            boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            background: 'rgba(30, 41, 59, 0.5)',
                            padding: '1rem'
                        }}>
                            <img src="/assets/community_hub.png" alt="Traders Lounge" style={{ width: '100%', borderRadius: '12px', display: 'block' }} />
                        </div>
                        <div>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: 'rgba(59, 130, 246, 0.1)',
                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.5rem',
                                color: '#3b82f6',
                                fontSize: '1.5rem'
                            }}>
                                🚀
                            </div>
                            <h3 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '1.25rem', color: 'var(--color-text-primary)' }}>
                                Share Trades to <br />
                                <span style={{ color: '#3b82f6' }}>Community Feed</span>
                            </h3>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '2rem' }}>
                                Post your trades with full privacy controls. Get comments and reactions from the community. Learn from others' strategies.
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-secondary)', fontSize: '1.05rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Privacy controls
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-secondary)', fontSize: '1.05rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Comments & reactions
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-secondary)', fontSize: '1.05rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Direct messages & chat rooms
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="section" style={{ paddingTop: '6rem', paddingBottom: '6rem', background: 'var(--color-bg-secondary)' }}>
                <div className="container">
                    {/* Pricing Header */}
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <div style={{
                            display: 'inline-block',
                            padding: '6px 16px',
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '20px',
                            color: 'var(--color-accent-blue)',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            letterSpacing: '0.05em',
                            marginBottom: '1.5rem',
                            textTransform: 'uppercase'
                        }}>
                            Pricing
                        </div>
                        <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: '800', marginBottom: '1.5rem', lineHeight: '1.1' }}>
                            Plans for Every Trader
                        </h2>

                        {/* Toggle */}
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            background: 'var(--glass-bg)',
                            padding: '4px',
                            borderRadius: '30px',
                            border: '1px solid var(--glass-border)',
                            marginTop: '1rem'
                        }}>
                            <button style={{
                                padding: '8px 24px',
                                border: 'none',
                                borderRadius: '25px',
                                background: '#3b82f6',
                                color: '#ffffff',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                cursor: 'pointer'
                            }}>
                                Monthly
                            </button>
                            <div style={{
                                padding: '8px 24px',
                                color: 'var(--color-text-secondary)',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                Annual <span style={{ fontSize: '0.7rem', background: 'rgba(234, 179, 8, 0.2)', color: '#eab308', padding: '2px 8px', borderRadius: '10px' }}>Coming Soon</span>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Cards Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '1.5rem',
                        maxWidth: '850px',
                        margin: '0 auto'
                    }}>
                        {/* Free Plan */}
                        <div style={{
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '20px',
                            padding: '1.5rem 1.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: 'var(--shadow-md)'
                        }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--color-text-primary)' }}>Free</h3>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginBottom: '1rem', lineHeight: '1.4' }}>
                                Essential tracking for beginners.
                            </p>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <span style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>$0</span>
                                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>/mo</span>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Manual Single-Leg Entry
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Basic Dashboard (30 Days)
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Traders Diary (Current Month)
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Community Read-Only
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Limit: 20 trades/month
                                </li>
                            </ul>
                            <button className="btn btn-secondary" style={{ width: '100%', padding: '0.75rem', marginTop: 'auto', background: 'var(--glass-highlight)', fontSize: '0.85rem' }}>
                                Get Started
                            </button>
                        </div>

                        {/* Pro Plan */}
                        <div style={{
                            background: 'var(--glass-bg)',
                            border: '2px solid #3b82f6',
                            borderRadius: '20px',
                            padding: '2rem 1.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            boxShadow: '0 0 30px rgba(59, 130, 246, 0.15)',
                            transform: 'scale(1.02)',
                            zIndex: 1
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '-10px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: '#3b82f6',
                                color: '#ffffff',
                                fontSize: '0.65rem',
                                fontWeight: '700',
                                padding: '3px 10px',
                                borderRadius: '20px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                            }}>
                                Most Popular
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--color-text-primary)' }}>Pro</h3>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginBottom: '1rem', lineHeight: '1.4' }}>
                                Advanced insights & growth.
                            </p>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <span style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>$5.99</span>
                                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>/mo</span>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Unlimited Multi-Leg Entries
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Weekly/Monthly/Yearly Goals
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Full Analytics Dashboard
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Traders Diary (Full History)
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Community Sharing
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Custom Trader Profile
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Auto-Trades <span style={{ fontSize: '0.6rem', background: 'rgba(234, 179, 8, 0.2)', color: '#eab308', padding: '1px 5px', borderRadius: '10px' }}>Soon</span>
                                </li>
                            </ul>
                            <button className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: 'auto', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)', fontSize: '0.85rem' }}>
                                Get Started
                            </button>
                        </div>

                        {/* Elite Plan */}
                        <div style={{
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '20px',
                            padding: '1.5rem 1.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: 'var(--shadow-md)'
                        }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--color-text-primary)' }}>Elite</h3>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginBottom: '1rem', lineHeight: '1.4' }}>
                                AI intelligence & mentorship.
                            </p>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <span style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>$11.99</span>
                                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>/mo</span>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Everything in Pro
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> **JournalX AI Reports**
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> 1-on-1 Mentorship <span style={{ fontSize: '0.6rem', background: 'rgba(234, 179, 8, 0.2)', color: '#eab308', padding: '1px 5px', borderRadius: '10px' }}>Soon</span>
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Strategy Builder <span style={{ fontSize: '0.6rem', background: 'rgba(234, 179, 8, 0.2)', color: '#eab308', padding: '1px 5px', borderRadius: '10px' }}>Soon</span>
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Performance Badges
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Early Signals Access
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                                    <span style={{ color: '#3b82f6' }}>✓</span> Auto-Trades <span style={{ fontSize: '0.6rem', background: 'rgba(234, 179, 8, 0.2)', color: '#eab308', padding: '1px 5px', borderRadius: '10px' }}>Soon</span>
                                </li>
                            </ul>
                            <button className="btn btn-secondary" style={{ width: '100%', padding: '0.75rem', marginTop: 'auto', background: 'var(--glass-highlight)', fontSize: '0.85rem' }}>
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="section" style={{ paddingTop: '8rem', paddingBottom: '8rem' }}>
                <div className="container" style={{ maxWidth: '1200px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <div style={{
                            display: 'inline-block',
                            padding: '6px 20px',
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '30px',
                            color: 'var(--color-text-secondary)',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            letterSpacing: '0.1em',
                            marginBottom: '2rem',
                            textTransform: 'uppercase'
                        }}>
                            Support
                        </div>
                        <h2 style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', fontWeight: '800', marginBottom: '2rem', lineHeight: '1.1' }}>
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
                        gap: '0 4rem',
                        marginTop: '4rem'
                    }}>
                        {faqs.map((item, index) => (
                            <div key={index} style={{
                                borderBottom: '1px solid var(--glass-border)',
                                padding: '1.5rem 0',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                                onClick={() => setActiveFaq(activeFaq === index ? null : index)}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <h4 style={{
                                        fontSize: '1.1rem',
                                        fontWeight: '600',
                                        color: activeFaq === index ? 'var(--color-accent-blue)' : 'var(--color-text-primary)',
                                        margin: 0,
                                        transition: 'color 0.2s'
                                    }}>
                                        {item.q}
                                    </h4>
                                    <span style={{
                                        fontSize: '1.5rem',
                                        color: activeFaq === index ? '#3b82f6' : 'var(--color-text-muted)',
                                        fontWeight: '300',
                                        transform: activeFaq === index ? 'rotate(45deg)' : 'rotate(0deg)',
                                        transition: 'all 0.3s'
                                    }}>+</span>
                                </div>

                                <div style={{
                                    maxHeight: activeFaq === index ? '200px' : '0',
                                    overflow: 'hidden',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    opacity: activeFaq === index ? 1 : 0
                                }}>
                                    <p style={{
                                        color: 'var(--color-text-secondary)',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.6',
                                        paddingTop: '1rem',
                                        margin: 0
                                    }}>
                                        {item.a}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="section" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>
                            Ready to Transform Your Trading?
                        </h2>
                        <p style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)', marginBottom: '2.5rem' }}>
                            Start your journey with JournalX today. Track every trade, analyze every decision,
                            and build the discipline that separates professionals from amateurs.
                        </p>
                        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button onClick={() => setShowAuth(true)} className="btn btn-primary" style={{ fontSize: '1.25rem', padding: '1.25rem 2.5rem' }}>
                                Get Early Access
                            </button>
                            <a href="#features" className="btn btn-secondary" style={{ fontSize: '1.25rem', padding: '1.25rem 2.5rem' }}>
                                Learn More
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div style={{
                        fontSize: '1.75rem',
                        fontWeight: '800',
                        letterSpacing: '-0.04em',
                        fontFamily: "'Outfit', sans-serif",
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <span style={{ color: 'var(--color-text-primary)' }}>Journal</span>
                        <span style={{
                            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>X</span>
                    </div>
                    <p className="footer-text">
                        © 2026 JournalX. Empowering traders to achieve consistent profitability.
                    </p>
                    <p className="footer-text" style={{ marginTop: '0.5rem' }}>
                        Track. Analyze. Master.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
