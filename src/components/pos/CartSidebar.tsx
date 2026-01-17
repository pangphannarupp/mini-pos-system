import React, { useState } from 'react';
import { Trash2, Minus, Plus, ShoppingCart, Tag } from 'lucide-react';

import type { CartItem } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { DiscountModal } from '../modals/DiscountModal';
import { useTranslation } from 'react-i18next';
import './CartSidebar.css';

interface CartSidebarProps {
    items: CartItem[];
    onUpdateQuantity: (id: string, delta: number) => void;
    onUpdateItem: (id: string, updates: Partial<CartItem>) => void;
    onRemoveItem: (id: string) => void;
    onCheckout: () => void;
    onHoldOrder?: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ items, onUpdateQuantity, onUpdateItem, onRemoveItem, onCheckout, onHoldOrder }) => {
    const { taxRate, storeSettings } = useStore();
    const { t } = useTranslation();
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    const handleDiscountClick = (itemId: string) => {
        setSelectedItemId(itemId);
        setIsDiscountModalOpen(true);
    };

    const handleApplyDiscount = (type: 'percent' | 'fixed', value: number) => {
        if (selectedItemId) {
            onUpdateItem(selectedItemId, {
                discount: { type, value }
            });
        }
        setIsDiscountModalOpen(false);
        setSelectedItemId(null);
    };

    const calculateItemPrice = (item: CartItem) => {
        let price = item.price * item.quantity;
        if (item.discount) {
            if (item.discount.type === 'percent') {
                price = price * (1 - item.discount.value / 100);
            } else {
                price = Math.max(0, price - item.discount.value);
            }
        }
        return price;
    };

    const total = items.reduce((sum, item) => sum + calculateItemPrice(item), 0);
    const tax = total * (taxRate / 100);
    const finalTotal = total + tax;

    return (
        <div className="cart-sidebar">
            <div className="cart-header">
                <h2>{t('pos.cart')}</h2>
                <span className="badge">{items.reduce((acc, item) => acc + item.quantity, 0)} {t('pos.items')}</span>
            </div>

            <div className="cart-items">
                {items.length === 0 ? (
                    <div className="empty-cart">
                        <ShoppingCart size={48} />
                        <p>{t('pos.empty_cart')}</p>
                    </div>
                ) : (
                    items.map(item => {
                        const originalPrice = item.price * item.quantity;
                        const finalPrice = calculateItemPrice(item);
                        const hasDiscount = item.discount !== undefined;

                        return (
                            <div key={item.id} className="cart-item">
                                <img src={item.image} alt={item.name} className="cart-item-img" />
                                <div className="cart-item-details">
                                    <div className="cart-item-header">
                                        <span className="cart-item-name">
                                            {item.name}
                                            {item.selectedVariant && (
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '4px', fontWeight: 400 }}>
                                                    ({item.selectedVariant.name})
                                                </span>
                                            )}
                                        </span>
                                        <button className="remove-btn" onClick={() => onRemoveItem(item.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="cart-item-price-row">
                                        <div className="price-info">
                                            {hasDiscount && (
                                                <span className="original-price">
                                                    {formatCurrency(originalPrice, storeSettings.currency)}
                                                </span>
                                            )}
                                            <span className={hasDiscount ? 'discounted-price' : ''}>
                                                {formatCurrency(finalPrice, storeSettings.currency)}
                                            </span>
                                        </div>
                                        <button
                                            className={`discount-btn ${hasDiscount ? 'active' : ''}`}
                                            onClick={() => handleDiscountClick(item.id)}
                                            title={t('pos.discount')}
                                        >
                                            <Tag size={14} />
                                            {hasDiscount && (
                                                <span className="discount-badge">
                                                    {item.discount?.type === 'percent' ? `-${item.discount.value}%` : `-$${item.discount?.value}`}
                                                </span>
                                            )}
                                        </button>
                                    </div>

                                    <div className="cart-item-controls">
                                        <button className="quantity-btn" onClick={() => onUpdateQuantity(item.id, -1)} disabled={item.quantity <= 1}>
                                            <Minus size={14} />
                                        </button>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 500, minWidth: '1.5rem', textAlign: 'center' }}>{item.quantity}</span>
                                        <button className="quantity-btn" onClick={() => onUpdateQuantity(item.id, 1)}>
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="cart-footer">
                <div className="cart-summary">
                    <div className="summary-row">
                        <span>{t('pos.subtotal')}</span>
                        <div style={{ textAlign: 'right' }}>
                            {formatCurrency(total, storeSettings.currency, { showSecondary: storeSettings.enableDualCurrency, secondaryCurrency: storeSettings.secondaryCurrency, exchangeRate: storeSettings.exchangeRate, additionalCurrencies: storeSettings.additionalCurrencies }).split(' / ').map((val, i) => (
                                <div key={i} style={i > 0 ? { fontSize: '0.85em', opacity: 0.8 } : {}}>{val}</div>
                            ))}
                        </div>
                    </div>
                    <div className="summary-row">
                        <span>{t('pos.tax')} ({taxRate}%)</span>
                        <div style={{ textAlign: 'right' }}>
                            {formatCurrency(tax, storeSettings.currency, { showSecondary: storeSettings.enableDualCurrency, secondaryCurrency: storeSettings.secondaryCurrency, exchangeRate: storeSettings.exchangeRate, additionalCurrencies: storeSettings.additionalCurrencies }).split(' / ').map((val, i) => (
                                <div key={i} style={i > 0 ? { fontSize: '0.85em', opacity: 0.8 } : {}}>{val}</div>
                            ))}
                        </div>
                    </div>
                    <div className="summary-total">
                        <span>{t('pos.total')}</span>
                        <div style={{ textAlign: 'right' }}>
                            {formatCurrency(finalTotal, storeSettings.currency, { showSecondary: storeSettings.enableDualCurrency, secondaryCurrency: storeSettings.secondaryCurrency, exchangeRate: storeSettings.exchangeRate, additionalCurrencies: storeSettings.additionalCurrencies }).split(' / ').map((val, i) => (
                                <div key={i} style={i > 0 ? { fontSize: '0.8em', fontWeight: 'normal' } : {}}>{val}</div>
                            ))}
                        </div>
                    </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <button
                        className="btn btn-secondary"
                        style={{ width: '100%', padding: '0.75rem' }}
                        onClick={onHoldOrder}
                        disabled={items.length === 0}
                    >
                        {t('pos.hold_order')}
                    </button>
                </div>
                <button
                    className="checkout-btn"
                    onClick={onCheckout}
                    disabled={items.length === 0}
                    style={{ flexDirection: 'column', gap: '0.25rem' }}
                >
                    <span>{t('pos.checkout')}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.9em' }}>
                        {formatCurrency(finalTotal, storeSettings.currency, { showSecondary: storeSettings.enableDualCurrency, secondaryCurrency: storeSettings.secondaryCurrency, exchangeRate: storeSettings.exchangeRate, additionalCurrencies: storeSettings.additionalCurrencies }).split(' / ').map((val, i) => (
                            <span key={i} style={i > 0 ? { fontSize: '0.85em', opacity: 0.9 } : {}}>{val}</span>
                        ))}
                    </div>
                </button>
            </div>

            <DiscountModal
                isOpen={isDiscountModalOpen}
                onClose={() => setIsDiscountModalOpen(false)}
                onApply={handleApplyDiscount}
                itemName={selectedItemId ? items.find(i => i.id === selectedItemId)?.name : undefined}
            />
        </div>
    );
};
