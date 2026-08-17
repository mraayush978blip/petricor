import React from 'react';
import { motion } from 'framer-motion';

const ErrorFallback: React.FC<{ error: Error, resetError: () => void }> = ({ resetError }) => {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            backgroundColor: '#fdfbf9',
            backgroundImage: `linear-gradient(to bottom, rgba(253, 251, 249, 0.7), rgba(253, 251, 249, 0.95)), url("/images/bg_botanical_leaves.webp")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: '20px',
            textAlign: 'center'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(10px)',
                    padding: '60px 40px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                    maxWidth: '500px',
                    width: '100%'
                }}
            >
                <h1 style={{ fontSize: '48px', fontWeight: '800', color: '#8b6352', margin: '0 0 10px 0', lineHeight: '1.2' }}>
                    Oops!
                </h1>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#222', margin: '0 0 15px 0' }}>
                    Something went wrong.
                </h2>
                <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.6', margin: '0 0 30px 0' }}>
                    Our team has been automatically notified and we are looking into the issue. Please try refreshing the page.
                </p>
                <button 
                    onClick={() => {
                        resetError();
                        window.location.reload();
                    }}
                    style={{
                        display: 'inline-block',
                        backgroundColor: '#6b4236',
                        color: '#fff',
                        textDecoration: 'none',
                        padding: '14px 30px',
                        borderRadius: '8px',
                        fontSize: '15px',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 12px rgba(107, 66, 54, 0.2)',
                        border: 'none',
                        cursor: 'pointer'
                    }}>
                    Refresh Page
                </button>
            </motion.div>
        </div>
    );
};

export default ErrorFallback;
