export interface Product {
    id: string;
    name: string;
    price?: number;
    originalPrice?: number;
    weight: string;
    image: string;
    rating: number;
    category: string;
    inStock: boolean;
    isNew?: boolean;
    discount?: number;
    isPriceHidden?: boolean; // New flag for visibility control
}


export interface Category {
    id: string;
    name: string;
    icon: string; // We'll use Lucide icon names or image paths later
    slug: string;
}

export interface User {
    id: number | string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    role?: 'consumer' | 'b2b' | 'admin' | 'owner' | 'manager';
    b2bRole?: 'owner' | 'manager';
}

export interface CartItem extends Product {
    quantity: number;
}

export interface BusinessEntity {
    id: string;
    name: string;
    address: string;
    phone: string;
    tin?: string;
    bin?: string;
    vat?: string;
    bankName?: string;
    bankAccount?: string;
    bankBranch?: string;
}

export const categories: Category[] = [
    { id: '1', name: 'Fresh Vegetables', icon: 'Carrot', slug: 'vegetables' },
    { id: '2', name: 'Fresh Fruits', icon: 'Apple', slug: 'fruits' },
    { id: '3', name: 'Fish & Meat', icon: 'Fish', slug: 'fish-meat' },
    { id: '4', name: 'Dairy & Eggs', icon: 'Milk', slug: 'dairy-eggs' },
    { id: '5', name: 'Rice, Dal & Oil', icon: 'Wheat', slug: 'rice-dal-oil' },
    { id: '6', name: 'Snacks', icon: 'Cookie', slug: 'snacks' },
    { id: '7', name: 'Beverages', icon: 'Coffee', slug: 'beverages' },
    { id: '8', name: 'Baby Care', icon: 'Baby', slug: 'baby-care' },
    { id: '9', name: 'Cleaning', icon: 'Spray', slug: 'cleaning' },
    { id: '10', name: 'Home & Kitchen', icon: 'Home', slug: 'home-kitchen' },
];

