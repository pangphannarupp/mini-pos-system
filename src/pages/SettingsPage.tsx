import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { MainLayout } from '../components/layout/MainLayout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next';

export const SettingsPage = () => {
    const { taxRate, setTaxRate, dailySalesGoal, setDailySalesGoal, storeSettings, setStoreSettings } = useStore();
    const { showToast } = useToast();
    const { t } = useTranslation();

    // Local state
    const [rate, setRate] = useState(taxRate);
    const [goal, setGoal] = useState(dailySalesGoal);
    const [settings, setSettings] = useState(storeSettings);

    useEffect(() => {
        setRate(taxRate);
        setGoal(dailySalesGoal);
        setSettings(storeSettings);
    }, [taxRate, dailySalesGoal, storeSettings]);

    const handleSave = () => {
        setTaxRate(rate);
        setDailySalesGoal(goal);
        setStoreSettings(settings); // Save store settings
        showToast(t('settings.save_success'), 'success');
    };

    return (
        <MainLayout activeTab="settings">
            <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
                <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>{t('settings.title')}</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            {t('settings.description')}
                        </p>
                    </div>
                    <Button variant="primary" onClick={handleSave} size="lg">
                        {t('settings.save_all')}
                    </Button>
                </header>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
                    gap: '2rem',
                    alignItems: 'start'
                }}>
                    {/* Column 1: General & Preferences */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <Card padding="lg">
                            <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>{t('settings.general_title')}</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                                    {t('settings.general_desc')}
                                </p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <Input
                                    label={t('settings.tax_rate')}
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={rate}
                                    onChange={(e) => setRate(parseFloat(e.target.value))}
                                />

                                <Input
                                    label={`${t('settings.daily_goal')} (${settings.currency || '$'})`}
                                    type="number"
                                    min="0"
                                    step="10"
                                    value={goal}
                                    onChange={(e) => setGoal(parseFloat(e.target.value))}
                                />
                            </div>
                        </Card>
                    </div>

                    {/* Column 2: Store Identity (Receipt) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <Card padding="lg">
                            <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>{t('settings.receipt_branding_title')}</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                                    {t('settings.receipt_branding_desc')}
                                </p>
                            </div>


                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <Input
                                    label={t('settings.store_name')}
                                    value={settings.name}
                                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                                />

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <Input
                                        label={t('settings.phone')}
                                        value={settings.phone}
                                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                    />
                                    <Input
                                        label={t('settings.address')}
                                        value={settings.address}
                                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                    />
                                </div>

                                <Input
                                    label={t('settings.currency_symbol')}
                                    value={settings.currency || '$'}
                                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                    placeholder="$ or ៛"
                                />

                                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={settings.enableDualCurrency}
                                            onChange={(e) => setSettings({ ...settings, enableDualCurrency: e.target.checked })}
                                            style={{ width: '1.1rem', height: '1.1rem' }}
                                        />
                                        <span style={{ fontWeight: 600 }}>{t('settings.enable_dual_currency')}</span>
                                    </label>

                                    {settings.enableDualCurrency && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingLeft: '1.6rem' }}>
                                            <Input
                                                label={t('settings.secondary_symbol')}
                                                value={settings.secondaryCurrency || '៛'}
                                                onChange={(e) => setSettings({ ...settings, secondaryCurrency: e.target.value })}
                                            />
                                            <Input
                                                label={`${t('settings.exchange_rate')} (1 ${settings.currency} = ?)`}
                                                type="number"
                                                value={settings.exchangeRate || 4100}
                                                onChange={(e) => setSettings({ ...settings, exchangeRate: parseFloat(e.target.value) })}
                                            />

                                            {/* Additional Currencies List */}
                                            {settings.additionalCurrencies?.map((curr, index) => (
                                                <div key={index} style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                                                    <Input
                                                        label={`${t('settings.additional_currencies')} ${index + 3}`}
                                                        value={curr.symbol}
                                                        onChange={(e) => {
                                                            const newCurrencies = [...(settings.additionalCurrencies || [])];
                                                            newCurrencies[index] = { ...curr, symbol: e.target.value };
                                                            setSettings({ ...settings, additionalCurrencies: newCurrencies });
                                                        }}
                                                    />
                                                    <Input
                                                        label={`Rate (1 ${settings.currency} = ?)`}
                                                        type="number"
                                                        value={curr.exchangeRate}
                                                        onChange={(e) => {
                                                            const newCurrencies = [...(settings.additionalCurrencies || [])];
                                                            newCurrencies[index] = { ...curr, exchangeRate: parseFloat(e.target.value) };
                                                            setSettings({ ...settings, additionalCurrencies: newCurrencies });
                                                        }}
                                                    />
                                                    <Button
                                                        variant="secondary"
                                                        style={{ marginBottom: '2px', color: 'var(--text-danger)', borderColor: 'var(--border-color)' }}
                                                        onClick={() => {
                                                            const newCurrencies = settings.additionalCurrencies?.filter((_, i) => i !== index);
                                                            setSettings({ ...settings, additionalCurrencies: newCurrencies });
                                                        }}
                                                    >
                                                        {t('settings.remove')}
                                                    </Button>
                                                </div>
                                            ))}

                                            <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                                                <Button
                                                    variant="secondary"
                                                    style={{ width: '100%' }}
                                                    onClick={() => {
                                                        setSettings({
                                                            ...settings,
                                                            additionalCurrencies: [
                                                                ...(settings.additionalCurrencies || []),
                                                                { symbol: '?', exchangeRate: 1 }
                                                            ]
                                                        });
                                                    }}
                                                >
                                                    {t('settings.add_currency')}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Input
                                    label={t('settings.footer_message')}
                                    value={settings.footerMessage}
                                    onChange={(e) => setSettings({ ...settings, footerMessage: e.target.value })}
                                    placeholder={t('settings.footer_placeholder')}
                                />
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};
