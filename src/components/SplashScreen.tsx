import { motion } from 'framer-motion';

export default function SplashScreen() {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#fcfaf7',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                style={{ textAlign: 'center' }}
            >
                <img
                    src="/logo1.webp"
                    alt="Petricor"
                    style={{ width: '220px', maxWidth: '70vw', height: 'auto' }}
                />
            </motion.div>

            <motion.div
                style={{
                    width: '40px',
                    height: '2px',
                    backgroundColor: '#8b6352',
                    marginTop: '30px'
                }}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 40, opacity: 1 }}
                transition={{ duration: 1, delay: 0.6, ease: "easeInOut" }}
            />
        </motion.div>
    );
}
