import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from '../ui/Button';
import type { Product, Variant } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { useStore } from '../../context/StoreContext';

interface VariantSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onConfirm: (variant: Variant) => void;
}

export const VariantSelectionModal: React.FC<VariantSelectionModalProps> = ({ isOpen, onClose, product, onConfirm }) => {
    const { storeSettings } = useStore();
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

    if (!product || !product.variants) return null;

    const handleConfirm = () => {
        if (selectedVariant) {
            onConfirm(selectedVariant);
            onClose();
            setSelectedVariant(null);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Select Option: ${product.name}`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {product.variants.map(variant => {
                    const isSelected = selectedVariant?.id === variant.id;
                    const hasStock = (variant.stock || 0) > 0;

                    return (
                        <div
                            key={variant.id}
                            onClick={() => hasStock && setSelectedVariant(variant)}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1rem',
                                border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                cursor: hasStock ? 'pointer' : 'not-allowed',
                                backgroundColor: isSelected ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                                opacity: hasStock ? 1 : 0.5
                            }}
                        >
                            <span style={{ fontWeight: 500 }}>{variant.name}</span>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                    {variant.stock} left
                                </span>
                                <span style={{ fontWeight: 600, minWidth: '80px', textAlign: 'right' }}>
                                    {formatCurrency(variant.price, storeSettings.currency)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button onClick={handleConfirm} disabled={!selectedVariant}>Add to Cart</Button>
            </div>
        </Modal>
    );
};
