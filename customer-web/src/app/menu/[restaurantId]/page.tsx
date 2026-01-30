'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Leaf, Filter } from 'lucide-react';
import { RestaurantHeader, CategoryTabs, DishCard, ModelViewer } from '@/components';
import { getRestaurantMenu } from '@/lib/api';
import { MenuData, Dish, Category } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function MenuPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const restaurantId = params.restaurantId as string;
    const tableId = searchParams.get('table');

    const [menuData, setMenuData] = useState<MenuData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
    const [filterVeg, setFilterVeg] = useState(false);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                setLoading(true);
                const response = await getRestaurantMenu(restaurantId);
                if (response.success) {
                    setMenuData(response.data);
                } else {
                    setError('Failed to load menu');
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load menu');
            } finally {
                setLoading(false);
            }
        };

        if (restaurantId) {
            fetchMenu();
        }
    }, [restaurantId]);

    // Get all categories
    const categories: Category[] = useMemo(() => {
        if (!menuData) return [];
        return menuData.menu.map(item => item.category);
    }, [menuData]);

    // Get filtered dishes
    const filteredDishes: Dish[] = useMemo(() => {
        if (!menuData) return [];

        let dishes: Dish[] = [];

        // Get dishes based on active category
        if (activeCategory === 'all') {
            dishes = menuData.menu.flatMap(item => item.dishes);
        } else {
            const categoryData = menuData.menu.find(item => item.category.id === activeCategory);
            dishes = categoryData?.dishes || [];
        }

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            dishes = dishes.filter(dish =>
                dish.name.toLowerCase().includes(query) ||
                dish.description?.toLowerCase().includes(query)
            );
        }

        // Apply veg filter
        if (filterVeg) {
            dishes = dishes.filter(dish => dish.isVeg);
        }

        return dishes;
    }, [menuData, activeCategory, searchQuery, filterVeg]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading menu...</p>
                </div>
            </div>
        );
    }

    if (error || !menuData) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center px-4">
                    <div className="text-6xl mb-4">🍽️</div>
                    <h1 className="text-2xl font-bold text-white mb-2">Menu Not Found</h1>
                    <p className="text-gray-400">{error || 'This restaurant menu is not available'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950">
            {/* Restaurant Header */}
            <RestaurantHeader restaurant={menuData.restaurant} apiUrl={API_URL} />

            {/* Main Content */}
            <main className="px-4 pb-24">
                {/* Search & Filter */}
                <div className="sticky top-0 z-30 pt-4 pb-2 bg-gray-950/95 backdrop-blur-xl">
                    <div className="flex gap-2">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search dishes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
                            />
                        </div>

                        {/* Veg Filter */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilterVeg(!filterVeg)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-medium transition-all ${filterVeg
                                    ? 'bg-green-500 text-white'
                                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                                }`}
                        >
                            <Leaf className="w-5 h-5" />
                            <span className="hidden sm:inline">Veg</span>
                        </motion.button>
                    </div>
                </div>

                {/* Category Tabs */}
                <CategoryTabs
                    categories={categories}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                />

                {/* Dishes Grid */}
                <div className="mt-4">
                    {filteredDishes.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredDishes.map((dish, index) => (
                                <DishCard
                                    key={dish.id}
                                    dish={dish}
                                    onClick={() => setSelectedDish(dish)}
                                    apiUrl={API_URL}
                                    index={index}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-5xl mb-4">🔍</div>
                            <h3 className="text-xl font-semibold text-white mb-2">No dishes found</h3>
                            <p className="text-gray-400">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            </main>

            {/* 3D Model Viewer Modal */}
            {selectedDish && (
                <ModelViewer
                    dish={selectedDish}
                    isOpen={!!selectedDish}
                    onClose={() => setSelectedDish(null)}
                    apiUrl={API_URL}
                />
            )}

            {/* Table Info Footer */}
            {tableId && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-950/95 backdrop-blur-xl border-t border-white/10">
                    <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                        <span>Table #{tableId.split('-').pop()}</span>
                        <span className="text-gray-600">•</span>
                        <span>Tap any dish for 3D view</span>
                    </div>
                </div>
            )}
        </div>
    );
}
