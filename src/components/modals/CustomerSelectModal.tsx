import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from '../ui/Button';
import type { Customer } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Input } from '../ui/Input';
import { Search, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/formatCurrency';

interface CustomerSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (customer: Customer) => void;
}

export const CustomerSelectModal: React.FC<CustomerSelectModalProps> = ({ isOpen, onClose, onSelect }) => {
    const { customers, addCustomer, storeSettings } = useStore();
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddingNew, setIsAddingNew] = useState(false);

    // New Customer Form State
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    const handleAddNew = () => {
        if (!newName || !newPhone) return;
        const newCustomer: Customer = {
            id: Date.now().toString(),
            name: newName,
            phone: newPhone,
            points: 0,
            totalSpent: 0
        };
        addCustomer(newCustomer);
        onSelect(newCustomer);
        resetForm();
    };

    const resetForm = () => {
        setIsAddingNew(false);
        setNewName('');
        setNewPhone('');
        setSearchTerm('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isAddingNew ? t('modals.customer.title_add') : t('modals.customer.title_select')}>
            {!isAddingNew ? (
                <>
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder={t('modals.customer.search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 40px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {filteredCustomers.map(customer => (
                            <div
                                key={customer.id}
                                onClick={() => onSelect(customer)}
                                style={{
                                    padding: '12px',
                                    borderRadius: 'var(--radius-md)',
                                    backgroundColor: 'var(--bg-secondary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    border: '1px solid transparent',
                                    transition: 'border-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                            >
                                <div>
                                    <div style={{ fontWeight: 600 }}>{customer.name}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{customer.phone}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{customer.points} {t('modals.customer.pts')}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatCurrency(customer.totalSpent, storeSettings.currency)} {t('modals.customer.spent')}</div>
                                </div>
                            </div>
                        ))}
                        {filteredCustomers.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}>
                                {t('modals.customer.not_found')}
                            </div>
                        )}
                    </div>

                    <Button variant="primary" onClick={() => setIsAddingNew(true)} style={{ width: '100%' }}>
                        <Plus size={18} style={{ marginRight: '0.5rem' }} />
                        {t('modals.customer.title_add')}
                    </Button>
                </>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Input
                        label={t('modals.customer.name')}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="John Doe"
                    />
                    <Input
                        label={t('modals.customer.phone')}
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="012 345 678"
                    />
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <Button variant="ghost" onClick={resetForm} style={{ flex: 1 }}>
                            {t('common.cancel')}
                        </Button>
                        <Button variant="primary" onClick={handleAddNew} style={{ flex: 1 }}>
                            {t('modals.customer.create_select')}
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};
