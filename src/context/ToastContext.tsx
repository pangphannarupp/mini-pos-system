import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                zIndex: 9999
            }}>
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        style={{
                            minWidth: '300px',
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            padding: '16px',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            borderLeft: `4px solid ${toast.type === 'success' ? 'var(--text-success)' :
                                toast.type === 'error' ? 'var(--text-danger)' :
                                    'var(--text-info)'
                                }`,
                            animation: 'slideIn 0.3s ease-out'
                        }}
                    >
                        {toast.type === 'success' && <CheckCircle size={20} style={{ color: 'var(--text-success)' }} />}
                        {toast.type === 'error' && <AlertCircle size={20} style={{ color: 'var(--text-danger)' }} />}
                        {toast.type === 'info' && <Info size={20} style={{ color: 'var(--text-info)' }} />}

                        <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>{toast.message}</span>

                        <button
                            onClick={() => removeToast(toast.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                color: 'var(--text-secondary)'
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </ToastContext.Provider>
    );
};
