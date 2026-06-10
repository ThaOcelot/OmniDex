import { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end', // Allineato in basso (stile Bottom Sheet su mobile)
            justifyContent: 'center',
            padding: window.innerWidth > 768 ? '40px' : '0' // Niente padding su mobile
          }}
          onClick={onClose}
        >
          <motion.div 
            initial={{ y: "100%", scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: "100%", scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100) onClose();
            }}
            style={{
              width: '100%',
              maxWidth: '800px',
              maxHeight: window.innerWidth > 768 ? '90vh' : '95vh',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              padding: '0',
              overflow: 'hidden',
              boxShadow: '0 -25px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(109, 40, 217, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderTopLeftRadius: 'var(--radius-xl)',
              borderTopRightRadius: 'var(--radius-xl)',
              borderBottomLeftRadius: window.innerWidth > 768 ? 'var(--radius-xl)' : '0',
              borderBottomRightRadius: window.innerWidth > 768 ? 'var(--radius-xl)' : '0',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(20px)',
              margin: '0 auto'
            }}
            onClick={e => e.stopPropagation()} 
          >
            {/* Drag Handle on Mobile */}
            {window.innerWidth <= 768 && (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingTop: '12px', paddingBottom: '4px' }}>
                <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }} />
              </div>
            )}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(90deg, rgba(109,40,217,0.15) 0%, transparent 100%)'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{title}</h2>
              <button 
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'white'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{
              padding: '24px',
              overflowY: 'auto',
              flex: 1,
              lineHeight: '1.8'
            }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
