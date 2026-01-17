import React, { useState } from 'react';
import { LayoutDashboard, ShoppingCart, FileText, Settings, LogOut, Sun, Moon, Package, Keyboard, Languages } from 'lucide-react';
import { ShortcutsModal } from '../modals/ShortcutsModal';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import './Layout.css';

interface SidebarProps {
    activeTab?: string;
    onTabChange?: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab = 'pos', onTabChange }) => {
    const { theme, setTheme } = useStore();
    const { user, logout } = useAuth();
    const [showShortcuts, setShowShortcuts] = useState(false);
    const { t, i18n } = useTranslation();

    const handleToggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'km' : 'en';
        i18n.changeLanguage(newLang);
    };

    const menuItems = [
        { id: 'dashboard', icon: <LayoutDashboard size={24} />, label: t('common.dashboard') },
        { id: 'pos', icon: <ShoppingCart size={24} />, label: t('common.pos') },
        { id: 'transactions', icon: <FileText size={24} />, label: t('common.orders') },
    ];

    if (user?.role === 'admin') {
        menuItems.push(
            { id: 'manage-products', icon: <Package size={24} />, label: t('common.products') },
            { id: 'categories', icon: <FileText size={24} />, label: t('product.category') },
            { id: 'settings', icon: <Settings size={24} />, label: t('common.settings') }
        );
    }

    return (
        <>
            <div className="sidebar">
                <div className="sidebar-logo">
                    <ShoppingCart size={28} />
                </div>

                <div className="sidebar-nav">
                    {menuItems.map((item) => (
                        <div
                            key={item.id}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => onTabChange?.(item.id)}
                            title={item.label}
                        >
                            {item.icon}
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', alignItems: 'center' }}>

                    <div
                        className="nav-item"
                        onClick={() => setShowShortcuts(true)}
                        title={t('common.shortcuts')}
                        style={{ cursor: 'pointer' }}
                    >
                        <Keyboard size={24} />
                    </div>

                    <div
                        className="nav-item"
                        onClick={toggleLanguage}
                        title={t('common.switch_language')}
                        style={{ cursor: 'pointer', flexDirection: 'column', gap: '2px', height: 'auto', padding: '0.5rem' }}
                    >
                        <Languages size={20} />
                        <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>{i18n.language === 'en' ? 'EN' : 'KM'}</span>
                    </div>

                    <div className="nav-item" style={{ cursor: 'default', opacity: 0.7, fontSize: '0.75rem', flexDirection: 'column', gap: 0, height: 'auto', padding: '0.5rem' }}>
                        <span style={{ fontWeight: 'bold' }}>{user?.username}</span>
                        <span style={{ fontSize: '0.65rem' }}>{user?.role}</span>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <button
                            onClick={handleToggleTheme}
                            className="nav-item"
                            style={{
                                width: '100%',
                                marginBottom: '0.5rem',
                                background: 'transparent',
                                border: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                height: 'auto',
                                padding: '0.5rem'
                            }}
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            <span style={{ fontSize: '0.65rem', marginTop: '0.25rem' }}>{theme === 'dark' ? t('common.light_mode') : t('common.dark_mode')}</span>
                        </button>
                        <div className="nav-item" title={t('common.logout')} onClick={logout}>
                            <LogOut size={24} />
                        </div>
                    </div>
                </div>
            </div>
            <ShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
        </>
    );
};
