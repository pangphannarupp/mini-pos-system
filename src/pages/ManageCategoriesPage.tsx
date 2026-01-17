import { useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/modals/Modal';
import { useStore } from '../context/StoreContext';
import type { Category } from '../types';
import './ManageProductsPage.css'; // Reuse table styles
import { useTranslation } from 'react-i18next';

export const ManageCategoriesPage = () => {
    const { categories, addCategory, updateCategory, deleteCategory } = useStore();
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [name, setName] = useState('');

    const handleOpenModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setName(category.name);
        } else {
            setEditingCategory(null);
            setName('');
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        if (editingCategory) {
            updateCategory({ ...editingCategory, name });
        } else {
            addCategory({
                id: crypto.randomUUID(),
                name
            });
        }
        handleCloseModal();
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <MainLayout activeTab="categories">
            <div className="manage-products-container">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>{t('manage.categories_title')}</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>{t('manage.categories_subtitle')}</p>
                    </div>
                    <Button onClick={() => handleOpenModal()} leftIcon={<Plus size={18} />}>
                        {t('manage.add_category')}
                    </Button>
                </header>

                <div style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
                    <Input
                        placeholder={t('manage.search_categories')}
                        leftIcon={<Search size={18} />}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="table-container">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>{t('manage.category_name')}</th>
                                <th style={{ textAlign: 'right' }}>{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategories.map(category => (
                                <tr key={category.id}>
                                    <td>{category.name}</td>
                                    <td>
                                        <div className="actions-cell">
                                            <Button size="sm" variant="ghost" className="btn-tiny" onClick={() => handleOpenModal(category)}>
                                                <Pencil size={16} />
                                            </Button>
                                            <Button size="sm" variant="ghost" className="btn-tiny" onClick={() => deleteCategory(category.id)} style={{ color: 'var(--text-danger)' }}>
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredCategories.length === 0 && (
                                <tr>
                                    <td colSpan={2} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                        {t('manage.no_categories')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={editingCategory ? t('manage.edit_category') : t('manage.add_category')}
                >
                    <form onSubmit={handleSubmit} className="modal-form">
                        <Input
                            label={t('manage.category_name')}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            autoFocus
                        />

                        <div className="modal-actions">
                            <Button type="button" variant="secondary" onClick={handleCloseModal}>{t('common.cancel')}</Button>
                            <Button type="submit">{editingCategory ? t('manage.save_changes') : t('manage.create')}</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </MainLayout>
    );
};
