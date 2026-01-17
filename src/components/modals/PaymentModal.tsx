import React, { useState, useEffect } from 'react';
import { Banknote, CreditCard, QrCode, Gift } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { Order, Customer } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { useStore } from '../../context/StoreContext';
import { useTranslation } from 'react-i18next';
import './PaymentModal.css';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    total: number;
    customer: Customer | null;
    onConfirm: (paymentMethod: Order['paymentMethod'], cashReceived?: number, change?: number, pointsRedeemed?: number, discountFromPoints?: number) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, total, customer, onConfirm }) => {
    const { storeSettings } = useStore();
    const { t } = useTranslation();
    const [method, setMethod] = useState<Order['paymentMethod']>('cash');
    const [cashReceived, setCashReceived] = useState<string>('');
    const [change, setChange] = useState<number>(0);

    // Loyalty
    const [usePoints, setUsePoints] = useState(false);
    const POINTS_VALUE_RATIO = 0.01; // 1 point = $0.01
    const maxRedeemablePoints = customer ? Math.min(customer.points, Math.floor(total / POINTS_VALUE_RATIO)) : 0;
    const discountFromPoints = usePoints ? maxRedeemablePoints * POINTS_VALUE_RATIO : 0;
    const finalTotal = Math.max(0, total - discountFromPoints);

    useEffect(() => {
        if (isOpen) {
            setMethod('cash');
            setCashReceived('');
            setChange(0);
            setUsePoints(false);
        }
    }, [isOpen]);

    const handleCashChange = (value: string) => {
        setCashReceived(value);
        const amount = parseFloat(value);
        if (!isNaN(amount) && amount >= finalTotal) {
            setChange(amount - finalTotal);
        } else {
            setChange(0);
        }
    };

    const handleConfirm = () => {
        const cash = parseFloat(cashReceived);
        if (method === 'cash' && (isNaN(cash) || cash < finalTotal)) {
            alert('Insufficient cash amount');
            return;
        }
        onConfirm(
            method,
            method === 'cash' ? cash : undefined,
            method === 'cash' ? change : undefined,
            usePoints ? maxRedeemablePoints : 0,
            discountFromPoints
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('payment.title')}>
            <div className="payment-summary">
                <div className="payment-row total">
                    <span>{t('payment.total_amount')}</span>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                        {formatCurrency(finalTotal, storeSettings.currency, { showSecondary: storeSettings.enableDualCurrency, secondaryCurrency: storeSettings.secondaryCurrency, exchangeRate: storeSettings.exchangeRate, additionalCurrencies: storeSettings.additionalCurrencies }).split(' / ').map((val, i) => (
                            <span key={i} style={i === 0 ? { fontSize: '1.5rem', fontWeight: 'bold' } : { fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                                {val}
                            </span>
                        ))}
                    </div>
                </div>
                {usePoints && (
                    <div className="payment-row" style={{ color: 'var(--text-success)', marginTop: '0.5rem' }}>
                        <span>{t('payment.points_redeemed')} ({maxRedeemablePoints})</span>
                        <span>-{formatCurrency(discountFromPoints, storeSettings.currency)}</span>
                    </div>
                )}
            </div>

            {customer && customer.points > 0 && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Gift size={20} style={{ color: 'var(--accent-primary)' }} />
                            <span style={{ fontWeight: 600 }}>Loyalty Points</span>
                        </div>
                        <span style={{ color: 'var(--text-secondary)' }}>Available: {customer.points}</span>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={usePoints}
                            onChange={(e) => setUsePoints(e.target.checked)}
                            disabled={maxRedeemablePoints === 0}
                            style={{ width: '1.25rem', height: '1.25rem' }}
                        />
                        <span>Use {maxRedeemablePoints} points for {formatCurrency(maxRedeemablePoints * POINTS_VALUE_RATIO, storeSettings.currency)} off</span>
                    </label>
                </div>
            )}

            <div className="payment-methods">
                <button
                    className={`payment-method-btn ${method === 'cash' ? 'active' : ''}`}
                    onClick={() => setMethod('cash')}
                >
                    <Banknote size={32} style={{ marginBottom: '0.5rem' }} />
                    <span>{t('payment.cash')}</span>
                </button>
                <button
                    className={`payment-method-btn ${method === 'card' ? 'active' : ''}`}
                    onClick={() => setMethod('card')}
                >
                    <CreditCard size={32} style={{ marginBottom: '0.5rem' }} />
                    <span>Card</span>
                </button>
                <button
                    className={`payment-method-btn ${method === 'qr' ? 'active' : ''}`}
                    onClick={() => setMethod('qr')}
                >
                    <QrCode size={32} style={{ marginBottom: '0.5rem' }} />
                    <span>{t('payment.qr_code')}</span>
                </button>
            </div>

            {method === 'cash' && (
                <div style={{ marginBottom: '2rem' }}>
                    <Input
                        label={`${t('payment.cash_received')} (${storeSettings.currency})`}
                        type="number"
                        step="0.01"
                        value={cashReceived}
                        onChange={(e) => handleCashChange(e.target.value)}
                        placeholder="0.00"
                        autoFocus
                    />
                    {change > 0 && (
                        <div className="change-display">
                            <h4>{t('payment.change')}</h4>
                            <div className="change-amount">{formatCurrency(change, storeSettings.currency)}</div>
                        </div>
                    )}
                </div>
            )}

            {method === 'qr' && (
                <div style={{ textAlign: 'center', marginBottom: '2rem', padding: '2rem', background: '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ width: '150px', height: '150px', background: 'white', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {/* Mock QR */}
                        <QrCode size={100} color="#000" />
                    </div>
                    <p style={{ marginTop: '1rem', color: '#64748b' }}>Scan to Pay</p>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <Button variant="secondary" onClick={onClose} size="lg">{t('common.cancel')}</Button>
                <Button onClick={handleConfirm} size="lg" disabled={method === 'cash' && (!cashReceived || parseFloat(cashReceived) < finalTotal)}>
                    {t('payment.confirm')}
                </Button>
            </div>
        </Modal>
    );
};
