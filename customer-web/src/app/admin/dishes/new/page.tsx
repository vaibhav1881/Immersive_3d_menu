'use client';

import { useState, useEffect, useCallback } from 'react';
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
    FileText
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
}

export default function NewDishPage() {
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
    });
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [modelFile, setModelFile] = useState<File | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);

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
        }
    };

    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + images.length > 60) {
            setError('Maximum 60 images allowed');
            return;
        }

        setImages(prev => [...prev, ...files]);

        // Create previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    }, [images]);

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setModelFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.price || !formData.category) {
            setError('Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        setUploadProgress(0);

        try {
            // Step 1: Create the dish
            const selectedCategory = categories.find(c => c._id === formData.category);
            const dishData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                categoryName: selectedCategory?.name || '',
                restaurant: user?.restaurant?._id,
                isVeg: formData.isVeg,
                isVegan: formData.isVegan,
                isGlutenFree: formData.isGlutenFree,
                spiceLevel: formData.spiceLevel,
                preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : undefined,
                servingSize: formData.servingSize,
                isFeatured: formData.isFeatured,
                isPopular: formData.isPopular,
            };

            const createResponse = await api.post('/dishes', dishData);
            const dishId = createResponse.data.data.dish._id;
            setUploadProgress(20);

            // Step 2: Upload images if any
            if (images.length > 0) {
                const imageFormData = new FormData();
                images.forEach(img => {
                    imageFormData.append('images', img);
                });

                await api.post(`/dishes/${dishId}/images`, imageFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        const progress = progressEvent.total
                            ? Math.round((progressEvent.loaded * 60) / progressEvent.total) + 20
                            : 20;
                        setUploadProgress(progress);
                    },
                });
            }
            setUploadProgress(80);

            // Step 3: Upload 3D model if any
            if (modelFile) {
                const modelFormData = new FormData();
                modelFormData.append('model', modelFile);

                await api.post(`/dishes/${dishId}/model`, modelFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            setUploadProgress(100);

            // Redirect to dishes list
            router.push('/admin/dishes');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create dish');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/admin/dishes"
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Add New Dish</h1>
                        <p className="text-gray-400">Create a new menu item with 3D model</p>
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
                                    placeholder="e.g., Butter Chicken"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe your dish..."
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
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
                                    placeholder="299"
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
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
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
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
                                    placeholder="20"
                                    min="0"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
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
                                    placeholder="Serves 2"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
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

                    {/* Image Upload */}
                    <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-blue-400" />
                            Dish Images
                        </h2>
                        <p className="text-sm text-gray-400 mb-4">
                            Upload multiple images for better 3D model generation (recommended: 30-60 images from different angles)
                        </p>

                        <div className="space-y-4">
                            {/* Upload Area */}
                            <label className="block">
                                <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-orange-500/50 transition-colors cursor-pointer">
                                    <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                                    <p className="text-white font-medium">Click to upload images</p>
                                    <p className="text-sm text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB each</p>
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>

                            {/* Preview Grid */}
                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                            >
                                                <X className="w-5 h-5 text-white" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {images.length > 0 && (
                                <p className="text-sm text-gray-400">
                                    {images.length} image{images.length !== 1 ? 's' : ''} selected
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 3D Model Upload */}
                    <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                            <Box className="w-5 h-5 text-purple-400" />
                            3D Model (Optional)
                        </h2>
                        <p className="text-sm text-gray-400 mb-4">
                            Upload a pre-made 3D model in GLB or GLTF format
                        </p>

                        <label className="block">
                            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${modelFile
                                    ? 'border-purple-500/50 bg-purple-500/10'
                                    : 'border-white/20 hover:border-purple-500/50'
                                }`}>
                                {modelFile ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <Box className="w-8 h-8 text-purple-400" />
                                        <div className="text-left">
                                            <p className="text-white font-medium">{modelFile.name}</p>
                                            <p className="text-sm text-gray-400">{(modelFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setModelFile(null);
                                            }}
                                            className="ml-4 p-2 bg-white/10 rounded-lg hover:bg-red-500/20 transition-colors"
                                        >
                                            <X className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Box className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                                        <p className="text-white font-medium">Click to upload 3D model</p>
                                        <p className="text-sm text-gray-400 mt-1">GLB, GLTF up to 50MB</p>
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

                        <div className="flex items-start gap-2 mt-4 p-3 bg-blue-500/10 rounded-xl">
                            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-300">
                                Don't have a 3D model? Upload 30-60 images and we'll generate one for you automatically!
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {isLoading && (
                        <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-white font-medium">Uploading...</span>
                                <span className="text-gray-400">{uploadProgress}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${uploadProgress}%` }}
                                    className="h-full bg-gradient-to-r from-orange-500 to-pink-500"
                                />
                            </div>
                        </div>
                    )}

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
                            disabled={isLoading}
                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Create Dish
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
