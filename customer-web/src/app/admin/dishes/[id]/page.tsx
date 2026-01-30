'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Upload,
    X,
    Image as ImageIcon,
    Box,
    Save,
    Loader2,
    Info,
    Flame,
    Leaf,
    Star,
    Clock,
    DollarSign,
    FileText,
    Trash2,
    Eye
} from 'lucide-react';
import { AdminLayout } from '@/components/admin';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';

interface FormData {
    name: string;
    description: string;
    price: string;
    category: string;
    isVeg: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    spiceLevel: number;
    preparationTime: string;
    servingSize: string;
    isFeatured: boolean;
    isPopular: boolean;
    isActive: boolean;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditDishPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAuth();
    const [formData, setFormData] = useState<FormData>({
        name: '',
        description: '',
        price: '',
        category: '',
        isVeg: false,
        isVegan: false,
        isGlutenFree: false,
        spiceLevel: 0,
        preparationTime: '',
        servingSize: '',
        isFeatured: false,
        isPopular: false,
        isActive: true,
    });
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
    const [existingModel, setExistingModel] = useState<string | null>(null);
    const [newModelFile, setNewModelFile] = useState<File | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user?.restaurant?._id) {
            fetchCategories();
            fetchDish();
        }
    }, [user, id]);

    const fetchCategories = async () => {
        try {
            const response = await api.get(`/categories?restaurant=${user?.restaurant?._id}`);
            setCategories(response.data.data?.categories || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchDish = async () => {
        try {
            const response = await api.get(`/dishes/${id}`);
            const dish = response.data.data.dish;

            setFormData({
                name: dish.name,
                description: dish.description || '',
                price: dish.price.toString(),
                category: dish.category,
                isVeg: dish.isVeg,
                isVegan: dish.isVegan || false,
                isGlutenFree: dish.isGlutenFree || false,
                spiceLevel: dish.spiceLevel || 0,
                preparationTime: dish.preparationTime?.toString() || '',
                servingSize: dish.servingSize || '',
                isFeatured: dish.isFeatured || false,
                isPopular: dish.isPopular || false,
                isActive: dish.isActive !== false,
            });

            if (dish.images && dish.images.length > 0) {
                setExistingImages(dish.images.map((img: any) => img.url || img));
            } else if (dish.thumbnailUrl) {
                setExistingImages([dish.thumbnailUrl]);
            }

            if (dish.modelUrl) {
                setExistingModel(dish.modelUrl);
            }
        } catch (error) {
            console.error('Failed to fetch dish:', error);
            setError('Failed to load dish');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        setNewImages(prev => [...prev, ...files]);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewImagePreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeNewImage = (index: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewModelFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.price || !formData.category) {
            setError('Please fill in all required fields');
            return;
        }

        setIsSaving(true);

        try {
            // Update dish data
            const selectedCategory = categories.find(c => c._id === formData.category);
            const dishData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                categoryName: selectedCategory?.name || '',
                isVeg: formData.isVeg,
                isVegan: formData.isVegan,
                isGlutenFree: formData.isGlutenFree,
                spiceLevel: formData.spiceLevel,
                preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : undefined,
                servingSize: formData.servingSize,
                isFeatured: formData.isFeatured,
                isPopular: formData.isPopular,
                isActive: formData.isActive,
            };

            await api.put(`/dishes/${id}`, dishData);

            // Upload new images if any
            if (newImages.length > 0) {
                const imageFormData = new FormData();
                newImages.forEach(img => {
                    imageFormData.append('images', img);
                });

                await api.post(`/dishes/${id}/images`, imageFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            // Upload new 3D model if any
            if (newModelFile) {
                const modelFormData = new FormData();
                modelFormData.append('model', newModelFile);

                await api.post(`/dishes/${id}/model`, modelFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            router.push('/admin/dishes');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update dish');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this dish? This action cannot be undone.')) {
            return;
        }

        try {
            await api.delete(`/dishes/${id}`);
            router.push('/admin/dishes');
        } catch (error) {
            console.error('Failed to delete dish:', error);
            alert('Failed to delete dish');
        }
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/dishes"
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Edit Dish</h1>
                            <p className="text-gray-400">Update dish details and media</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href={`/menu/${user?.restaurant?._id}?dish=${id}`}
                            target="_blank"
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                        >
                            <Eye className="w-4 h-4" />
                            Preview
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6"
                    >
                        <p className="text-red-400">{error}</p>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-orange-400" />
                            Basic Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Dish Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    <DollarSign className="w-4 h-4 inline mr-1" />
                                    Price (₹) *
                                </label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Category *
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                >
                                    <option value="">Select category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    Prep Time (mins)
                                </label>
                                <input
                                    type="number"
                                    value={formData.preparationTime}
                                    onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                                    min="0"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Serving Size
                                </label>
                                <input
                                    type="text"
                                    value={formData.servingSize}
                                    onChange={(e) => setFormData({ ...formData, servingSize: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dietary Info */}
                    <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Leaf className="w-5 h-5 text-green-400" />
                            Dietary Information
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <label className="flex items-center gap-3 p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.isVeg}
                                    onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                                    className="w-5 h-5 rounded bg-white/10 border-0 text-green-500 focus:ring-green-500"
                                />
                                <span className="text-white">Vegetarian</span>
                            </label>

                            <label className="flex items-center gap-3 p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.isVegan}
                                    onChange={(e) => setFormData({ ...formData, isVegan: e.target.checked })}
                                    className="w-5 h-5 rounded bg-white/10 border-0 text-green-500 focus:ring-green-500"
                                />
                                <span className="text-white">Vegan</span>
                            </label>

                            <label className="flex items-center gap-3 p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.isGlutenFree}
                                    onChange={(e) => setFormData({ ...formData, isGlutenFree: e.target.checked })}
                                    className="w-5 h-5 rounded bg-white/10 border-0 text-green-500 focus:ring-green-500"
                                />
                                <span className="text-white">Gluten-Free</span>
                            </label>

                            <label className="flex items-center gap-3 p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.isFeatured}
                                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                    className="w-5 h-5 rounded bg-white/10 border-0 text-orange-500 focus:ring-orange-500"
                                />
                                <span className="text-white flex items-center gap-1">
                                    <Star className="w-4 h-4" /> Featured
                                </span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                <Flame className="w-4 h-4 inline mr-1" />
                                Spice Level
                            </label>
                            <div className="flex gap-3">
                                {[0, 1, 2, 3].map(level => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, spiceLevel: level })}
                                        className={`flex-1 py-3 px-4 rounded-xl border transition-all ${formData.spiceLevel === level
                                                ? level === 0
                                                    ? 'bg-gray-500/20 border-gray-500 text-gray-300'
                                                    : level === 1
                                                        ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                                                        : level === 2
                                                            ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                                                            : 'bg-red-500/20 border-red-500 text-red-400'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        {level === 0 ? 'None' : level === 1 ? 'Mild' : level === 2 ? 'Medium' : 'Hot'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Existing Media */}
                    {(existingImages.length > 0 || existingModel) && (
                        <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Current Media</h2>

                            {existingImages.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-sm text-gray-400 mb-2">Images ({existingImages.length})</p>
                                    <div className="flex flex-wrap gap-2">
                                        {existingImages.slice(0, 8).map((img, index) => (
                                            <div key={index} className="w-20 h-20 rounded-lg overflow-hidden bg-gray-800">
                                                <img
                                                    src={img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${img}`}
                                                    alt={`Image ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                        {existingImages.length > 8 && (
                                            <div className="w-20 h-20 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400">
                                                +{existingImages.length - 8}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {existingModel && (
                                <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-xl">
                                    <Box className="w-5 h-5 text-purple-400" />
                                    <span className="text-white">3D Model uploaded</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Add More Images */}
                    <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-blue-400" />
                            Add More Images
                        </h2>
                        <p className="text-sm text-gray-400 mb-4">Add additional images to improve 3D model quality</p>

                        <label className="block">
                            <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-orange-500/50 transition-colors cursor-pointer">
                                <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                                <p className="text-white">Click to upload images</p>
                            </div>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </label>

                        {newImagePreviews.length > 0 && (
                            <div className="grid grid-cols-6 gap-2 mt-4">
                                {newImagePreviews.map((preview, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                                        <img src={preview} alt={`New ${index + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(index)}
                                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                        >
                                            <X className="w-5 h-5 text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Upload New 3D Model */}
                    <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                            <Box className="w-5 h-5 text-purple-400" />
                            {existingModel ? 'Replace' : 'Upload'} 3D Model
                        </h2>

                        <label className="block">
                            <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${newModelFile
                                    ? 'border-purple-500/50 bg-purple-500/10'
                                    : 'border-white/20 hover:border-purple-500/50'
                                }`}>
                                {newModelFile ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <Box className="w-6 h-6 text-purple-400" />
                                        <span className="text-white">{newModelFile.name}</span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setNewModelFile(null);
                                            }}
                                            className="p-1 bg-white/10 rounded-lg hover:bg-red-500/20"
                                        >
                                            <X className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Box className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                                        <p className="text-white">Click to upload 3D model</p>
                                        <p className="text-sm text-gray-500">GLB, GLTF up to 50MB</p>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                accept=".glb,.gltf"
                                onChange={handleModelUpload}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {/* Status */}
                    <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <h3 className="text-lg font-semibold text-white">Dish Status</h3>
                                <p className="text-sm text-gray-400">Active dishes are visible to customers</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="w-6 h-6 rounded bg-white/10 border-0 text-green-500 focus:ring-green-500"
                            />
                        </label>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <Link
                            href="/admin/dishes"
                            className="flex-1 py-4 text-center text-gray-400 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
