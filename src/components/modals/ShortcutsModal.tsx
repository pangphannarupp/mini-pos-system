import { Keyboard } from 'lucide-react';
import { Modal } from './Modal';
import { useTranslation } from 'react-i18next';

interface ShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ShortcutsModal = ({ isOpen, onClose }: ShortcutsModalProps) => {
    const { t } = useTranslation();
    const shortcuts = [
        { key: 'Enter', action: t('shortcuts.enter_action') },
        { key: 'Esc', action: t('shortcuts.esc_action') },
        { key: 'Ctrl + P', action: t('shortcuts.print_action') },
        // Add more real shortcuts if we implement them, 
        // for now documenting standard behaviors and future ones.
        { key: 'Focus Search', action: t('shortcuts.focus_action') },
    ];

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('shortcuts.title')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {shortcuts.map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{s.action}</span>
                        <kbd style={{
                            backgroundColor: 'var(--bg-secondary)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                            border: '1px solid var(--border-color)'
                        }}>
                            {s.key}
                        </kbd>
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem', textAlign: 'center' }}>
                <Keyboard size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                {t('shortcuts.wizard_msg')}
            </div>
        </Modal>
    );
};
