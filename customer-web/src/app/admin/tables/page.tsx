'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    QrCode,
    Download,
    Trash2,
    RefreshCw,
    Loader2,
    Copy,
    Check,
    ExternalLink,
    MapPin,
    Users
} from 'lucide-react';
import { AdminLayout } from '@/components/admin';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface Table {
    _id: string;
    number: string;
    name: string;
    capacity: number;
    location: string;
    isActive: boolean;
    qrCode: {
        dataUrl: string;
        uniqueId: string;
    };
}

const LOCATIONS = ['indoor', 'outdoor', 'patio', 'rooftop', 'private'];

export default function TablesPage() {
    const { user } = useAuth();
    const [tables, setTables] = useState<Table[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showNewForm, setShowNewForm] = useState(false);
    const [formData, setFormData] = useState({ number: '', name: '', capacity: 4, location: 'indoor' });
    const [isSaving, setIsSaving] = useState(false);
    const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showBulkCreate, setShowBulkCreate] = useState(false);
    const [bulkCount, setBulkCount] = useState(5);

    useEffect(() => {
        if (user?.restaurant?._id) {
            fetchTables();
        }
    }, [user]);

    const fetchTables = async () => {
        try {
            const response = await api.get(`/tables?restaurant=${user?.restaurant?._id}`);
            setTables(response.data.data?.tables || []);
        } catch (error) {
            console.error('Failed to fetch tables:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.number) return;

        setIsSaving(true);
        try {
            const response = await api.post('/tables', {
                ...formData,
                restaurant: user?.restaurant?._id,
            });
            setTables([...tables, response.data.data.table]);
            setFormData({ number: '', name: '', capacity: 4, location: 'indoor' });
            setShowNewForm(false);
        } catch (error) {
            console.error('Failed to create table:', error);
            alert('Failed to create table');
        } finally {
            setIsSaving(false);
        }
    };

    const handleBulkCreate = async () => {
        setIsSaving(true);
        try {
            const response = await api.post('/tables/bulk', {
                count: bulkCount,
                startNumber: tables.length + 1,
                restaurant: user?.restaurant?._id,
            });
            setTables([...tables, ...response.data.data.tables]);
            setShowBulkCreate(false);
        } catch (error) {
            console.error('Failed to bulk create tables:', error);
            alert('Failed to create tables');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this table?')) return;

        try {
            await api.delete(`/tables/${id}`);
            setTables(tables.filter(t => t._id !== id));
        } catch (error) {
            console.error('Failed to delete table:', error);
            alert('Failed to delete table');
        }
    };

    const handleRegenerateQR = async (id: string) => {
        setRegeneratingId(id);
        try {
            const response = await api.post(`/tables/${id}/regenerate-qr`);
            setTables(tables.map(t =>
                t._id === id ? { ...t, qrCode: response.data.data.qrCode } : t
            ));
        } catch (error) {
            console.error('Failed to regenerate QR:', error);
            alert('Failed to regenerate QR code');
        } finally {
            setRegeneratingId(null);
        }
    };

    const downloadQR = (table: Table) => {
        const link = document.createElement('a');
        link.download = `table-${table.number}-qr.png`;
        link.href = table.qrCode.dataUrl;
        link.click();
    };

    const copyMenuLink = async (table: Table) => {
        const menuUrl = `${window.location.origin}/menu/${user?.restaurant?._id}?table=${table.qrCode.uniqueId}`;
        await navigator.clipboard.writeText(menuUrl);
        setCopiedId(table._id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getLocationColor = (location: string) => {
        switch (location) {
            case 'indoor': return 'bg-blue-500/20 text-blue-400';
            case 'outdoor': return 'bg-green-500/20 text-green-400';
            case 'patio': return 'bg-yellow-500/20 text-yellow-400';
            case 'rooftop': return 'bg-purple-500/20 text-purple-400';
            case 'private': return 'bg-pink-500/20 text-pink-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Tables & QR Codes</h1>
                        <p className="text-gray-400">Manage tables and generate menu QR codes</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowBulkCreate(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Bulk Create
                        </button>
                        <button
                            onClick={() => {
                                setShowNewForm(true);
                                setShowBulkCreate(false);
                            }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Add Table
                        </button>
                    </div>
                </div>

                {/* New Table Form */}
                {showNewForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-900 border border-white/10 rounded-2xl p-6"
                    >
                        <h3 className="text-lg font-semibold text-white mb-4">Add New Table</h3>
                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input
                                type="text"
                                value={formData.number}
                                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                placeholder="Table Number"
                                required
                                className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                            />
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Name (optional)"
                                className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                            />
                            <input
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                placeholder="Capacity"
                                min="1"
                                className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                            />
                            <select
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                            >
                                {LOCATIONS.map(loc => (
                                    <option key={loc} value={loc} className="bg-gray-900">
                                        {loc.charAt(0).toUpperCase() + loc.slice(1)}
                                    </option>
                                ))}
                            </select>
                            <div className="md:col-span-4 flex gap-3">
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
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium rounded-xl transition-all disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                    Create Table
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* Bulk Create Form */}
                {showBulkCreate && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-900 border border-white/10 rounded-2xl p-6"
                    >
                        <h3 className="text-lg font-semibold text-white mb-4">Bulk Create Tables</h3>
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm text-gray-400 mb-2">Number of tables to create</label>
                                <input
                                    type="number"
                                    value={bulkCount}
                                    onChange={(e) => setBulkCount(parseInt(e.target.value))}
                                    min="1"
                                    max="50"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowBulkCreate(false)}
                                className="px-6 py-3 text-gray-400 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkCreate}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium rounded-xl transition-all disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                Create {bulkCount} Tables
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Tables Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    </div>
                ) : tables.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tables.map((table, index) => (
                            <motion.div
                                key={table._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all"
                            >
                                {/* QR Code */}
                                <div className="p-6 bg-white flex items-center justify-center">
                                    <img
                                        src={table.qrCode?.dataUrl}
                                        alt={`QR Code for Table ${table.number}`}
                                        className="w-40 h-40"
                                    />
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xl font-bold text-white">
                                            Table {table.number}
                                        </h3>
                                        <span className={`text-xs px-2 py-1 rounded-full ${getLocationColor(table.location)}`}>
                                            <MapPin className="w-3 h-3 inline mr-1" />
                                            {table.location}
                                        </span>
                                    </div>

                                    {table.name && (
                                        <p className="text-gray-400 text-sm mb-2">{table.name}</p>
                                    )}

                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                        <Users className="w-4 h-4" />
                                        <span>Capacity: {table.capacity}</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => downloadQR(table)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download
                                        </button>
                                        <button
                                            onClick={() => copyMenuLink(table)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
                                        >
                                            {copiedId === table._id ? (
                                                <>
                                                    <Check className="w-4 h-4 text-green-400" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4" />
                                                    Copy Link
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => handleRegenerateQR(table._id)}
                                            disabled={regeneratingId === table._id}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-white/10 text-gray-400 rounded-lg hover:bg-white/5 hover:text-white transition-colors text-sm disabled:opacity-50"
                                        >
                                            <RefreshCw className={`w-4 h-4 ${regeneratingId === table._id ? 'animate-spin' : ''}`} />
                                            Regenerate
                                        </button>
                                        <button
                                            onClick={() => handleDelete(table._id)}
                                            className="py-2 px-3 border border-white/10 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <QrCode className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No tables yet</h3>
                        <p className="text-gray-400 mb-6">Create tables to generate QR codes for your menu</p>
                        <button
                            onClick={() => setShowNewForm(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Create First Table
                        </button>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
