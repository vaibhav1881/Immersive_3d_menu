'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LogOut, QrCode, Utensils, MapPin, Phone, Mail,
    Globe, Star, Clock, User, Menu as MenuIcon
} from 'lucide-react';
import api from '@/lib/api';

interface Restaurant {
    _id: string;
    name: string;
    description: string;
    cuisine: string[];
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
    };
    contact: {
        phone: string;
        email: string;
        website?: string;
    };
}

export default function CustomerDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [showQRScanner, setShowQRScanner] = useState(false);

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem('customerToken');
        const userData = localStorage.getItem('customerUser');

        if (!token || !userData) {
            router.push('/customer/login');
            return;
        }

        setUser(JSON.parse(userData));
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const response = await api.get('/restaurants');
            if (response.data.success) {
                setRestaurants(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch restaurants:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerUser');
        router.push('/customer/login');
    };

    const handleViewMenu = (restaurantId: string) => {
        router.push(`/menu/${restaurantId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                <Utensils className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Immersive Menu</h1>
                                <p className="text-sm text-purple-300">Welcome, {user?.name}!</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowQRScanner(true)}
                                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2"
                            >
                                <QrCode className="w-5 h-5" />
                                <span className="hidden sm:inline">Scan QR</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-purple-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h2 className="text-3xl font-bold text-white mb-2">Discover Restaurants</h2>
                    <p className="text-purple-300">Explore immersive 3D menus with AR & VR experiences</p>
                </motion.div>

                {/* Restaurants Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {restaurants.map((restaurant, index) => (
                        <motion.div
                            key={restaurant._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 hover:border-purple-500/50 transition-all group"
                        >
                            {/* Restaurant Header */}
                            <div className="h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 group-hover:scale-110 transition-transform duration-500" />
                                <Utensils className="w-16 h-16 text-white/50 relative z-10" />
                            </div>

                            {/* Restaurant Info */}
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-white mb-2">{restaurant.name}</h3>
                                <p className="text-purple-200 text-sm mb-4 line-clamp-2">{restaurant.description}</p>

                                {/* Cuisine Tags */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {restaurant.cuisine.map((c, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30"
                                        >
                                            {c}
                                        </span>
                                    ))}
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-2 mb-4 text-sm">
                                    <div className="flex items-center gap-2 text-purple-300">
                                        <MapPin className="w-4 h-4" />
                                        <span className="line-clamp-1">
                                            {restaurant.address.city}, {restaurant.address.state}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-purple-300">
                                        <Phone className="w-4 h-4" />
                                        <span>{restaurant.contact.phone}</span>
                                    </div>
                                </div>

                                {/* View Menu Button */}
                                <button
                                    onClick={() => handleViewMenu(restaurant._id)}
                                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <MenuIcon className="w-5 h-5" />
                                    View Menu
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Empty State */}
                {restaurants.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <Utensils className="w-16 h-16 text-purple-500/50 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Restaurants Yet</h3>
                        <p className="text-purple-300">Check back soon for new restaurants!</p>
                    </motion.div>
                )}
            </main>

            {/* QR Scanner Modal */}
            {showQRScanner && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowQRScanner(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full border border-white/20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center">
                            <QrCode className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-white mb-2">QR Scanner</h3>
                            <p className="text-purple-300 mb-6">
                                QR scanner functionality will be implemented here. Point your camera at a restaurant's QR code to view their menu instantly.
                            </p>
                            <button
                                onClick={() => setShowQRScanner(false)}
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
