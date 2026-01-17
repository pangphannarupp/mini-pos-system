import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Percent, DollarSign } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import './DiscountModal.css';

interface DiscountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (type: 'percent' | 'fixed', value: number) => void;
    itemName?: string; // If applying to specific item
}

export const DiscountModal: React.FC<DiscountModalProps> = ({ isOpen, onClose, onApply, itemName }) => {
    const { storeSettings } = useStore();
    const { t } = useTranslation();
    const [type, setType] = useState<'percent' | 'fixed'>('percent');
    const [value, setValue] = useState<string>('');

    const handleSubmit = () => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue > 0) {
            onApply(type, numValue);
            onClose();
            setValue('');
        }
    };

    const presets = [5, 10, 15, 20, 25, 30, 50];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={itemName ? t('modals.discount.title_item', { item: itemName }) : t('modals.discount.title_generic')}>
            <div className="discount-options">
                <button
                    className={`discount-type-btn ${type === 'percent' ? 'active' : ''}`}
                    onClick={() => setType('percent')}
                >
                    <Percent size={24} />
                    <span>{t('modals.discount.percent')}</span>
                </button>
                <button
                    className={`discount-type-btn ${type === 'fixed' ? 'active' : ''}`}
                    onClick={() => setType('fixed')}
                >
                    <DollarSign size={24} />
                    <span>{t('modals.discount.fixed')} ({storeSettings.currency})</span>
                </button>
            </div>

            <div className="discount-input-container">
                <Input
                    label={type === 'percent' ? t('modals.discount.percent_off') : t('modals.discount.amount_off')}
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="0"
                    autoFocus
                    min="0"
                    max={type === 'percent' ? "100" : undefined}
                />

                {type === 'percent' && (
                    <div className="common-discounts">
                        {presets.map(p => (
                            <button
                                key={p}
                                className="preset-btn"
                                onClick={() => setValue(p.toString())}
                            >
                                {p}%
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
                <Button onClick={handleSubmit} disabled={!value}>{t('modals.discount.apply')}</Button>
            </div>
        </Modal>
    );
};
