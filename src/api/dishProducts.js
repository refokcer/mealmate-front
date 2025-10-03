import { apiRequest } from './httpClient';
import { getEndpoint } from './apiConfig';

const endpoint = getEndpoint('dishProducts');

export const fetchDishProducts = () => apiRequest(endpoint);

export const fetchDishProduct = (dishId, productId) =>
  apiRequest(`${endpoint}/${dishId}/${productId}`);

export const createDishProduct = (payload) =>
  apiRequest(endpoint, { method: 'POST', body: payload });

export const updateDishProduct = (dishId, productId, payload) =>
  apiRequest(`${endpoint}/${dishId}/${productId}`, { method: 'PUT', body: payload });

export const deleteDishProduct = (dishId, productId) =>
  apiRequest(`${endpoint}/${dishId}/${productId}`, { method: 'DELETE' });

