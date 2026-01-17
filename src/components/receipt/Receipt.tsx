import React from 'react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency } from '../../utils/formatCurrency';
import type { Order } from '../../types';
import { useTranslation } from 'react-i18next';

import './Receipt.css';

interface ReceiptProps {
    order: Order;
}

export const Receipt: React.FC<ReceiptProps> = ({ order }) => {
    const { storeSettings } = useStore();
    const { t } = useTranslation();

    return (
        <div className="receipt-container" id="printable-receipt">
            <div className="receipt-header">
                <h2>{storeSettings.name}</h2>
                <p>{storeSettings.address}</p>
                <p>{storeSettings.phone}</p>
                <p>{t('receipt.date')}: {new Date(order.date).toLocaleString()}</p>
                <p>{t('receipt.order_no')}: {order.id.slice(0, 8)}</p>
            </div>

            <div className="receipt-items">
                {order.items.map((item, index) => {
                    let itemTotal = item.price * item.quantity;
                    let hasDiscount = false;

                    if (item.discount) {
                        hasDiscount = true;
                        if (item.discount.type === 'percent') {
                            itemTotal = itemTotal * (1 - item.discount.value / 100);
                        } else {
                            itemTotal = Math.max(0, itemTotal - item.discount.value);
                        }
                    }

                    return (
                        <div key={index} className="receipt-item">
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span className="item-name">{item.name} x{item.quantity}</span>
                                {hasDiscount && (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                        ({t('receipt.discount')}: {item.discount?.type === 'percent' ? `${item.discount.value}%` : formatCurrency(item.discount?.value || 0, storeSettings.currency)})
                                    </span>
                                )}
                            </div>
                            <span className="item-price">{formatCurrency(itemTotal, storeSettings.currency)}</span>
                        </div>
                    );
                })}
            </div>

            <div className="receipt-summary">
                {(() => {
                    // Re-calculate Item Subtotal from items
                    const calculatedSubtotal = order.items.reduce((sum, item) => {
                        let price = item.price * item.quantity;
                        if (item.discount) {
                            if (item.discount.type === 'percent') {
                                price = price * (1 - item.discount.value / 100);
                            } else {
                                price = Math.max(0, price - item.discount.value);
                            }
                        }
                        return sum + price;
                    }, 0);

                    const rate = order.taxRateUsed ?? 10;
                    const calculatedTax = calculatedSubtotal * (rate / 100);

                    // Check if points were used
                    const discountPoints = order.discountFromPoints || 0;

                    return (
                        <>
                            <div className="receipt-row">
                                <span>{t('pos.subtotal')}</span>
                                <div style={{ textAlign: 'right' }}>
                                    {formatCurrency(calculatedSubtotal, storeSettings.currency, { showSecondary: storeSettings.enableDualCurrency, secondaryCurrency: storeSettings.secondaryCurrency, exchangeRate: storeSettings.exchangeRate, additionalCurrencies: storeSettings.additionalCurrencies }).split(' / ').map((val, i) => (
                                        <div key={i}>{val}</div>
                                    ))}
                                </div>
                            </div>
                            <div className="receipt-row">
                                <span>{t('pos.tax')} ({rate}%)</span>
                                <div style={{ textAlign: 'right' }}>
                                    {formatCurrency(calculatedTax, storeSettings.currency, { showSecondary: storeSettings.enableDualCurrency, secondaryCurrency: storeSettings.secondaryCurrency, exchangeRate: storeSettings.exchangeRate, additionalCurrencies: storeSettings.additionalCurrencies }).split(' / ').map((val, i) => (
                                        <div key={i}>{val}</div>
                                    ))}
                                </div>
                            </div>
                            {discountPoints > 0 && (
                                <div className="receipt-row">
                                    <span>{t('receipt.points_discount')}</span>
                                    <span>-{formatCurrency(discountPoints, storeSettings.currency)}</span>
                                </div>
                            )}
                        </>
                    );
                })()}
                <div className="receipt-total">
                    <span>{t('receipt.total')}</span>
                    <div style={{ textAlign: 'right' }}>
                        {formatCurrency(order.total, storeSettings.currency, { showSecondary: storeSettings.enableDualCurrency, secondaryCurrency: storeSettings.secondaryCurrency, exchangeRate: storeSettings.exchangeRate, additionalCurrencies: storeSettings.additionalCurrencies }).split(' / ').map((val, i) => (
                            <div key={i}>{val}</div>
                        ))}
                    </div>
                </div>

                <div style={{ margin: '1rem 0', borderTop: '1px dashed black', paddingTop: '0.5rem' }}>
                    <div className="receipt-row">
                        <span>{t('pos.pay_via')} </span>
                        <span style={{ textTransform: 'uppercase' }}>{order.paymentMethod}</span>
                    </div>
                    {order.paymentMethod === 'cash' && order.cashReceived && (
                        <>
                            <div className="receipt-row">
                                <span>{t('payment.cash')}</span>
                                <span>{formatCurrency(order.cashReceived, storeSettings.currency)}</span>
                            </div>
                            <div className="receipt-row">
                                <span>{t('receipt.change')}</span>
                                <span>{formatCurrency(order.change || 0, storeSettings.currency)}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="receipt-footer">
                <p>{storeSettings.footerMessage}</p>
                <p>{t('receipt.thank_you')}</p>
            </div>
        </div>
    );
};
