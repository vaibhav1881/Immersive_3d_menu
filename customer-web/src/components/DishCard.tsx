'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Flame, Eye, Star, Sparkles } from 'lucide-react';
import { Dish } from '@/types';
import { formatPrice } from '@/lib/utils';

interface DishCardProps {
    dish: Dish;
    onClick: () => void;
    apiUrl: string;
    index: number;
}

export default function DishCard({ dish, onClick, apiUrl, index }: DishCardProps) {
    const [imageError, setImageError] = useState(false);

    // Remove /api from the base URL for static file serving
    const baseUrl = apiUrl.replace('/api', '');

    const thumbnailUrl = dish.thumbnailUrl?.startsWith('http')
        ? dish.thumbnailUrl
        : dish.thumbnailUrl
            ? `${baseUrl}${dish.thumbnailUrl}`
            : null;

    const has3DModel = dish.modelUrl && dish.processingStatus === 'completed';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="relative group cursor-pointer"
        >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-white/10 shadow-lg hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden">
                    {thumbnailUrl && !imageError ? (
                        <img
                            src={thumbnailUrl}
                            alt={dish.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center">
                            <div className="text-6xl">🍽️</div>
                        </div>
                    )}

                    {/* 3D Badge */}
                    {has3DModel && (
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold shadow-lg">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>3D</span>
                        </div>
                    )}

                    {/* Veg/Non-Veg Indicator */}
                    <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center ${dish.isVeg
                        ? 'bg-green-500 border-green-400'
                        : 'bg-red-500 border-red-400'
                        }`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${dish.isVeg ? 'bg-green-300' : 'bg-red-300'}`} />
                    </div>

                    {/* Featured Badge */}
                    {dish.isFeatured && (
                        <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/90 text-black text-xs font-semibold">
                            <Star className="w-3 h-3 fill-current" />
                            Featured
                        </div>
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* View 3D Prompt */}
                    {has3DModel && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileHover={{ opacity: 1, y: 0 }}
                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 text-gray-900 font-semibold shadow-xl">
                                <Eye className="w-5 h-5" />
                                View in 3D
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-white text-lg leading-tight line-clamp-2 group-hover:text-orange-400 transition-colors">
                            {dish.name}
                        </h3>
                        <span className="flex-shrink-0 font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">
                            {formatPrice(dish.price, dish.currency)}
                        </span>
                    </div>

                    {dish.description && (
                        <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                            {dish.description}
                        </p>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                        {dish.isVegan && (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                                <Leaf className="w-3 h-3" />
                                Vegan
                            </span>
                        )}
                        {dish.spiceLevel > 0 && (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">
                                <Flame className="w-3 h-3" />
                                {Array(dish.spiceLevel).fill('🌶️').join('')}
                            </span>
                        )}
                        {dish.isPopular && (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs">
                                🔥 Popular
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
