'use client';

import { motion } from 'framer-motion';
import { Category } from '@/types';

interface CategoryTabsProps {
    categories: Category[];
    activeCategory: string;
    onCategoryChange: (categoryId: string) => void;
}

export default function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
    return (
        <div className="sticky top-0 z-20 py-4 bg-gradient-to-b from-gray-950 via-gray-950/95 to-transparent backdrop-blur-xl">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onCategoryChange('all')}
                    className={`flex-shrink-0 px-5 py-2.5 rounded-full font-medium text-sm transition-all ${activeCategory === 'all'
                            ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                        }`}
                >
                    All Items
                </motion.button>

                {categories.map((category) => (
                    <motion.button
                        key={category.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onCategoryChange(category.id)}
                        className={`flex-shrink-0 px-5 py-2.5 rounded-full font-medium text-sm transition-all ${activeCategory === category.id
                                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                            }`}
                    >
                        {category.icon && <span className="mr-1.5">{category.icon}</span>}
                        {category.name}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
