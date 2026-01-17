import { MainLayout } from '../components/layout/MainLayout';
import { Card } from '../components/ui/Card';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, DollarSign, CreditCard, TrendingUp, Package, AlertTriangle, Clock, PieChart as PieChartIcon, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import { useState } from 'react';
import { formatCurrency } from '../utils/formatCurrency';
import { exportOrdersToExcel } from '../utils/exportToExcel';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next';

export const DashboardPage = () => {
    const { orders, products, categories, customers, dailySalesGoal, storeSettings } = useStore(); // Added customers, dailySalesGoal
    const { t } = useTranslation();
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');

    const handleExport = () => {
        exportOrdersToExcel(orders);
    };

    // ... calculations (omitted for brevity, keep existing logic)
    const now = new Date();
    const filteredOrders = orders.filter(o => {
        if (o.status === 'refunded') return false;
        if (timeRange === 'all') return true;

        const orderDate = new Date(o.date);
        const diffTime = Math.abs(now.getTime() - orderDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (timeRange === '7d') return diffDays <= 7;
        if (timeRange === '30d') return diffDays <= 30;
        return true;
    });

    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Daily Goal Progress
    const today = new Date().toLocaleDateString();
    const todayRevenue = orders
        .filter(o => o.status !== 'refunded' && new Date(o.date).toLocaleDateString() === today)
        .reduce((sum, o) => sum + o.total, 0);
    const goalProgress = Math.min((todayRevenue / dailySalesGoal) * 100, 100);

    // Top Customers
    const topCustomers = [...customers]
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 3);

    // Low Stock Items (threshold < 10)
    const lowStockItems = products.filter(p => (p.stock || 0) < 10).slice(0, 5);

    // Recent Activity
    const recentActivity = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    const validOrders = filteredOrders;
    const netRevenue = totalRevenue;

    // Prepare Sales Trend Data
    const salesByIsoDate = validOrders.reduce((acc, order) => {
        const date = new Date(order.date).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + order.total;
        return acc;
    }, {} as Record<string, number>);

    const salesDataSorted = Object.entries(salesByIsoDate)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, sales]) => ({
            date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            sales
        }));

    // Prepare Top Products Data
    const productSales = validOrders.flatMap(o => o.items).reduce((acc, item) => {
        acc[item.name] = (acc[item.name] || 0) + item.quantity;
        return acc;
    }, {} as Record<string, number>);

    const topProductsData = Object.entries(productSales)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    // Prepare Category Data
    const salesByCategory = validOrders.flatMap(o => o.items).reduce((acc, item) => {
        const product = products.find(p => p.id === item.id);
        const categoryId = product?.category;
        const categoryName = categories.find(c => c.id === categoryId)?.name || 'Uncategorized';

        acc[categoryName] = (acc[categoryName] || 0) + (item.price * item.quantity);
        return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(salesByCategory).map(([name, value]) => ({ name, value }));
    const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    const stats = [
        { label: t('dashboard.revenue'), value: formatCurrency(netRevenue, storeSettings.currency), icon: <DollarSign size={24} />, color: 'var(--accent-primary)' },
        { label: t('dashboard.orders'), value: totalOrders, icon: <ShoppingBag size={24} />, color: 'var(--text-success)' },
        { label: t('dashboard.avg_value'), value: formatCurrency(averageOrderValue, storeSettings.currency), icon: <CreditCard size={24} />, color: 'var(--text-secondary)' },
        { label: t('dashboard.products'), value: products.length, icon: <Package size={24} />, color: 'var(--text-info)' },
    ];

    return (
        <MainLayout activeTab="dashboard">
            <div style={{ paddingBottom: '2rem' }}>
                <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>{t('common.dashboard')}</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{t('dashboard.overview')}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Button variant="secondary" onClick={handleExport} size="sm">
                            <Download size={16} style={{ marginRight: '0.5rem' }} />
                            {t('dashboard.export_report')}
                        </Button>
                        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
                            {(['7d', '30d', 'all'] as const).map(range => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    style={{
                                        border: 'none',
                                        background: timeRange === range ? 'var(--bg-primary)' : 'transparent',
                                        color: timeRange === range ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        padding: '0.5rem 1rem',
                                        borderRadius: 'calc(var(--radius-md) - 2px)',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        boxShadow: timeRange === range ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {range === '7d' ? t('dashboard.last_7_days') : range === '30d' ? t('dashboard.last_30_days') : t('dashboard.all_time')}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    {stats.map((stat, i) => (
                        <Card key={i} padding="lg">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
                                    backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', color: stat.color
                                }}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{stat.label}</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Daily Goal Progress */}
                <Card padding="lg" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{t('dashboard.daily_sales_goal')}</h3>
                        <span style={{ fontWeight: 600 }}>
                            {formatCurrency(todayRevenue, storeSettings.currency)} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>/ {formatCurrency(dailySalesGoal, storeSettings.currency)}</span>
                        </span>
                    </div>
                    <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${goalProgress}%`,
                            height: '100%',
                            backgroundColor: goalProgress >= 100 ? 'var(--text-success)' : 'var(--accent-primary)',
                            transition: 'width 0.5s ease-out'
                        }} />
                    </div>
                </Card>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>

                    {/* Top Customers Widget */}
                    <Card padding="lg">
                        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <TrendingUp size={20} style={{ color: 'var(--accent-primary)' }} />
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>{t('dashboard.top_customers')}</h3>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {topCustomers.length === 0 ? (
                                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: '2rem 0' }}>{t('dashboard.no_customer_data')}</p>
                            ) : (
                                topCustomers.map((c, i) => (
                                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '32px', height: '32px', borderRadius: '50%',
                                                backgroundColor: i === 0 ? 'rgba(255, 187, 40, 0.2)' : 'var(--bg-secondary)',
                                                color: i === 0 ? '#FFBB28' : 'var(--text-secondary)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 700, fontSize: '0.875rem'
                                            }}>
                                                {i + 1}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{c.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.phone}</div>
                                            </div>
                                        </div>
                                        <div style={{ fontWeight: 700 }}>{formatCurrency(c.totalSpent, storeSettings.currency)}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                    {/* Charts Section */}

                    {/* Sales Trend */}
                    <Card padding="lg">
                        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>{t('dashboard.sales_trend')}</h3>
                            <TrendingUp size={20} style={{ color: 'var(--text-secondary)' }} />
                        </div>
                        <div style={{ height: '300px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesDataSorted}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="var(--text-secondary)"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="var(--text-secondary)"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value: number) => formatCurrency(value, storeSettings.currency)}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-md)' }}
                                        itemStyle={{ color: 'var(--text-primary)' }}
                                        labelStyle={{ color: 'var(--text-secondary)' }}
                                        formatter={(value: number | undefined) => [formatCurrency(value || 0, storeSettings.currency), 'Sales']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="sales"
                                        stroke="var(--accent-primary)"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorSales)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Top Products */}
                    <Card padding="lg">
                        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>{t('dashboard.top_products')}</h3>
                            <Package size={20} style={{ color: 'var(--text-secondary)' }} />
                        </div>
                        <div style={{ height: '300px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topProductsData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border-color)" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={100}
                                        stroke="var(--text-secondary)"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'var(--bg-secondary)' }}
                                        contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-md)' }}
                                        itemStyle={{ color: 'var(--text-primary)' }}
                                    />
                                    <Bar
                                        dataKey="quantity"
                                        fill="var(--text-success)"
                                        radius={[0, 4, 4, 0]}
                                        barSize={20}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                    {/* Category Sales Pie Chart */}
                    <Card padding="lg">
                        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>{t('dashboard.category_sales')}</h3>
                            <PieChartIcon size={20} style={{ color: 'var(--text-secondary)' }} />
                        </div>
                        <div style={{ height: '300px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number | undefined) => [formatCurrency(value || 0, storeSettings.currency), 'Sales']}
                                        contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-md)' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Low Stock Alert */}
                    <Card padding="lg">
                        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertTriangle size={20} style={{ color: 'var(--text-warning)' }} />
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>{t('dashboard.low_stock')}</h3>
                            </div>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t('dashboard.low_stock_threshold')}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {lowStockItems.length === 0 ? (
                                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: '2rem 0' }}>{t('dashboard.stock_healthy')}</p>
                            ) : (
                                lowStockItems.map(p => (
                                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{p.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SKU: {p.barcode || 'N/A'}</div>
                                        </div>
                                        <div style={{ color: 'var(--text-danger)', fontWeight: 600, backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                                            {p.stock} {t('dashboard.stock_left')}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                    {/* Recent Activity */}
                    <Card padding="lg" style={{ gridColumn: '1 / -1' }}>
                        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={20} style={{ color: 'var(--text-secondary)' }} />
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>{t('dashboard.recent_transactions')}</h3>
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                        <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.875rem' }}>{t('receipt.order_no')}</th>
                                        <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.875rem' }}>{t('receipt.date')}</th>
                                        <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.875rem' }}>Status</th>
                                        <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.875rem' }}>{t('receipt.total')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentActivity.map(order => (
                                        <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{order.id.slice(0, 8)}</td>
                                            <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{new Date(order.date).toLocaleString()}</td>
                                            <td style={{ padding: '0.75rem' }}>
                                                <span style={{
                                                    padding: '0.2rem 0.6rem',
                                                    borderRadius: 'var(--radius-full)',
                                                    backgroundColor: order.status === 'completed' ? 'rgba(34, 197, 94, 0.1)' : order.status === 'refunded' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-secondary)',
                                                    color: order.status === 'completed' ? 'var(--text-success)' : order.status === 'refunded' ? 'var(--text-danger)' : 'var(--text-primary)',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600
                                                }}>
                                                    {order.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem', fontWeight: 600 }}>{formatCurrency(order.total, storeSettings.currency)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                </div>
            </div>
        </MainLayout>
    );
};
