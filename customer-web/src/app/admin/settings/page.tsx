'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Save,
    Building,
    Palette,
    Globe,
    Phone,
    Mail,
    MapPin,
    Loader2,
    Check,
    Upload,
    Image as ImageIcon
} from 'lucide-react';
import { AdminLayout } from '@/components/admin';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface RestaurantSettings {
    name: string;
    description: string;
    cuisine: string[];
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
    };
    contact: {
        phone: string;
        email: string;
        website: string;
    };
    settings: {
        primaryColor: string;
        secondaryColor: string;
        theme: string;
        showAR: boolean;
        showVR: boolean;
        show360: boolean;
    };
}

export default function SettingsPage() {
    const { user, refreshUser } = useAuth();
    const [settings, setSettings] = useState<RestaurantSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        if (user?.restaurant?._id) {
            fetchSettings();
        }
    }, [user]);

    const fetchSettings = async () => {
        try {
            const response = await api.get(`/restaurants/${user?.restaurant?._id}`);
            setSettings(response.data.data.restaurant);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;

        setIsSaving(true);
        try {
            await api.put(`/restaurants/${user?.restaurant?._id}`, settings);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
            await refreshUser();
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Building },
        { id: 'contact', label: 'Contact', icon: Phone },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'features', label: 'Features', icon: Globe },
    ];

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    if (!settings) {
        return (
            <AdminLayout>
                <div className="text-center py-20">
                    <p className="text-gray-400">Failed to load settings</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Settings</h1>
                        <p className="text-gray-400">Manage your restaurant profile</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50"
                    >
                        {isSaving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : saved ? (
                            <Check className="w-5 h-5" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {saved ? 'Saved!' : 'Save Changes'}
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                    ? 'bg-white/10 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-900 border border-white/10 rounded-2xl p-6"
                >
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Restaurant Name
                                </label>
                                <input
                                    type="text"
                                    value={settings.name}
                                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={settings.description || ''}
                                    onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                                    rows={4}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Cuisine Types (comma separated)
                                </label>
                                <input
                                    type="text"
                                    value={settings.cuisine?.join(', ') || ''}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        cuisine: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
                                    })}
                                    placeholder="Indian, Asian, Continental"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'contact' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        <Phone className="w-4 h-4 inline mr-1" />
                                        Phone
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.contact?.phone || ''}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            contact: { ...settings.contact, phone: e.target.value }
                                        })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        <Mail className="w-4 h-4 inline mr-1" />
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={settings.contact?.email || ''}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            contact: { ...settings.contact, email: e.target.value }
                                        })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    <Globe className="w-4 h-4 inline mr-1" />
                                    Website
                                </label>
                                <input
                                    type="url"
                                    value={settings.contact?.website || ''}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        contact: { ...settings.contact, website: e.target.value }
                                    })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>

                            <hr className="border-white/10" />

                            <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-orange-400" />
                                Address
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Street</label>
                                    <input
                                        type="text"
                                        value={settings.address?.street || ''}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            address: { ...settings.address, street: e.target.value }
                                        })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                                    <input
                                        type="text"
                                        value={settings.address?.city || ''}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            address: { ...settings.address, city: e.target.value }
                                        })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
                                    <input
                                        type="text"
                                        value={settings.address?.state || ''}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            address: { ...settings.address, state: e.target.value }
                                        })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                                    <input
                                        type="text"
                                        value={settings.address?.country || ''}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            address: { ...settings.address, country: e.target.value }
                                        })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Zip Code</label>
                                    <input
                                        type="text"
                                        value={settings.address?.zipCode || ''}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            address: { ...settings.address, zipCode: e.target.value }
                                        })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Primary Color
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            type="color"
                                            value={settings.settings?.primaryColor || '#FF6B6B'}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                settings: { ...settings.settings, primaryColor: e.target.value }
                                            })}
                                            className="w-14 h-14 rounded-xl cursor-pointer border-0"
                                        />
                                        <input
                                            type="text"
                                            value={settings.settings?.primaryColor || '#FF6B6B'}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                settings: { ...settings.settings, primaryColor: e.target.value }
                                            })}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Secondary Color
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            type="color"
                                            value={settings.settings?.secondaryColor || '#4ECDC4'}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                settings: { ...settings.settings, secondaryColor: e.target.value }
                                            })}
                                            className="w-14 h-14 rounded-xl cursor-pointer border-0"
                                        />
                                        <input
                                            type="text"
                                            value={settings.settings?.secondaryColor || '#4ECDC4'}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                settings: { ...settings.settings, secondaryColor: e.target.value }
                                            })}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Theme
                                </label>
                                <div className="flex gap-4">
                                    {['dark', 'light'].map(theme => (
                                        <button
                                            key={theme}
                                            onClick={() => setSettings({
                                                ...settings,
                                                settings: { ...settings.settings, theme }
                                            })}
                                            className={`flex-1 py-4 rounded-xl border-2 transition-all ${settings.settings?.theme === theme
                                                    ? 'border-orange-500 bg-orange-500/10'
                                                    : 'border-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-full mx-auto mb-2 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                                                }`} />
                                            <span className="text-white capitalize">{theme}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'features' && (
                        <div className="space-y-4">
                            <p className="text-gray-400 mb-6">
                                Enable or disable viewing modes for your customers
                            </p>

                            <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                <div>
                                    <h4 className="font-medium text-white">360° View</h4>
                                    <p className="text-sm text-gray-400">Allow customers to rotate dishes</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settings.settings?.show360 ?? true}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        settings: { ...settings.settings, show360: e.target.checked }
                                    })}
                                    className="w-6 h-6 rounded bg-white/10 border-0 text-orange-500 focus:ring-orange-500"
                                />
                            </label>

                            <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                <div>
                                    <h4 className="font-medium text-white">AR Mode</h4>
                                    <p className="text-sm text-gray-400">Place dishes on table using camera</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settings.settings?.showAR ?? true}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        settings: { ...settings.settings, showAR: e.target.checked }
                                    })}
                                    className="w-6 h-6 rounded bg-white/10 border-0 text-orange-500 focus:ring-orange-500"
                                />
                            </label>

                            <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                <div>
                                    <h4 className="font-medium text-white">VR Mode</h4>
                                    <p className="text-sm text-gray-400">Gyroscope-based immersive viewing</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settings.settings?.showVR ?? true}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        settings: { ...settings.settings, showVR: e.target.checked }
                                    })}
                                    className="w-6 h-6 rounded bg-white/10 border-0 text-orange-500 focus:ring-orange-500"
                                />
                            </label>
                        </div>
                    )}
                </motion.div>

                {/* Menu Preview Link */}
                <div className="mt-6 p-4 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20 rounded-xl">
                    <p className="text-sm text-gray-300">
                        <strong className="text-white">Your menu URL:</strong>{' '}
                        <a
                            href={`/menu/${user?.restaurant?._id}`}
                            target="_blank"
                            className="text-orange-400 hover:underline"
                        >
                            {typeof window !== 'undefined' ? window.location.origin : ''}/menu/{user?.restaurant?._id}
                        </a>
                    </p>
                </div>
            </div>
        </AdminLayout>
    );
}
