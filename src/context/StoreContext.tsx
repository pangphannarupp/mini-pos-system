import type { Product, Order, Category, Customer, CartItem, StoreSettings } from '../types';
import { products as initialProducts } from '../data/products';
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface HeldOrder {
    id: string;
    items: CartItem[];
    date: string;
    customerId?: string;
    note?: string;
}

interface StoreContextType {
    products: Product[];
    orders: Order[];
    categories: Category[];
    customers: Customer[];
    heldOrders: HeldOrder[];
    addProduct: (product: Product) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (id: string) => void;
    addOrder: (order: Order) => void;
    updateOrder: (order: Order) => void;
    processRefund: (orderId: string) => void;
    addCategory: (category: Category) => void;
    updateCategory: (category: Category) => void;
    deleteCategory: (id: string) => void;
    addCustomer: (customer: Customer) => void;
    updateCustomer: (customer: Customer) => void;
    holdOrder: (items: CartItem[], customerId?: string, note?: string) => void;
    resumeOrder: (id: string) => void;
    deleteHeldOrder: (id: string) => void;
    theme: 'dark' | 'light';
    setTheme: (theme: 'light' | 'dark') => void;
    taxRate: number;
    setTaxRate: (rate: number) => void;
    dailySalesGoal: number;
    setDailySalesGoal: (goal: number) => void;
    storeSettings: StoreSettings;
    setStoreSettings: (settings: StoreSettings) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialize state from localStorage or defaults
    const [products, setProducts] = useState<Product[]>(() => {
        const saved = localStorage.getItem('products');
        return saved ? JSON.parse(saved) : initialProducts;
    });

    const [orders, setOrders] = useState<Order[]>(() => {
        const saved = localStorage.getItem('orders');
        return saved ? JSON.parse(saved) : [];
    });

    const [categories, setCategories] = useState<Category[]>(() => {
        const saved = localStorage.getItem('categories');
        return saved ? JSON.parse(saved) : [
            { id: '1', name: 'Food' },
            { id: '2', name: 'Drinks' },
            { id: '3', name: 'Dessert' }
        ];
    });

    const [customers, setCustomers] = useState<Customer[]>(() => {
        const saved = localStorage.getItem('pos_customers');
        return saved ? JSON.parse(saved) : [];
    });

