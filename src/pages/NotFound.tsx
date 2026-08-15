import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            backgroundColor: '#fdfbf9',
            backgroundImage: `linear-gradient(to bottom, rgba(253, 251, 249, 0.6), rgba(253, 251, 249, 0.95)), url("/images/bg_botanical_leaves.webp")`,
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
                <h1 style={{ fontSize: '100px', fontWeight: '800', color: '#8b6352', margin: '0 0 10px 0', lineHeight: '1' }}>
                    404
                </h1>
                <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#222', margin: '0 0 15px 0' }}>
                    Page Not Found
                </h2>
                <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.6', margin: '0 0 30px 0' }}>
                    It looks like this page has sprouted elsewhere or doesn't exist. Let's get you back to familiar ground.
                </p>
                <Link to="/" style={{
                    display: 'inline-block',
                    backgroundColor: '#6b4236',
                    color: '#fff',
                    textDecoration: 'none',
                    padding: '14px 30px',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(107, 66, 54, 0.2)'
                }}>
                    Return to Homepage
                </Link>
            </motion.div>
        </div>
    );
};

export default NotFound;
