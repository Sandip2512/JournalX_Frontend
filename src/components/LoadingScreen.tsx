import React from 'react';
import { motion } from 'framer-motion';
import './LoadingScreen.css';

interface LoadingScreenProps {
    message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "Loading..." }) => {
    return (
        <div className="loading-screen">
            <div className="loading-content-minimal">
                <div className="logo-container">
                    <motion.div
                        className="logo-box"
                        animate={{
                            rotate: [0, 360],
                            scale: [1, 1.1, 1],
                            borderRadius: ["25%", "50%", "25%"]
                        }}
                        transition={{
                            duration: 3,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                    >
                        <span className="logo-initial">J</span>
                    </motion.div>

                    <motion.div
                        className="logo-pulse"
                        animate={{
                            scale: [1, 1.5],
                            opacity: [0.5, 0]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeOut"
                        }}
                    />
                </div>

                <motion.div
                    className="loading-text-container"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <p className="loading-msg">{message}</p>
                    <div className="loading-dots">
                        {[0, 1, 2].map((i) => (
                            <motion.span
                                key={i}
                                className="dot"
                                animate={{
                                    y: ["0%", "-50%", "0%"],
                                    opacity: [0.3, 1, 0.3]
                                }}
                                transition={{
                                    duration: 0.8,
                                    repeat: Infinity,
                                    delay: i * 0.15,
                                    ease: "easeInOut"
                                }}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
