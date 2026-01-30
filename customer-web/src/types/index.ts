export interface Restaurant {
    id: string;
    name: string;
    description?: string;
    logo?: string;
    coverImage?: string;
    settings: {
        primaryColor: string;
        secondaryColor: string;
        theme: 'light' | 'dark';
        showAR: boolean;
        showVR: boolean;
        show360: boolean;
    };
}

export interface Dish {
    id: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    modelUrl?: string;
    thumbnailUrl?: string;
    isVeg: boolean;
    isVegan: boolean;
    spiceLevel: number;
    isFeatured: boolean;
    isPopular: boolean;
    processingStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'no_model';
}

export interface Category {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    image?: string;
}

export interface MenuCategory {
    category: Category;
    dishes: Dish[];
}

export interface MenuData {
    restaurant: Restaurant;
    menu: MenuCategory[];
}

export type ViewMode = '360' | 'ar' | 'vr';
