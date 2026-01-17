import type { Product } from '../types';

export const products: Product[] = [
    {
        id: '1',
        name: 'Espresso',
        price: 3.50,
        category: 'Drinks',
        image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400',
        stock: 50
    },
    {
        id: '2',
        name: 'Cappuccino',
        price: 4.50,
        category: 'Drinks',
        image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400',
        stock: 45
    },
    {
        id: '3',
        name: 'Burger',
        price: 5.99,
        category: 'Food',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        stock: 50,
        barcode: '1111'
    },
    {
        id: '4', // Changed from '2' to '4' to avoid ID conflict
        name: 'Fries',
        price: 2.99,
        category: 'Food',
        image: 'https://images.unsplash.com/photo-1573080496987-8198cb7fcd02?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        stock: 100,
        barcode: '2222'
    },
    {
        id: '5', // Changed from '3' to '5' to avoid ID conflict
        name: 'Cola',
        price: 1.99,
        category: 'Drinks',
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        stock: 200,
        barcode: '3333'
    }
];
