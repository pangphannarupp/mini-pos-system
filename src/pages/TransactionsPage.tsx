import { Download, RotateCcw } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/ui/Button';
import './ManageProductsPage.css'; // Reuse table styles
import * as XLSX from 'xlsx';
import { formatCurrency } from '../utils/formatCurrency';
import { useTranslation } from 'react-i18next';

export const TransactionsPage = () => {
    const { orders, processRefund, storeSettings } = useStore();
    const { t } = useTranslation();

    const handleExport = () => {
        const data = orders.map(order => ({
            [t('transactions.order_id')]: order.id,
            [t('transactions.date')]: new Date(order.date).toLocaleString(),
            [t('transactions.items')]: order.items.map(i => `${i.name} x${i.quantity}`).join(', '),
            [t('transactions.total')]: order.total.toFixed(2),
            [t('transactions.status')]: order.status,
            'Payment Method': order.paymentMethod
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Transactions");
        XLSX.writeFile(wb, `transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <MainLayout activeTab="transactions">
            <div className="manage-products-container">
                <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>{t('transactions.title')}</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{t('transactions.subtitle')}</p>
                    </div>
                    <Button variant="secondary" onClick={handleExport}>
                        <Download size={20} style={{ marginRight: '0.5rem' }} />
                        {t('transactions.export_excel')}
                    </Button>
                </header>

                <div className="table-container">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>{t('transactions.order_id')}</th>
                                <th>{t('transactions.date')}</th>
                                <th>{t('transactions.items')}</th>
                                <th>{t('transactions.total')}</th>
                                <th>{t('transactions.status')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{order.id.slice(0, 8)}...</td>
                                    <td>{new Date(order.date).toLocaleString()}</td>
                                    <td>{order.items.length} {t('pos.items')} ({order.items.map(i => i.name).join(', ').slice(0, 30)}...)</td>
                                    <td style={{ fontWeight: 700 }}>{formatCurrency(order.total, storeSettings.currency)}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: 'var(--radius-full)',
                                                backgroundColor: order.status === 'completed' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: order.status === 'completed' ? 'var(--text-success)' : 'var(--text-danger)',
                                                fontSize: '0.75rem',
                                                fontWeight: 600
                                            }}>
                                                {order.status.toUpperCase()}
                                            </span>

                                            {order.status === 'completed' && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    style={{ padding: '2px 6px', height: 'auto', marginLeft: 'auto' }}
                                                    onClick={() => {
                                                        if (confirm(t('transactions.refund_confirm'))) {
                                                            processRefund(order.id);
                                                        }
                                                    }}
                                                    title={t('transactions.refund')}
                                                >
                                                    <RotateCcw size={14} style={{ marginRight: '4px' }} />
                                                    {t('transactions.refund')}
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                        {t('transactions.no_transactions')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </MainLayout>
    );
};
