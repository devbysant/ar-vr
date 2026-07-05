export interface ProductData {
    slug: string;
    fileName: string;       // actual .glb filename in /public
    name: string;
    subheading: string;
    description: string;
    price: string;
    originalPrice: string;
    discount: string;
    rating: number;
    reviewCount: number;
    category: string;
    specs: { key: string; value: string }[];
}

export const PRODUCTS: ProductData[] = [
    {
        slug: 'chair',
        fileName: 'Chair',
        name: 'Chair',
        subheading: 'Modern Accent Chair · Solid Wood Frame · Fabric Upholstery',
        description:
            'A versatile accent chair crafted with a solid wood frame and premium fabric upholstery. Designed for both comfort and style, it fits seamlessly into living rooms, reading nooks, or home offices. Lightweight enough to move around, sturdy enough to last for years.',
        price: '$129.99',
        originalPrice: '$199.99',
        discount: '35% OFF',
        rating: 4.7,
        reviewCount: 214,
        category: 'Seating',
        specs: [
            { key: 'Material', value: 'Solid Wood + Fabric' },
            { key: 'Weight Capacity', value: '120 kg' },
            { key: 'Dimensions', value: '60 × 65 × 85 cm' },
            { key: 'Assembly', value: 'Required' },
            { key: 'AR Ready', value: 'Yes' },
        ],
    },
    {
        slug: 'couch-small',
        fileName: 'Couch small',
        name: 'Couch small',
        subheading: '1-Seat Sofa · Premium Foam Cushions · Linen Blend',
        description:
            'A generously proportioned 1-seat sofa featuring high-density foam cushions and a durable linen-blend cover. The clean-lined silhouette adapts to contemporary and transitional interiors alike. Removable cushion covers make cleaning effortless.',
        price: '$549.99',
        originalPrice: '$849.99',
        discount: '35% OFF',
        rating: 4.8,
        reviewCount: 392,
        category: 'Sofas & Couches',
        specs: [
            { key: 'Material', value: 'Linen Blend + Foam' },
            { key: 'Seating Capacity', value: '3 persons' },
            { key: 'Dimensions', value: '210 × 90 × 80 cm' },
            { key: 'Leg Material', value: 'Solid Beech Wood' },
            { key: 'AR Ready', value: 'Yes' },
        ],
    },
    {
        slug: 'drawer',
        fileName: 'Drawer',
        name: 'Drawer Unit',
        subheading: '4-Drawer Chest · Engineered Wood · Smooth-Glide Runners',
        description:
            'A compact 4-drawer chest built with engineered wood and finished in a neutral tone that complements any room. Metal-reinforced smooth-glide runners ensure each drawer opens and closes with ease. Perfect for bedrooms, hallways, or nurseries.',
        price: '$219.99',
        originalPrice: '$319.99',
        discount: '31% OFF',
        rating: 4.6,
        reviewCount: 178,
        category: 'Storage',
        specs: [
            { key: 'Material', value: 'Engineered Wood' },
            { key: 'No. of Drawers', value: '4' },
            { key: 'Dimensions', value: '50 × 40 × 100 cm' },
            { key: 'Runner Type', value: 'Metal Smooth-Glide' },
            { key: 'AR Ready', value: 'Yes' },
        ],
    },
    {
        slug: 'table-round-small',
        fileName: 'Table Round Small',
        name: 'Table Round Small',
        subheading: 'Round Side Table · Solid Oak · Minimalist Design',
        description:
            'A small round side table turned from solid oak with a warm natural finish. Its compact footprint makes it ideal as a bedside table, plant stand, or accent piece in tight corners. The single-leg pedestal base adds an elegant, airy feel.',
        price: '$89.99',
        originalPrice: '$139.99',
        discount: '36% OFF',
        rating: 4.7,
        reviewCount: 143,
        category: 'Tables',
        specs: [
            { key: 'Material', value: 'Solid Oak' },
            { key: 'Diameter', value: '45 cm' },
            { key: 'Height', value: '55 cm' },
            { key: 'Finish', value: 'Natural Oil' },
            { key: 'AR Ready', value: 'Yes' },
        ],
    },
];

// Slug set for fast lookup
export const AVAILABLE_MODELS = new Set(PRODUCTS.map(p => p.slug));

export const isValidModel = (fileId: string) => AVAILABLE_MODELS.has(fileId);

export const getProduct = (slug: string): ProductData | undefined =>
    PRODUCTS.find(p => p.slug === slug);

/** Returns the encoded URL path for a GLB file, e.g. "/Couch%20Medium.glb" */
export const glbPath = (p: ProductData) =>
    `/${encodeURIComponent(p.fileName)}.glb`;
