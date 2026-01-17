import { useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/modals/Modal';
import { useStore } from '../context/StoreContext';
import type { Product } from '../types';
import './ManageProductsPage.css';
import { formatCurrency } from '../utils/formatCurrency';
import { useTranslation } from 'react-i18next';

export const ManageProductsPage = () => {
    const { products, categories, addProduct, updateProduct, deleteProduct, storeSettings } = useStore();
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        price: 0,
        category: '',
        image: ''
    });

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData(product);
        } else {
            setEditingProduct(null);
            setFormData({ name: '', price: 0, category: '', image: 'https://placehold.co/400', stock: 10, barcode: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.price) return; // Simple validation

        if (editingProduct) {
            updateProduct({ ...editingProduct, ...formData } as Product);
        } else {
            addProduct({
                ...formData,
                id: crypto.randomUUID(),
                image: formData.image || 'https://placehold.co/400' // Default if empty
            } as Product);
        }
        handleCloseModal();
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <MainLayout activeTab="products">
            <div className="manage-products-container">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>{t('manage.products_title')}</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>{t('manage.products_subtitle')}</p>
                    </div>
                    <Button onClick={() => handleOpenModal()} leftIcon={<Plus size={18} />}>
                        {t('manage.add_product')}
                    </Button>
                </header>

                <div style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
                    <Input
                        placeholder={t('manage.search_products')}
                        leftIcon={<Search size={18} />}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="table-container">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>{t('manage.image')}</th>
                                <th>{t('product.name')}</th>
                                <th>{t('product.category')}</th>
                                <th>{t('product.barcode')}</th>
                                <th>{t('product.price')}</th>
                                <th>{t('product.stock')}</th>
                                <th style={{ textAlign: 'right' }}>{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td><img src={product.image} alt="" className="product-thumb" /></td>
                                    <td>{product.name}</td>
                                    <td>
                                        <span style={{
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: 'var(--radius-full)',
                                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                            color: 'var(--accent-primary)',
                                            fontSize: '0.75rem',
                                            fontWeight: 600
                                        }}>
                                            {product.category}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                        {product.barcode || '-'}
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{formatCurrency(product.price, storeSettings.currency)}</td>
                                    <td>
                                        <span style={{
                                            color: (product.stock || 0) < 10 ? 'var(--text-danger)' : 'inherit',
                                            fontWeight: (product.stock || 0) < 10 ? 700 : 400
                                        }}>
                                            {product.stock || 0}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions-cell">
                                            <Button size="sm" variant="ghost" className="btn-tiny" onClick={() => handleOpenModal(product)}>
                                                <Pencil size={16} />
                                            </Button>
                                            <Button size="sm" variant="ghost" className="btn-tiny" onClick={() => deleteProduct(product.id)} style={{ color: 'var(--text-danger)' }}>
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                        {t('manage.no_products')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={editingProduct ? t('manage.edit_product') : t('manage.add_product')}
                >
                    <form onSubmit={handleSubmit} className="modal-form">
                        <Input
                            label={t('product.name')}
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <Input
                                label={`${t('product.price')} (${storeSettings.currency})`}
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                required
                            />
                            <Input
                                label={`${t('product.cost')} (${storeSettings.currency})`}
                                type="number"
                                step="0.01"
                                value={formData.costPrice || 0}
                                onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) })}
                            />
                            <Input
                                label={t('product.stock')}
                                type="number"
                                value={formData.stock || 0}
                                onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                                required
                            />
                        </div>
                        <Input
                            label={t('product.barcode')}
                            value={formData.barcode || ''}
                            onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                            placeholder={t('product.scanned_code_placeholder')}
                        />
                        <div className="input-group">
                            <label className="input-label">{t('product.category')}</label>
                            <select
                                className="input-field"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                required
                            >
                                <option value="">{t('product.select_option')}</option>
                                {categories?.map(c => (
                                    <option key={c.id} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <Input
                            label={t('manage.image')}
                            value={formData.image}
                            onChange={e => setFormData({ ...formData, image: e.target.value })}
                            placeholder="https://..."
                        />

                        {/* Variants Section */}
                        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label className="input-label" style={{ margin: 0 }}>{t('manage.variants_opt')}</label>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => {
                                        const newVariant = { id: crypto.randomUUID(), name: '', price: formData.price || 0, stock: 10 };
                                        setFormData({ ...formData, variants: [...(formData.variants || []), newVariant] });
                                    }}
                                >
                                    <Plus size={14} style={{ marginRight: '4px' }} /> {t('manage.add_variant')}
                                </Button>
                            </div>

                            {formData.variants && formData.variants.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {formData.variants.map((variant, index) => (
                                        <div key={variant.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                                            <input
                                                className="input-field"
                                                placeholder={t('manage.size_color')}
                                                value={variant.name}
                                                onChange={e => {
                                                    const updated = [...(formData.variants || [])];
                                                    updated[index].name = e.target.value;
                                                    setFormData({ ...formData, variants: updated });
                                                }}
                                                style={{ flex: 2 }}
                                            />
                                            <input
                                                className="input-field"
                                                type="number"
                                                placeholder={t('product.price')}
                                                value={variant.price}
                                                onChange={e => {
                                                    const updated = [...(formData.variants || [])];
                                                    updated[index].price = parseFloat(e.target.value);
                                                    setFormData({ ...formData, variants: updated });
                                                }}
                                                style={{ flex: 1 }}
                                            />
                                            <input
                                                className="input-field"
                                                type="number"
                                                placeholder={t('product.stock')}
                                                value={variant.stock}
                                                onChange={e => {
                                                    const updated = [...(formData.variants || [])];
                                                    updated[index].stock = parseInt(e.target.value);
                                                    setFormData({ ...formData, variants: updated });
                                                }}
                                                style={{ flex: 1 }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = formData.variants?.filter((_, i) => i !== index);
                                                    setFormData({ ...formData, variants: updated });
                                                }}
                                                style={{ color: 'var(--text-danger)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <Button type="button" variant="secondary" onClick={handleCloseModal}>{t('common.cancel')}</Button>
                            <Button type="submit">{editingProduct ? t('manage.save_changes') : t('manage.create')}</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </MainLayout>
    );
};
