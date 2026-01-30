import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

export function formatPrice(price: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
    }).format(price);
}

export function getSpiceLevelLabel(level: number): string {
    const labels = ['Mild', 'Low', 'Medium', 'Hot', 'Very Hot', 'Extreme'];
    return labels[level] || 'Unknown';
}

export function isARSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'xr' in navigator || 'webkitXRSession' in window;
}

export function isGyroSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'DeviceOrientationEvent' in window;
}
