'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Camera, Glasses, Maximize2, Smartphone, AlertCircle } from 'lucide-react';
import { Dish, ViewMode } from '@/types';
import { trackARView } from '@/lib/api';

interface ModelViewerProps {
    dish: Dish;
    isOpen: boolean;
    onClose: () => void;
    apiUrl: string;
}

export default function ModelViewer({ dish, isOpen, onClose, apiUrl }: ModelViewerProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('360');
    const [isLoading, setIsLoading] = useState(true);
    const [hasARTracked, setHasARTracked] = useState(false);
    const [arSupported, setArSupported] = useState(false);
    const [showARTip, setShowARTip] = useState(false);
    const [gyroEnabled, setGyroEnabled] = useState(false);
    const [gyroSupported, setGyroSupported] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const modelViewerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        // Load model-viewer script dynamically
        if (typeof window !== 'undefined' && !customElements.get('model-viewer')) {
            const script = document.createElement('script');
            script.type = 'module';
            script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js';
            document.head.appendChild(script);
        }

        // Check AR/VR support
        checkARVRSupport();
    }, []);

    const checkARVRSupport = async () => {
        if (typeof window === 'undefined') return;

        // Check if device likely supports AR (mobile device)
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Check WebXR support
        if ('xr' in navigator) {
            try {
                const xr = (navigator as any).xr;
                if (xr) {
                    const arSupport = await xr.isSessionSupported('immersive-ar').catch(() => false);
                    setArSupported(arSupport || isMobile);
                }
            } catch {
                setArSupported(isMobile);
            }
        } else {
            // Fallback for iOS which uses Quick Look
            setArSupported(isMobile);
        }

        // Check gyroscope support safely
        try {
            if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
                setGyroSupported(true);
            }
        } catch {
            setGyroSupported(false);
        }
    };

    useEffect(() => {
        if (!isOpen || !containerRef.current || !dish.modelUrl) return;

        // Wait for model-viewer to be defined
        const checkModelViewer = setInterval(() => {
            if (customElements.get('model-viewer')) {
                clearInterval(checkModelViewer);
                createModelViewer();
            }
        }, 100);

        const createModelViewer = () => {
            if (!containerRef.current) return;

            // Remove /api from the base URL for static file serving
            const baseUrl = apiUrl.replace('/api', '');

            // Use a public demo model as fallback if model URL is not accessible
            const demoModelUrl = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';

            let modelUrl = dish.modelUrl?.startsWith('http')
                ? dish.modelUrl
                : dish.modelUrl
                    ? `${baseUrl}${dish.modelUrl}`
                    : demoModelUrl;

            const posterUrl = dish.thumbnailUrl?.startsWith('http')
                ? dish.thumbnailUrl
                : dish.thumbnailUrl
                    ? `${baseUrl}${dish.thumbnailUrl}`
                    : undefined;

            // Create model-viewer element
            const mv = document.createElement('model-viewer');
            mv.setAttribute('src', modelUrl);
            if (posterUrl) mv.setAttribute('poster', posterUrl);
            mv.setAttribute('alt', dish.name);
            mv.setAttribute('camera-controls', '');
            mv.setAttribute('auto-rotate', '');
            mv.setAttribute('shadow-intensity', '1');
            mv.setAttribute('exposure', '0.8');
            mv.setAttribute('environment-image', 'neutral');
            mv.setAttribute('touch-action', 'pan-y');
            mv.setAttribute('interaction-prompt', 'none');
            mv.setAttribute('loading', 'eager');
            mv.setAttribute('reveal', 'auto');

            // AR configuration - prioritize scene-viewer for better Android compatibility
            mv.setAttribute('ar', '');
            mv.setAttribute('ar-modes', 'scene-viewer webxr quick-look');
            mv.setAttribute('ar-scale', 'auto');
            mv.setAttribute('ar-placement', 'floor');

            mv.style.width = '100%';
            mv.style.height = '100%';
            mv.style.backgroundColor = 'transparent';

            // Add AR button slot for model-viewer's built-in AR
            const arButton = document.createElement('button');
            arButton.setAttribute('slot', 'ar-button');
            arButton.style.display = 'none'; // Hidden, we'll trigger programmatically
            arButton.id = 'ar-button-hidden';
            mv.appendChild(arButton);

            mv.addEventListener('load', () => {
                try {
                    setIsLoading(false);
                    // Check if AR is available on this model-viewer instance
                    const mvAny = mv as any;
                    if (mvAny.canActivateAR) {
                        setArSupported(true);
                    }
                } catch (error) {
                    console.error('Error in load handler:', error);
                    setIsLoading(false);
                }
            });

            mv.addEventListener('error', (event: any) => {
                console.error('Model loading error:', event);
                setIsLoading(false);
                // Try fallback to demo model if original fails
                if (modelUrl !== demoModelUrl) {
                    console.log('Retrying with demo model...');
                    try {
                        mv.setAttribute('src', demoModelUrl);
                        setIsLoading(true);
                    } catch (error) {
                        console.error('Failed to load fallback model:', error);
                    }
                }
            });

            mv.addEventListener('ar-status', (event: any) => {
                try {
                    console.log('AR Status:', event.detail.status);
                } catch (error) {
                    console.error('AR status error:', error);
                }
            });

            containerRef.current.innerHTML = '';
            containerRef.current.appendChild(mv);
            modelViewerRef.current = mv;
        };

        return () => {
            clearInterval(checkModelViewer);
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [isOpen, dish.modelUrl, dish.thumbnailUrl, dish.name, apiUrl]);

    // Handle gyroscope for VR-like experience
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (viewMode !== 'vr' || !gyroEnabled) return;

        const handleOrientation = (event: DeviceOrientationEvent) => {
            const mv = modelViewerRef.current as any;
            if (mv && event.beta !== null && event.gamma !== null) {
                // Map device orientation to camera orbit
                const pitch = Math.max(-90, Math.min(90, event.beta - 90));
                const yaw = event.gamma;
                mv.cameraOrbit = `${yaw}deg ${90 - pitch}deg auto`;
            }
        };

        try {
            window.addEventListener('deviceorientation', handleOrientation);
            return () => window.removeEventListener('deviceorientation', handleOrientation);
        } catch (e) {
            console.log('DeviceOrientation not supported');
        }
    }, [viewMode, gyroEnabled]);

    const handleARActivation = async () => {
        const mv = modelViewerRef.current as any;

        if (!mv) {
            setShowARTip(true);
            return;
        }

        // Track AR view
        if (!hasARTracked) {
            try {
                await trackARView(dish.id);
                setHasARTracked(true);
            } catch (e) {
                console.log('Failed to track AR view');
            }
        }

        // Check if device is mobile (Android/iOS)
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Force attempt on mobile OR if explicit support is detected
        // On Android, Scene Viewer (intent) often works even if canActivateAR is false
        if (isMobile || mv.canActivateAR) {
            setViewMode('ar');
            try {
                await mv.activateAR();
            } catch (error) {
                console.error('Failed to activate AR:', error);
                // Only show tip if the activation explicitly failed
                setShowARTip(true);
            }
        } else {
            // Show tip for desktop devices
            setShowARTip(true);
        }
    };

    const handleVRActivation = async () => {
        setViewMode('vr');

        // Check if DeviceOrientationEvent exists and has requestPermission (iOS 13+)
        if (typeof window === 'undefined') return;

        try {
            // Check if DeviceOrientationEvent exists
            if ('DeviceOrientationEvent' in window) {
                const DOE = (window as any).DeviceOrientationEvent;

                // iOS 13+ requires permission
                if (typeof DOE.requestPermission === 'function') {
                    try {
                        const permission = await DOE.requestPermission();
                        if (permission === 'granted') {
                            setGyroEnabled(true);
                        }
                    } catch (error) {
                        console.error('Gyroscope permission denied:', error);
                    }
                } else {
                    // Non-iOS devices - gyroscope works without permission
                    setGyroEnabled(true);
                }
            } else {
                console.log('DeviceOrientationEvent not supported');
            }
        } catch (error) {
            console.error('Error accessing gyroscope:', error);
        }

        // Enable gyroscope-based camera control
        const mv = modelViewerRef.current as any;
        if (mv) {
            mv.setAttribute('auto-rotate', '');
            mv.setAttribute('camera-controls', '');
        }
    };

    const handle360Mode = () => {
        setViewMode('360');
        setGyroEnabled(false);

        const mv = modelViewerRef.current as any;
        if (mv) {
            mv.setAttribute('auto-rotate', '');
            mv.setAttribute('camera-controls', '');
            mv.cameraOrbit = 'auto auto 100%';
        }
    };

    const handleReset = () => {
        const mv = modelViewerRef.current as any;
        if (mv) {
            mv.cameraOrbit = 'auto auto 100%';
            mv.fieldOfView = 'auto';
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full h-full max-w-4xl max-h-[90vh] mx-4 bg-gradient-to-b from-gray-900 to-black rounded-3xl overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">{dish.name}</h2>
                                <p className="text-gray-400 text-sm">
                                    {viewMode === '360' && 'Drag to rotate • Pinch to zoom'}
                                    {viewMode === 'ar' && 'Point your camera at a flat surface'}
                                    {viewMode === 'vr' && (gyroEnabled ? 'Move your device to look around' : 'Enabling gyroscope...')}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <X className="w-6 h-6 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* AR Tip Modal */}
                    {showARTip && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute inset-x-4 top-20 z-20 p-4 bg-blue-500/90 rounded-2xl backdrop-blur-sm"
                        >
                            <div className="flex items-start gap-3">
                                <Smartphone className="w-6 h-6 text-white flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-bold text-white mb-1">AR Not Available</h3>
                                    <p className="text-blue-100 text-sm">
                                        AR requires a compatible mobile browser. On Android, use Chrome. On iPhone/iPad, use Safari. Make sure you're accessing this page directly on your mobile device.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowARTip(false)}
                                    className="p-1 rounded-full hover:bg-white/20"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* VR Mode Overlay */}
                    {viewMode === 'vr' && (
                        <div className="absolute top-20 left-4 right-4 z-10">
                            <div className="flex items-center gap-2 p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-300 text-sm">
                                <AlertCircle className="w-5 h-5" />
                                <span>
                                    {gyroEnabled
                                        ? 'Gyroscope active! Move your device to explore the dish.'
                                        : 'Tap to enable gyroscope for immersive viewing.'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Model Viewer */}
                    <div className="w-full h-full flex items-center justify-center">
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                            </div>
                        )}

                        {dish.modelUrl ? (
                            <div ref={containerRef} className="w-full h-full" />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400">
                                <div className="w-32 h-32 mb-4 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                                    <Camera className="w-16 h-16 text-gray-500" />
                                </div>
                                <p className="text-lg">3D model not available</p>
                                <p className="text-sm text-gray-500">Check back later</p>
                            </div>
                        )}
                    </div>

                    {/* Bottom Controls */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="flex items-center justify-center gap-3">
                            {/* Reset View */}
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                            >
                                <RotateCcw className="w-5 h-5" />
                                <span className="hidden sm:inline">Reset</span>
                            </button>

                            {/* View Mode Buttons */}
                            <div className="flex items-center gap-1 p-1 rounded-full bg-white/10">
                                {/* 360 Mode */}
                                <button
                                    onClick={handle360Mode}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${viewMode === '360'
                                        ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <Maximize2 className="w-5 h-5" />
                                    <span className="hidden sm:inline">360°</span>
                                </button>

                                {/* AR Mode */}
                                <button
                                    onClick={handleARActivation}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${viewMode === 'ar'
                                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                    title="View in Augmented Reality"
                                >
                                    <Camera className="w-5 h-5" />
                                    <span className="hidden sm:inline">AR</span>
                                </button>

                                {/* VR Mode (Gyroscope) */}
                                <button
                                    onClick={handleVRActivation}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${viewMode === 'vr'
                                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                    title="View with Gyroscope"
                                >
                                    <Glasses className="w-5 h-5" />
                                    <span className="hidden sm:inline">VR</span>
                                </button>
                            </div>
                        </div>

                        {/* AR/VR Support Info */}
                        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
                            {gyroEnabled && viewMode === 'vr' && (
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    Gyroscope active
                                </span>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
