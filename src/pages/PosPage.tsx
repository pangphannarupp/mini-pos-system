import { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { ProductCard } from '../components/pos/ProductCard';
import { CartSidebar } from '../components/pos/CartSidebar';
import { Receipt } from '../components/receipt/Receipt';
import { Modal } from '../components/modals/Modal';
import { PaymentModal } from '../components/modals/PaymentModal';
import { CustomerSelectModal } from '../components/modals/CustomerSelectModal';
import { HeldOrdersModal } from '../components/modals/HeldOrdersModal';
import { VariantSelectionModal } from '../components/modals/VariantSelectionModal';
import { useStore } from '../context/StoreContext';
import { User, X, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import type { Product, CartItem, Order, Customer } from '../types';
import type { HeldOrder } from '../context/StoreContext';
import { useScanner } from '../hooks/useScanner';
import { useTranslation } from 'react-i18next';

export const PosPage = () => {
    const { products, addOrder, taxRate, heldOrders, customers } = useStore();
    const { t } = useTranslation();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastOrder, setLastOrder] = useState<Order | null>(null);

    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

    // Initial definition of addToCart before it's used in useScanner
    // But since addToCart depends on state, we need to be careful with closure staleness if not using functional updates or refs.
    // Actually, addToCart uses functional state update for setCartItems, so it's safe to call.
    // However, we need to define addToCart BEFORE calling useScanner if we pass it directly.
    // Or just define logic inside useScanner callback.

    // Let's rely on the fact that addToCart is defined below in original code, 
    // but we are injecting code at top. 
    // We should probably move addToCart definition UP or define handleScan after addToCart.
    // Easier to just define handleScan logic inside the hook usage or after addToCart.

    // I will replace the component start to allow reordering if needed, but 'addToCart' is defined later in original file.
    // So I will insert the hook call AFTER addToCart definition.

    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const [productForVariantKeys, setProductForVariantKeys] = useState<Product | null>(null);

    const checkAndAddToCart = (product: Product) => {
        if (product.variants && product.variants.length > 0) {
            setProductForVariantKeys(product);
            setIsVariantModalOpen(true);
        } else {
            addToCart(product);
        }
    };

    const addToCart = (product: Product, variant?: any) => {
        setCartItems(prev => {
            // If variant exists, we treat it as a unique items based on productID + variantID
            // Actually, we should probably generate a composite ID/key in cart or check for matching variant.
            const existingIndex = prev.findIndex(item =>
                item.id === product.id &&
                (!variant ? !item.selectedVariant : item.selectedVariant?.id === variant.id)
            );

            const availableStock = variant ? (variant.stock ?? 0) : (product.stock ?? 0);

            if (existingIndex >= 0) {
                const existing = prev[existingIndex];
                if (existing.quantity + 1 > availableStock) {
                    alert(`Not enough stock for ${product.name}${variant ? ' (' + variant.name + ')' : ''}. Only ${availableStock} available.`);
                    return prev;
                }

                const updated = [...prev];
                updated[existingIndex] = { ...existing, quantity: existing.quantity + 1 };
                return updated;
            } else {
                if (1 > availableStock) {
                    alert(`Not enough stock for ${product.name}.`);
                    return prev;
                }
                // When adding variant, override price with variant price
                const price = variant ? variant.price : product.price;
                return [...prev, { ...product, quantity: 1, selectedVariant: variant, price }];
            }
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCartItems(prev => prev.map(item => {
            if (item.id === id) {
                const product = products.find(p => p.id === id);
                const availableStock = product?.stock ?? 0;

                if (delta > 0 && item.quantity + delta > availableStock) {
                    return item;
                }

                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const updateCartItem = (id: string, updates: Partial<CartItem>) => {
        setCartItems(prev => prev.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ));
    };

    const removeItem = (id: string) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    useScanner((code) => {
        // Search by barcode first, then ID (as fallback or for manual entry if we supported it)
        const product = products.find(p => p.barcode === code) || products.find(p => p.id === code);

        if (product) {
            addToCart(product);
            // Optional: Play sound or show toast
        } else {
            // Optional: Show "Product not found" error
            console.warn(`Product with barcode ${code} not found`);
        }
    });

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [pendingTotal, setPendingTotal] = useState(0);

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

    const handleCheckout = () => {
        if (cartItems.length === 0) return;
        const subtotal = cartItems.reduce((sum, item) => sum + calculateItemPrice(item), 0);
        const tax = subtotal * (taxRate / 100);
        const total = subtotal + tax;
        setPendingTotal(total);
        setIsPaymentModalOpen(true);
    };

    const [isHeldOrdersModalOpen, setIsHeldOrdersModalOpen] = useState(false);
    const { holdOrder, deleteHeldOrder } = useStore();

    const handleHoldOrder = () => {
        if (cartItems.length === 0) return;

        const note = prompt("Add a note for this held order? (Optional)");
        holdOrder(cartItems, selectedCustomer?.id, note || undefined);

        setCartItems([]);
        setSelectedCustomer(null);
        // Optional: toast success
    };

    const handleResumeOrder = (order: HeldOrder) => {
        if (cartItems.length > 0) {
            if (!confirm("Current cart will be cleared. Continue?")) return;
        }

        setCartItems(order.items);
        deleteHeldOrder(order.id);

        // Restore customer if present
        if (order.customerId) {
            const customer = customers.find(c => c.id === order.customerId);
            setSelectedCustomer(customer || null);
        } else {
            setSelectedCustomer(null);
        }

        setIsHeldOrdersModalOpen(false);
    };

    const handlePaymentConfirm = (paymentMethod: Order['paymentMethod'], cashReceived?: number, change?: number, pointsRedeemed?: number, discountFromPoints?: number) => {
        const newOrder: Order = {
            id: crypto.randomUUID(),
            items: [...cartItems],
            // Wait, if points are redeemed, the total stored in order usually reflects the PAID amount or we store subtotal and discount. 
            // Let's store the original total in 'subtotal' (if we had it) or 'total' as the value of goods.
            // But for revenue calculation, we usually want the actual money received? 
            // Let's keep 'total' as the final amount payable by customer (after discount).
            // Actually, in `StoreContext`, we use `order.total` for revenue. If points are used, revenue is less.
            // So we should subtract discountFromPoints from total? 
            // Yes, if I buy $10 item and use $1 points, I pay $9. Revenue is $9? Or $10 is revenue and $1 is expense? 
            // For simple POS, let's say total is what customer pays. 
            // However, we want to track 'total' value of goods too. 
            // Let's use the new fields I added to types: `subtotal`, `discountTotal` logic if I added it. 
            // I added 'pointsRedeemed' and 'discountFromPoints'.
            // Let's set 'total' to the amount AFTER point deduction to keep revenue simple? 
            // Or keep 'total' as the full value and accounting resolves it? 
            // If I change 'total', then `StoreContext` points calculation `Math.floor(order.total)` will award fewer points. That makes sense (don't earn points on points).

            // Let's do: total = pendingTotal - (discountFromPoints || 0)

            // BUT wait, pendingTotal was calculated BEFORE points were applied in PaymentModal logic.
            // In PaymentModal, I Calculate `finalTotal = total - discountFromPoints`.
            // So here, I should receive the effective paid amount? 
            // PaymentModal doesn't pass back finalTotal. It passes `discountFromPoints`.

            total: Math.max(0, pendingTotal - (discountFromPoints || 0)),

            date: new Date().toISOString(),
            status: 'completed',
            paymentMethod,
            cashReceived,
            change,
            taxRateUsed: taxRate,
            customerId: selectedCustomer?.id,
            pointsRedeemed,
            discountFromPoints
        };

        addOrder(newOrder);
        setLastOrder(newOrder);
        setCartItems([]);
        setSelectedCustomer(null);
        setIsPaymentModalOpen(false);
        setShowReceipt(true);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <MainLayout
            activeTab="pos"
            rightPanel={
                <CartSidebar
                    items={cartItems}
                    onUpdateQuantity={updateQuantity}
                    onUpdateItem={updateCartItem}
                    onRemoveItem={removeItem}
                    onCheckout={handleCheckout}
                    onHoldOrder={handleHoldOrder}
                />
            }
        >
            <div style={{ paddingBottom: '2rem' }}>
                <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>{t('pos.menu')}</h1>
                            {heldOrders.length > 0 && (
                                <Button size="sm" variant="secondary" onClick={() => setIsHeldOrdersModalOpen(true)} title={t('pos.held_orders')}>
                                    <Clock size={16} style={{ marginRight: '4px' }} />
                                    {heldOrders.length} {t('pos.held_orders').split(' ')[0]} {/* Simplified for label */}
                                </Button>
                            )}
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            {t('pos.select_products')}
                        </p>
                    </div>

                    {selectedCustomer ? (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '1rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--accent-primary)'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedCustomer.name}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>{selectedCustomer.points} pts</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(null)} style={{ padding: '4px', height: 'auto' }}>
                                <X size={16} />
                            </Button>
                        </div>
                    ) : (
                        <Button variant="secondary" onClick={() => setIsCustomerModalOpen(true)}>
                            <User size={20} style={{ marginRight: '0.5rem' }} />
                            {t('pos.select_customer')}
                        </Button>
                    )}
                </header>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {products.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={checkAndAddToCart}
                        />
                    ))}
                </div>
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                total={pendingTotal}
                customer={selectedCustomer}
                onConfirm={handlePaymentConfirm}
            />

            <CustomerSelectModal
                isOpen={isCustomerModalOpen}
                onClose={() => setIsCustomerModalOpen(false)}
                onSelect={(customer) => {
                    setSelectedCustomer(customer);
                    setIsCustomerModalOpen(false);
                }}
            />

            <VariantSelectionModal
                isOpen={isVariantModalOpen}
                onClose={() => setIsVariantModalOpen(false)}
                product={productForVariantKeys}
                onConfirm={(variant) => {
                    if (productForVariantKeys) {
                        addToCart(productForVariantKeys, variant);
                    }
                }}
            />

            <HeldOrdersModal
                isOpen={isHeldOrdersModalOpen}
                onClose={() => setIsHeldOrdersModalOpen(false)}
                onResume={handleResumeOrder}
            />

            {/* Receipt Modal for Post-Checkout */}
            <Modal
                isOpen={showReceipt}
                onClose={() => setShowReceipt(false)}
                title={t('modals.payment_success.title')}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {lastOrder && <Receipt order={lastOrder} />}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', width: '100%', justifyContent: 'center' }}>
                        <button className="btn btn-secondary" onClick={() => setShowReceipt(false)}>{t('modals.payment_success.close')}</button>
                        <button className="btn btn-primary" onClick={handlePrint}>{t('modals.payment_success.print')}</button>
                    </div>
                </div>
            </Modal>

            {/* Cart Sidebar injected via portal or conditional logic if MainLayout supported it properly. 
          For now, we know MainLayout renders children and accepts rightPanel prop.
          Wait, I can't pass props to MainLayout if I'm inside it... 
          Actually, I am rendering MainLayout here. So I CAN pass rightPanel.
      */}
        </MainLayout>
    );
};
