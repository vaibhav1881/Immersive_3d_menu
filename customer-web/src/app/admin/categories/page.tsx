'use client';

import { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import {
    Plus,
    GripVertical,
    Edit2,
    Trash2,
    X,
    Save,
    FolderOpen,
    Loader2,
    Check
} from 'lucide-react';
import { AdminLayout } from '@/components/admin';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface Category {
    _id: string;
    name: string;
    description: string;
    icon: string;
    displayOrder: number;
    dishCount?: number;
}

const EMOJI_OPTIONS = ['🍽️', '🥗', '🍛', '🍚', '🫓', '🍮', '🥤', '🍜', '🍲', '🥘', '🍱', '🍣', '🍕', '🍔', '🌮', '🥪', '🍰', '☕'];

export default function CategoriesPage() {
    const { user } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showNewForm, setShowNewForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', icon: '🍽️' });
    const [isSaving, setIsSaving] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    useEffect(() => {
        if (user?.restaurant?._id) {
            fetchCategories();
        }
    }, [user]);

    const fetchCategories = async () => {
        try {
            const response = await api.get(`/categories?restaurant=${user?.restaurant?._id}`);
            setCategories(response.data.data?.categories || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;

        setIsSaving(true);
        try {
            const response = await api.post('/categories', {
                ...formData,
                restaurant: user?.restaurant?._id,
                displayOrder: categories.length,
            });
            setCategories([...categories, response.data.data.category]);
            setFormData({ name: '', description: '', icon: '🍽️' });
            setShowNewForm(false);
        } catch (error) {
            console.error('Failed to create category:', error);
            alert('Failed to create category');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdate = async (id: string) => {
        setIsSaving(true);
        try {
            await api.put(`/categories/${id}`, formData);
            setCategories(categories.map(c =>
                c._id === id ? { ...c, ...formData } : c
            ));
            setEditingId(null);
            setFormData({ name: '', description: '', icon: '🍽️' });
        } catch (error) {
            console.error('Failed to update category:', error);
            alert('Failed to update category');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            await api.delete(`/categories/${id}`);
            setCategories(categories.filter(c => c._id !== id));
        } catch (error) {
            console.error('Failed to delete category:', error);
            alert('Failed to delete category');
        }
    };

    const startEditing = (category: Category) => {
        setEditingId(category._id);
        setFormData({
            name: category.name,
            description: category.description || '',
            icon: category.icon || '🍽️',
        });
        setShowNewForm(false);
    };

    const handleReorder = async (newOrder: Category[]) => {
        setCategories(newOrder);

        // Update order on backend
        try {
            await api.put('/categories/reorder', {
                categories: newOrder.map((c, i) => ({ id: c._id, displayOrder: i })),
                restaurant: user?.restaurant?._id,
            });
        } catch (error) {
            console.error('Failed to reorder categories:', error);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Categories</h1>
                        <p className="text-gray-400">Organize your menu items</p>
                    </div>
                    <button
                        onClick={() => {
                            setShowNewForm(true);
                            setEditingId(null);
                            setFormData({ name: '', description: '', icon: '🍽️' });
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add Category
                    </button>
                </div>

                {/* New Category Form */}
                {showNewForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-900 border border-white/10 rounded-2xl p-6 mb-6"
                    >
                        <h3 className="text-lg font-semibold text-white mb-4">New Category</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="flex gap-4">
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="w-14 h-14 rounded-xl bg-white/10 text-3xl hover:bg-white/20 transition-colors flex items-center justify-center"
                                    >
                                        {formData.icon}
                                    </button>
                                    {showEmojiPicker && (
                                        <div className="absolute top-full left-0 mt-2 p-2 bg-gray-800 border border-white/10 rounded-xl shadow-xl z-10 grid grid-cols-6 gap-1">
                                            {EMOJI_OPTIONS.map(emoji => (
                                                <button
                                                    key={emoji}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData({ ...formData, icon: emoji });
                                                        setShowEmojiPicker(false);
                                                    }}
                                                    className="w-10 h-10 text-xl hover:bg-white/10 rounded-lg transition-colors"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Category name"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                                    />
                                </div>
                            </div>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Description (optional)"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                            />
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowNewForm(false)}
                                    className="flex-1 py-3 text-gray-400 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                    Create
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* Categories List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    </div>
                ) : categories.length > 0 ? (
                    <Reorder.Group
                        axis="y"
                        values={categories}
                        onReorder={handleReorder}
                        className="space-y-3"
                    >
                        {categories.map((category) => (
                            <Reorder.Item
                                key={category._id}
                                value={category}
                                className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden"
                            >
                                {editingId === category._id ? (
                                    <div className="p-4">
                                        <div className="flex gap-4 mb-4">
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                    className="w-12 h-12 rounded-xl bg-white/10 text-2xl hover:bg-white/20 transition-colors flex items-center justify-center"
                                                >
                                                    {formData.icon}
                                                </button>
                                                {showEmojiPicker && (
                                                    <div className="absolute top-full left-0 mt-2 p-2 bg-gray-800 border border-white/10 rounded-xl shadow-xl z-10 grid grid-cols-6 gap-1">
                                                        {EMOJI_OPTIONS.map(emoji => (
                                                            <button
                                                                key={emoji}
                                                                type="button"
                                                                onClick={() => {
                                                                    setFormData({ ...formData, icon: emoji });
                                                                    setShowEmojiPicker(false);
                                                                }}
                                                                className="w-10 h-10 text-xl hover:bg-white/10 rounded-lg transition-colors"
                                                            >
                                                                {emoji}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Description"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors mb-4"
                                        />
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="flex-1 py-2 text-gray-400 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleUpdate(category._id)}
                                                disabled={isSaving}
                                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium rounded-xl transition-all disabled:opacity-50"
                                            >
                                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4 p-4">
                                        <div className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300">
                                            <GripVertical className="w-5 h-5" />
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                                            {category.icon || '🍽️'}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-white">{category.name}</h3>
                                            {category.description && (
                                                <p className="text-sm text-gray-400">{category.description}</p>
                                            )}
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {category.dishCount || 0} dishes
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => startEditing(category)}
                                                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category._id)}
                                                className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                ) : (
                    <div className="text-center py-20">
                        <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No categories yet</h3>
                        <p className="text-gray-400 mb-6">Create your first category to organize your menu</p>
                        <button
                            onClick={() => setShowNewForm(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Create First Category
                        </button>
                    </div>
                )}

                {/* Tip */}
                {categories.length > 0 && (
                    <p className="text-center text-sm text-gray-500 mt-6">
                        💡 Drag and drop to reorder categories
                    </p>
                )}
            </div>
        </AdminLayout>
    );
}
