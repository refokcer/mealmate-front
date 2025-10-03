import { apiRequest } from './httpClient';
import { getEndpoint } from './apiConfig';

const endpoint = getEndpoint('mealGroupDishes');

export const fetchMealGroupDishes = () => apiRequest(endpoint);

export const fetchMealGroupDish = (mealGroupId, dishId) =>
  apiRequest(`${endpoint}/${mealGroupId}/${dishId}`);

export const createMealGroupDish = (payload) =>
  apiRequest(endpoint, { method: 'POST', body: payload });

export const updateMealGroupDish = (mealGroupId, dishId, payload) =>
  apiRequest(`${endpoint}/${mealGroupId}/${dishId}`, { method: 'PUT', body: payload });

export const deleteMealGroupDish = (mealGroupId, dishId) =>
  apiRequest(`${endpoint}/${mealGroupId}/${dishId}`, { method: 'DELETE' });