export const products: Product[] = [
    // Vegetables
    {
        id: 'v1',
        name: 'Fresh Potato (Gol Alu)',
        price: 45, // Restored price
        isPriceHidden: true, // Hidden for guests
        originalPrice: 55,
        weight: '1 kg',
        image: '/images/potato.jpg',
        rating: 4.8,
        category: 'vegetables',
        inStock: true,
        discount: 18
    },
    {
        id: 'v2',
        name: 'Deshi Onion (Peyaj)',
        price: 90, // Restored price
        isPriceHidden: true, // Hidden for guests
        weight: '1 kg',
        image: '/images/onion.jpg',
        rating: 4.5,
        category: 'vegetables',
        inStock: true
    },
    {
        id: 'v3',
        name: 'Green Chili (Kacha Morich)',
        price: 30,
        weight: '250 gm',
        image: '/images/chili.jpg',
        rating: 4.9,
        category: 'vegetables',
        inStock: true
    },
    {
        id: 'v4',
        name: 'Tomato',
        price: 60,
        weight: '1 kg',
        image: '/images/tomato.jpg',
        rating: 4.7,
        category: 'vegetables',
        inStock: true
    },
    // Fruits
    {
        id: 'f1',
        name: 'Premium Banana (Sagor Kola)',
        price: 120, // Restored price
        isPriceHidden: true, // Hidden for guests
        weight: '1 Dozen',
        image: '/images/banana.jpg',
        rating: 4.6,
        category: 'fruits',
        inStock: true
    },
    {
        id: 'f2',
        name: 'Malta (Sweet)',
        price: 220,
        weight: '1 kg',
        image: '/images/malta.jpg',
        rating: 4.5,
        category: 'fruits',
        inStock: true
    },
    // Fish & Meat
    {
        id: 'fm1',
        name: 'Rui Fish (Whole)',
        price: 450,
        weight: '1 kg',
        image: '/images/rui.jpg',
        rating: 4.8,
        category: 'fish-meat',
        inStock: true
    },
    {
        id: 'fm2',
        name: 'Broiler Chicken (Skinless)',
        price: 190,
        originalPrice: 210,
        weight: '1 kg',
        image: '/images/chicken.jpg',
        rating: 4.7,
        category: 'fish-meat',
        inStock: true,
        discount: 10
    },
    {
        id: 'fm3',
        name: 'Beef (Bone-in)',
        price: 750, // Restored price
        isPriceHidden: true, // Hidden for guests
        weight: '1 kg',
        image: '/images/beef.jpg',
        rating: 4.9,
        category: 'fish-meat',
        inStock: true
    },
    // Staples
    {
        id: 's1',
        name: 'Miniket Rice (Premium)',
        price: 75, // Restored price
        isPriceHidden: true, // Hidden for guests
        weight: '1 kg',
        image: '/images/rice.jpg',
        rating: 4.8,
        category: 'rice-dal-oil',
        inStock: true
    },
    {
        id: 's2',
        name: 'Soybean Oil (Rupchanda)',
        price: 185,
        weight: '1 Liter',
        image: '/images/oil.jpg',
        rating: 5.0,
        category: 'rice-dal-oil',
        inStock: true
    },
    {
        id: 's3',
        name: 'Mosur Dal (Deshi)',
        price: 140,
        weight: '1 kg',
        image: '/images/dal.jpg',
        rating: 4.6,
        category: 'rice-dal-oil',
        inStock: true
    },
    // Snacks
    {
        id: 'sn1',
        name: 'Bombay Sweets Potato Crackers',
        price: 20,
        weight: '25 gm',
        image: '/images/chips.jpg',
        rating: 4.5,
        category: 'snacks',
        inStock: true
    },
    {
        id: 'sn2',
        name: 'Danish Lexus Biscuits',
        price: 55,
        weight: '1 pack',
        image: '/images/biscuits.jpg',
        rating: 4.7,
        category: 'snacks',
        inStock: true
    },
    // Beverages
    {
        id: 'bev1',
        name: 'Coca-Cola',
        price: 30,
        weight: '250 ml',
        image: '/images/coke.png',
        rating: 4.8,
        category: 'beverages',
        inStock: true
    },
    {
        id: 'bev2',
        name: 'Fresh Orange Juice',
        price: 150,
        weight: '1 Liter',
        image: '/images/juice.jpg',
        rating: 4.6,
        category: 'beverages',
        inStock: true
    },
    // Baby Care
    {
        id: 'bc1',
        name: 'Huggies Wonder Pants',
        price: 1200,
        weight: '50 pcs',
        image: '/images/diapers.jpg',
        rating: 4.9,
        category: 'baby-care',
        inStock: true
    },
    {
        id: 'bc2',
        name: 'Johnson\'s Baby Lotion',
        price: 450,
        weight: '200 ml',
        image: '/images/lotion.jpg',
        rating: 4.8,
        category: 'baby-care',
        inStock: true
    },
    // Cleaning
    {
        id: 'cl1',
        name: 'Wheel Washing Powder',
        price: 120,
        weight: '1 kg',
        image: '/images/detergent.jpg',
        rating: 4.5,
        category: 'cleaning',
        inStock: true
    },
    {
        id: 'cl2',
        name: 'Vim Dishwash Liquid',
        price: 95,
        weight: '500 ml',
        image: '/images/dishwash.jpg',
        rating: 4.7,
        category: 'cleaning',
        inStock: true
    },
    // Home & Kitchen
    {
        id: 'hk1',
        name: 'Non-Stick Fry Pan',
        price: 850,
        weight: '24 cm',
        image: '/images/pan.jpg',
        rating: 4.6,
        category: 'home-kitchen',
        inStock: true
    },
    {
        id: 'hk2',
        name: 'Kitchen Tissue Box',
        price: 65,
        weight: '1 box',
        image: '/images/tissue.jpg',
        rating: 4.4,
        category: 'home-kitchen',
        inStock: true
    }
];

export const DELIVERY_AREAS = [
    'Nasirabad',
    'GEC Circle',
    'Khulshi',
    'Agrabad',
    'Halishahar',
    'Chawkbazar',
    'Panchlaish'
];
