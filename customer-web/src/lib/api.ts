import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// API functions
export const getRestaurantMenu = async (restaurantId: string) => {
    const response = await api.get(`/restaurants/${restaurantId}/menu`);
    return response.data;
};

export const getDish = async (dishId: string) => {
    const response = await api.get(`/dishes/${dishId}`);
    return response.data;
};

export const trackARView = async (dishId: string) => {
    try {
        await api.post(`/dishes/${dishId}/ar-view`);
    } catch (error) {
        console.error('Failed to track AR view:', error);
    }
};

export const getRestaurant = async (restaurantId: string) => {
    const response = await api.get(`/restaurants/${restaurantId}`);
    return response.data;
};

export default api;
