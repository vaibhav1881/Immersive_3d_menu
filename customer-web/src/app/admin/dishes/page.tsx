'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Plus,
    Search,
    Filter,
    UtensilsCrossed,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    Box,
    Leaf,
    Flame,
    Loader2
} from 'lucide-react';
import { AdminLayout } from '@/components/admin';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface Dish {
    _id: string;
    name: string;
    description: string;
    price: number;
    categoryName: string;
    thumbnailUrl?: string;
    modelUrl?: string;
    isVeg: boolean;
    spiceLevel: number;
    isActive: boolean;
    viewCount: number;
    arViewCount: number;
    processingStatus: string;
}

export default function DishesPage() {
    const { user } = useAuth();
    const [dishes, setDishes] = useState<Dish[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [categories, setCategories] = useState<any[]>([]);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    useEffect(() => {
        if (user?.restaurant?._id) {
            fetchDishes();
            fetchCategories();
        }
    }, [user]);

    const fetchDishes = async () => {
        try {
            const response = await api.get(`/dishes?restaurant=${user?.restaurant?._id}`);
            setDishes(response.data.data?.dishes || []);
        } catch (error) {
            console.error('Failed to fetch dishes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get(`/categories?restaurant=${user?.restaurant?._id}`);
            setCategories(response.data.data?.categories || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleDelete = async (dishId: string) => {
        if (!confirm('Are you sure you want to delete this dish?')) return;

        try {
            await api.delete(`/dishes/${dishId}`);
            setDishes(dishes.filter(d => d._id !== dishId));
        } catch (error) {
            console.error('Failed to delete dish:', error);
            alert('Failed to delete dish');
        }
    };

    const filteredDishes = dishes.filter(dish => {
        const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dish.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || dish.categoryName === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const getSpiceColor = (level: number) => {
        if (level === 0) return 'text-gray-500';
        if (level === 1) return 'text-yellow-500';
        if (level === 2) return 'text-orange-500';
        return 'text-red-500';
    };

    const getProcessingBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">3D Ready</span>;
            case 'processing':
                return <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />Processing</span>;
            case 'failed':
                return <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Failed</span>;
            default:
                return <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded-full">No Model</span>;
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Dishes</h1>
                        <p className="text-gray-400">Manage your menu items and 3D models</p>
                    </div>
                    <Link
                        href="/admin/dishes/new"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Dish
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search dishes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-900 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="appearance-none bg-gray-900 border border-white/10 rounded-xl py-3 pl-12 pr-10 text-white focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Dishes Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    </div>
                ) : filteredDishes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredDishes.map((dish, index) => (
                            <motion.div
                                key={dish._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all group"
                            >
                                {/* Image */}
                                <div className="relative h-48 bg-gray-800">
                                    {dish.thumbnailUrl ? (
                                        <img
                                            src={dish.thumbnailUrl.startsWith('http') ? dish.thumbnailUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${dish.thumbnailUrl}`}
                                            alt={dish.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <UtensilsCrossed className="w-12 h-12 text-gray-600" />
                                        </div>
                                    )}

                                    {/* Badges */}
                                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                                        {dish.modelUrl && (
                                            <span className="flex items-center gap-1 text-xs bg-gradient-to-r from-orange-500 to-pink-500 text-white px-2 py-1 rounded-full">
                                                <Box className="w-3 h-3" /> 3D
                                            </span>
                                        )}
                                        {dish.isVeg && (
                                            <span className="flex items-center gap-1 text-xs bg-green-500/90 text-white px-2 py-1 rounded-full">
                                                <Leaf className="w-3 h-3" /> Veg
                                            </span>
                                        )}
                                    </div>

                                    {/* Menu Button */}
                                    <div className="absolute top-3 right-3">
                                        <button
                                            onClick={() => setActiveMenu(activeMenu === dish._id ? null : dish._id)}
                                            className="p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>

                                        {activeMenu === dish._id && (
                                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-white/10 rounded-xl overflow-hidden shadow-xl z-10">
                                                <Link
                                                    href={`/admin/dishes/${dish._id}`}
                                                    className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Edit Dish
                                                </Link>
                                                <Link
                                                    href={`/menu/${user?.restaurant?._id}?dish=${dish._id}`}
                                                    target="_blank"
                                                    className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Preview
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(dish._id)}
                                                    className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="font-semibold text-white group-hover:text-orange-400 transition-colors">
                                                {dish.name}
                                            </h3>
                                            <p className="text-sm text-gray-500">{dish.categoryName}</p>
                                        </div>
                                        <span className="text-lg font-bold text-white">₹{dish.price}</span>
                                    </div>

                                    <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                                        {dish.description || 'No description'}
                                    </p>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-4 h-4" />
                                                {dish.viewCount || 0}
                                            </span>
                                            {dish.spiceLevel > 0 && (
                                                <span className={`flex items-center gap-1 ${getSpiceColor(dish.spiceLevel)}`}>
                                                    <Flame className="w-4 h-4" />
                                                    {dish.spiceLevel}
                                                </span>
                                            )}
                                        </div>
                                        {getProcessingBadge(dish.processingStatus)}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <UtensilsCrossed className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No dishes found</h3>
                        <p className="text-gray-400 mb-6">
                            {searchQuery || filterCategory !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Get started by adding your first dish'}
                        </p>
                        <Link
                            href="/admin/dishes/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Add Your First Dish
                        </Link>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
