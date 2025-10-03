import { apiRequest } from './httpClient';
import { getEndpoint } from './apiConfig';

const endpoint = getEndpoint('products');

export const fetchProducts = () => apiRequest(endpoint);

export const fetchProduct = (id) => apiRequest(`${endpoint}/${id}`);

export const createProduct = (payload) =>
  apiRequest(endpoint, { method: 'POST', body: payload });

export const updateProduct = (id, payload) =>
  apiRequest(`${endpoint}/${id}`, { method: 'PUT', body: payload });

export const deleteProduct = (id) =>
  apiRequest(`${endpoint}/${id}`, { method: 'DELETE' });

