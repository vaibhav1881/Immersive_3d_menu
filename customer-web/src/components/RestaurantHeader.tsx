'use client';

import { motion } from 'framer-motion';
import { Restaurant } from '@/types';
import { MapPin, Clock, Phone, Globe } from 'lucide-react';

interface RestaurantHeaderProps {
    restaurant: Restaurant;
    apiUrl: string;
}

export default function RestaurantHeader({ restaurant, apiUrl }: RestaurantHeaderProps) {
    const logoUrl = restaurant.logo?.startsWith('http')
        ? restaurant.logo
        : restaurant.logo
            ? `${apiUrl}${restaurant.logo}`
            : null;

    const coverUrl = restaurant.coverImage?.startsWith('http')
        ? restaurant.coverImage
        : restaurant.coverImage
            ? `${apiUrl}${restaurant.coverImage}`
            : null;

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
        >
            {/* Cover Image */}
            <div className="relative h-48 sm:h-64 overflow-hidden rounded-b-3xl">
                {coverUrl ? (
                    <img
                        src={coverUrl}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-600 via-pink-600 to-purple-700" />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
            </div>

            {/* Restaurant Info */}
            <div className="relative -mt-16 px-4">
                <div className="flex items-end gap-4">
                    {/* Logo */}
                    <div className="relative">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 p-1 shadow-xl shadow-orange-500/20">
                            <div className="w-full h-full rounded-xl overflow-hidden bg-gray-900">
                                {logoUrl ? (
                                    <img
                                        src={logoUrl}
                                        alt={restaurant.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl">
                                        🍽️
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Name & Description */}
                    <div className="flex-1 pb-2">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                            {restaurant.name}
                        </h1>
                        {restaurant.description && (
                            <p className="text-gray-400 text-sm line-clamp-2">
                                {restaurant.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Quick Actions / Info Pills */}
                <div className="flex flex-wrap gap-2 mt-4">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Open Now
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/20 text-orange-400 text-sm">
                        ✨ AR Menu Available
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
