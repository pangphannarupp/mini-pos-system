import React from 'react';
import { Plus } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { Product } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { useStore } from '../../context/StoreContext';
import { useTranslation } from 'react-i18next';
import './ProductCard.css';

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
    const { storeSettings } = useStore();
    const { t } = useTranslation();
    const hasStock = product.stock !== undefined ? product.stock > 0 : true;

    return (
        <Card
            hover={hasStock}
            className={`product - card ${!hasStock ? 'out-of-stock' : ''} `}
            padding="sm"
            onClick={() => hasStock && onAddToCart(product)}
            style={{ opacity: hasStock ? 1 : 0.6, cursor: hasStock ? 'pointer' : 'not-allowed' }}
        >
            <div className="product-image-container">
                <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
                {!hasStock && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <span style={{ color: 'white', fontWeight: 'bold', padding: '4px 8px', background: 'red', borderRadius: '4px' }}>
                            {t('product.out_of_stock')}
                        </span>
                    </div>
                )}
            </div>
            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p className="product-category">{product.category}</p>
                    <p style={{ fontSize: '0.75rem', fontWeight: (product.stock ?? 0) < 10 ? 600 : 400, color: (product.stock ?? 0) < 10 ? 'var(--text-danger)' : 'var(--text-secondary)' }}>
                        {product.stock} {t('product.in_stock')}
                    </p>
                </div>
                <div className="product-footer">
                    <span className="product-price">{formatCurrency(product.price, storeSettings.currency)}</span>
                    <Button
                        variant="primary"
                        size="icon"
                        disabled={!hasStock}
                        title={hasStock ? t('product.add_to_cart') : t('product.out_of_stock')}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (hasStock) onAddToCart(product);
                        }}>
                        <Plus size={20} strokeWidth={2.5} />
                    </Button>
                </div>
            </div>
        </Card>
    );
};
