import React from 'react';
import { Modal } from './Modal';
import { useStore } from '../../context/StoreContext';
import type { HeldOrder } from '../../context/StoreContext';

import { Button } from '../ui/Button';
import { Clock, Trash2, ArrowRight } from 'lucide-react';

interface HeldOrdersModalProps {
    isOpen: boolean;
    onClose: () => void;
    onResume: (order: HeldOrder) => void;
}

export const HeldOrdersModal: React.FC<HeldOrdersModalProps> = ({ isOpen, onClose, onResume }) => {
    const { heldOrders, deleteHeldOrder, customers } = useStore();

    const getCustomerName = (id?: string) => {
        if (!id) return 'Guest';
        return customers.find(c => c.id === id)?.name || 'Unknown';
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Held Orders">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
                {heldOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                        No held orders.
                    </div>
                ) : (
                    heldOrders.map(order => (
                        <div key={order.id} style={{
                            padding: '1rem',
                            backgroundColor: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: '1px solid var(--border-color)'
                        }}>
                            <div>
                                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>{getCustomerName(order.customerId)}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                                        ({order.items.length} items)
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', marginTop: '0.25rem' }}>
                                    <Clock size={12} style={{ marginRight: '4px' }} />
                                    {new Date(order.date).toLocaleString()}
                                </div>
                                <div style={{ fontWeight: 700, marginTop: '0.25rem', color: 'var(--accent-primary)' }}>
                                    ${order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Button variant="ghost" size="sm" onClick={() => deleteHeldOrder(order.id)} style={{ color: 'var(--text-danger)' }}>
                                    <Trash2 size={16} />
                                </Button>
                                <Button variant="primary" size="sm" onClick={() => onResume(order)}>
                                    Resume <ArrowRight size={16} style={{ marginLeft: '4px' }} />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Modal>
    );
};