    const [heldOrders, setHeldOrders] = useState<HeldOrder[]>(() => {
        const saved = localStorage.getItem('pos_held_orders');
        return saved ? JSON.parse(saved) : [];
    });

    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        return (localStorage.getItem('pos_theme') as 'light' | 'dark') || 'dark';
    });

    const [taxRate, setTaxRate] = useState<number>(() => {
        const saved = localStorage.getItem('pos_tax_rate');
        return saved ? parseFloat(saved) : 0;
    });

    // Persist changes to localStorage
    useEffect(() => {
        localStorage.setItem('pos_products', JSON.stringify(products));
    }, [products]);

    useEffect(() => {
        localStorage.setItem('pos_orders', JSON.stringify(orders));
    }, [orders]);

    useEffect(() => {
        localStorage.setItem('pos_categories', JSON.stringify(categories));
    }, [categories]);

    useEffect(() => {
        localStorage.setItem('pos_customers', JSON.stringify(customers));
    }, [customers]);

    useEffect(() => {
        localStorage.setItem('pos_held_orders', JSON.stringify(heldOrders));
    }, [heldOrders]);

    useEffect(() => {
        localStorage.setItem('pos_theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('pos_tax_rate', taxRate.toString());
    }, [taxRate]);

    const [dailySalesGoal, setDailySalesGoal] = useState<number>(() => {
        const saved = localStorage.getItem('pos_daily_goal');
        return saved ? parseFloat(saved) : 500; // Default goal 500
    });

    useEffect(() => {
        localStorage.setItem('pos_daily_goal', dailySalesGoal.toString());
    }, [dailySalesGoal]);

    const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
        const saved = localStorage.getItem('pos_store_settings');
        const defaults = {
            name: 'Mini POS Store',
            address: '123 Main St, City, Country',
            phone: '+1 234 567 890',
            footerMessage: 'Thank you for your purchase!',
            currency: '$',
            enableDualCurrency: false,
            secondaryCurrency: '៛',
            exchangeRate: 4100,
            additionalCurrencies: []
        };
        return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    });

    useEffect(() => {
        localStorage.setItem('pos_store_settings', JSON.stringify(storeSettings));
    }, [storeSettings]);

    const addProduct = (product: Product) => {
        setProducts(prev => [...prev, product]);
    };

    const updateProduct = (updatedProduct: Product) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    };

    const deleteProduct = (id: string) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const addOrder = (order: Order) => {
        // Decrement stock
        const newProducts = products.map(p => {
            const itemInOrder = order.items.find(i => i.id === p.id);
            if (itemInOrder && p.stock !== undefined) {
                return { ...p, stock: Math.max(0, p.stock - itemInOrder.quantity) };
            }
            return p;
        });

        // Award points if customer is attached
        if (order.customerId) {
            setCustomers(prev => prev.map(c => {
                if (c.id === order.customerId) {
                    const pointsEarned = Math.floor(order.total); // 1 point per $1
                    let newPoints = c.points + pointsEarned;

                    if (order.pointsRedeemed) {
                        newPoints -= order.pointsRedeemed;
                    }

                    return {
                        ...c,
                        points: Math.max(0, newPoints),
                        totalSpent: c.totalSpent + order.total
                    };
                }
                return c;
            }));
        }

        setProducts(newProducts);
        setOrders(prev => [order, ...prev]);
    };

    const addCategory = (category: Category) => {
        setCategories(prev => [...prev, category]);
    };

    const updateCategory = (updatedCategory: Category) => {
        setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
    };

    const deleteCategory = (id: string) => {
        setCategories(prev => prev.filter(c => c.id !== id));
    };

    const addCustomer = (customer: Customer) => {
        setCustomers(prev => [...prev, customer]);
    };

    const updateCustomer = (customer: Customer) => {
        setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
    };

    const holdOrder = (items: CartItem[], customerId?: string, note?: string) => {
        const held: HeldOrder = {
            id: Date.now().toString(),
            items,
            date: new Date().toISOString(),
            customerId,
            note
        };
        setHeldOrders(prev => [...prev, held]);
    };

    const resumeOrder = (id: string) => {
        setHeldOrders(prev => prev.filter(o => o.id !== id));
    };

    const deleteHeldOrder = (id: string) => {
        setHeldOrders(prev => prev.filter(o => o.id !== id));
    };

    const updateOrder = (order: Order) => {
        setOrders(prev => prev.map(o => o.id === order.id ? order : o));
    };

    const processRefund = (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        if (!order || order.status === 'refunded') return;

        // 1. Update Order Status
        const refundedOrder = { ...order, status: 'refunded' as const };
        updateOrder(refundedOrder);

        // 2. Restock Products
        order.items.forEach(item => {
            const product = products.find(p => p.id === item.id);
            if (product) {
                updateProduct({ ...product, stock: (product.stock || 0) + item.quantity });
            }
        });

        // 3. Deduct Loyalty Points
        if (order.customerId) {
            const customer = customers.find(c => c.id === order.customerId);
            if (customer) {
                const pointsToDeduct = Math.floor(order.total);
                updateCustomer({
                    ...customer,
                    points: Math.max(0, customer.points - pointsToDeduct),
                    totalSpent: Math.max(0, customer.totalSpent - order.total)
                });
            }
        }
    };

    return (
        <StoreContext.Provider value={{
            products,
            categories,
            orders,
            customers,
            heldOrders,
            theme,
            taxRate,
            addProduct,
            updateProduct,
            deleteProduct,
            addCategory,
            updateCategory,
            deleteCategory,
            addOrder,
            updateOrder,
            processRefund,
            addCustomer,
            updateCustomer,
            holdOrder,
            resumeOrder,
            deleteHeldOrder,
            setTheme,
            setTaxRate,
            dailySalesGoal,
            setDailySalesGoal,
            storeSettings,
            setStoreSettings
        }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
};
