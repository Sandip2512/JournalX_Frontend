import React, { useEffect, useState } from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
    message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "Loading..." }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) return 100;
                return prev + Math.random() * 15;
            });
        }, 200);

        return () => clearInterval(interval);
    }, []);

    // Generate animated chart data points
    const chartPoints = Array.from({ length: 20 }, (_, i) => {
        const x = (i / 19) * 100;
        const baseY = 50 + Math.sin(i * 0.5) * 20;
        const noise = Math.random() * 10 - 5;
        return { x, y: baseY + noise };
    });

    const pathData = chartPoints
        .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
        .join(' ');

    return (
        <div className="loading-screen">
            <div className="loading-content">
                {/* Animated Logo */}
                <div className="loading-logo">
                    <span className="logo-text">Journal</span>
                    <span className="logo-accent">X</span>
                </div>

                {/* Animated Chart */}
                <div className="loading-chart">
                    <svg viewBox="0 0 100 100" className="chart-svg">
                        {/* Grid lines */}
                        <g className="grid-lines">
                            {[0, 25, 50, 75, 100].map(y => (
                                <line
                                    key={y}
                                    x1="0"
                                    y1={y}
                                    x2="100"
                                    y2={y}
                                    stroke="currentColor"
                                    strokeWidth="0.2"
                                    opacity="0.2"
                                />
                            ))}
                        </g>

                        {/* Animated chart line */}
                        <path
                            d={pathData}
                            fill="none"
                            stroke="url(#chartGradient)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="chart-line"
                        />

                        {/* Gradient fill under the line */}
                        <path
                            d={`${pathData} L 100 100 L 0 100 Z`}
                            fill="url(#chartFillGradient)"
                            className="chart-fill"
                        />

                        {/* Animated dots on the line */}
                        {chartPoints.slice(-3).map((point, i) => (
                            <circle
                                key={i}
                                cx={point.x}
                                cy={point.y}
                                r="1.5"
                                fill="#3b82f6"
                                className="chart-dot"
                                style={{ animationDelay: `${i * 0.2}s` }}
                            />
                        ))}

                        {/* Gradients */}
                        <defs>
                            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="50%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#06b6d4" />
                            </linearGradient>
                            <linearGradient id="chartFillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Loading message */}
                <div className="loading-message">{message}</div>

                {/* Progress bar */}
                <div className="loading-progress-container">
                    <div
                        className="loading-progress-bar"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>

                {/* Animated stats */}
                <div className="loading-stats">
                    <div className="stat-item">
                        <div className="stat-icon">📊</div>
                        <div className="stat-label">Analyzing</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">📈</div>
                        <div className="stat-label">Processing</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">✨</div>
                        <div className="stat-label">Optimizing</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
