'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    UtensilsCrossed,
    FolderOpen,
    QrCode,
    Eye,
    TrendingUp,
    Smartphone,
    Box,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Calendar
} from 'lucide-react';
import { AdminLayout } from '@/components/admin';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';

interface Stats {
    totalDishes: number;
    totalCategories: number;
    totalTables: number;
    totalViews: number;
    totalARViews: number;
    dishes3D: number;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentDishes, setRecentDishes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    const fetchDashboardData = async () => {
        if (!user?.restaurant?._id) return;

        try {
            // Fetch categories
            const categoriesRes = await api.get(`/categories?restaurant=${user.restaurant._id}`);
            const categories = categoriesRes.data.data?.categories || [];

            // Fetch dishes
            const dishesRes = await api.get(`/dishes?restaurant=${user.restaurant._id}`);
            const dishes = dishesRes.data.data?.dishes || [];

            // Fetch tables
            const tablesRes = await api.get(`/tables?restaurant=${user.restaurant._id}`);
            const tables = tablesRes.data.data?.tables || [];

            // Calculate stats
            const totalViews = dishes.reduce((sum: number, d: any) => sum + (d.viewCount || 0), 0);
            const totalARViews = dishes.reduce((sum: number, d: any) => sum + (d.arViewCount || 0), 0);
            const dishes3D = dishes.filter((d: any) => d.modelUrl).length;

            setStats({
                totalDishes: dishes.length,
                totalCategories: categories.length,
                totalTables: tables.length,
                totalViews,
                totalARViews,
                dishes3D,
            });

            // Get recent dishes (last 5)
            setRecentDishes(dishes.slice(0, 5));
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const statCards = [
        {
            label: 'Total Dishes',
            value: stats?.totalDishes || 0,
            icon: UtensilsCrossed,
            color: 'from-orange-500 to-pink-500',
            link: '/admin/dishes'
        },
        {
            label: 'Categories',
            value: stats?.totalCategories || 0,
            icon: FolderOpen,
            color: 'from-blue-500 to-cyan-500',
            link: '/admin/categories'
        },
        {
            label: 'Tables',
            value: stats?.totalTables || 0,
            icon: QrCode,
            color: 'from-purple-500 to-indigo-500',
            link: '/admin/tables'
        },
        {
            label: '3D Models',
            value: stats?.dishes3D || 0,
            icon: Box,
            color: 'from-emerald-500 to-teal-500',
            link: '/admin/dishes'
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            Welcome back, {user?.name?.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-gray-400 mt-1">
                            Here's what's happening with your restaurant today.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 px-4 py-2 rounded-xl">
                        <Calendar className="w-4 h-4" />
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link href={stat.link}>
                                <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group">
                                    <div className="flex items-start justify-between">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                            <stat.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                                        <p className="text-gray-400 mt-1">{stat.label}</p>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gray-900 border border-white/10 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                <Eye className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Total Views</h3>
                                <p className="text-sm text-gray-400">All time menu views</p>
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <span className="text-4xl font-bold text-white">{stats?.totalViews || 0}</span>
                            <div className="flex items-center gap-1 text-green-400 text-sm">
                                <TrendingUp className="w-4 h-4" />
                                <span>+12%</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-gray-900 border border-white/10 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                <Smartphone className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">AR Views</h3>
                                <p className="text-sm text-gray-400">Augmented reality interactions</p>
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <span className="text-4xl font-bold text-white">{stats?.totalARViews || 0}</span>
                            <div className="flex items-center gap-1 text-purple-400 text-sm">
                                <Activity className="w-4 h-4" />
                                <span>Live</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Recent Dishes */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden"
                >
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Recent Dishes</h3>
                        <Link
                            href="/admin/dishes"
                            className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                        >
                            View all →
                        </Link>
                    </div>

                    {recentDishes.length > 0 ? (
                        <div className="divide-y divide-white/10">
                            {recentDishes.map((dish: any) => (
                                <Link
                                    key={dish._id}
                                    href={`/admin/dishes/${dish._id}`}
                                    className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-gray-800 overflow-hidden flex-shrink-0">
                                        {dish.thumbnailUrl ? (
                                            <img
                                                src={dish.thumbnailUrl.startsWith('http') ? dish.thumbnailUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${dish.thumbnailUrl}`}
                                                alt={dish.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <UtensilsCrossed className="w-6 h-6 text-gray-600" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium text-white truncate">{dish.name}</h4>
                                            {dish.modelUrl && (
                                                <span className="text-xs bg-gradient-to-r from-orange-500 to-pink-500 text-white px-2 py-0.5 rounded-full">
                                                    3D
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-400 truncate">{dish.categoryName}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-medium text-white">₹{dish.price}</p>
                                        <p className="text-xs text-gray-500">{dish.viewCount || 0} views</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <UtensilsCrossed className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">No dishes yet</p>
                            <Link
                                href="/admin/dishes/new"
                                className="inline-flex items-center gap-2 mt-4 text-orange-400 hover:text-orange-300 transition-colors"
                            >
                                Add your first dish →
                            </Link>
                        </div>
                    )}
                </motion.div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/admin/dishes/new">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/20 rounded-2xl p-6 hover:border-orange-500/40 transition-all cursor-pointer group"
                        >
                            <UtensilsCrossed className="w-8 h-8 text-orange-400 mb-3" />
                            <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors">
                                Add New Dish
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">
                                Upload images and create 3D models
                            </p>
                        </motion.div>
                    </Link>

                    <Link href="/admin/categories">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/40 transition-all cursor-pointer group"
                        >
                            <FolderOpen className="w-8 h-8 text-blue-400 mb-3" />
                            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                                Manage Categories
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">
                                Organize your menu structure
                            </p>
                        </motion.div>
                    </Link>

                    <Link href="/admin/tables">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                            className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all cursor-pointer group"
                        >
                            <QrCode className="w-8 h-8 text-purple-400 mb-3" />
                            <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                                Generate QR Codes
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">
                                Create codes for each table
                            </p>
                        </motion.div>
                    </Link>
                </div>
            </div>
        </AdminLayout>
    );
}
