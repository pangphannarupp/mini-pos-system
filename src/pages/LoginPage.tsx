import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Lock } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useTranslation } from 'react-i18next';

export const LoginPage = () => {
    const { login } = useAuth();
    const { t } = useTranslation();
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (login(pin)) {
            setError(false);
        } else {
            setError(true);
            setPin('');
        }
    };

    const handleNumClick = (num: string) => {
        if (pin.length < 4) {
            setPin(prev => prev + num);
        }
    };

    const handleClear = () => {
        setPin('');
        setError(false);
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)'
        }}>
            <Card padding="lg" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                    width: '64px', height: '64px',
                    backgroundColor: 'var(--accent-primary)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1.5rem',
                    color: 'white'
                }}>
                    <Lock size={32} />
                </div>

                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{t('login.title')}</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{t('login.subtitle')}</p>

                <div style={{ marginBottom: '2rem', width: '100%' }}>
                    <div style={{
                        height: '3rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        letterSpacing: '1rem',
                        fontWeight: 'bold',
                        borderBottom: error ? '2px solid var(--text-danger)' : '2px solid var(--border-color)',
                        color: error ? 'var(--text-danger)' : 'var(--text-primary)'
                    }}>
                        {'•'.repeat(pin.length)}
                    </div>
                    {error && <p style={{ color: 'var(--text-danger)', textAlign: 'center', marginTop: '0.5rem', fontSize: '0.875rem' }}>{t('login.invalid_pin')}</p>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', width: '100%' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <Button
                            key={num}
                            variant="secondary"
                            onClick={() => handleNumClick(num.toString())}
                            style={{ height: '60px', fontSize: '1.25rem' }}
                        >
                            {num}
                        </Button>
                    ))}
                    <Button variant="ghost" onClick={handleClear} style={{ height: '60px' }}>C</Button>
                    <Button variant="secondary" onClick={() => handleNumClick('0')} style={{ height: '60px', fontSize: '1.25rem' }}>0</Button>
                    <Button variant="primary" onClick={handleLogin} disabled={pin.length !== 4} style={{ height: '60px' }}>
                        {t('login.go')}
                    </Button>
                </div>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <p>{t('login.admin_pin')}: 1234</p>
                    <p>{t('login.cashier_pin')}: 0000</p>
                </div>
            </Card>
        </div>
    );
};
