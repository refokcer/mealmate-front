import { apiRequest } from './httpClient';
import { getEndpoint } from './apiConfig';

const endpoint = getEndpoint('dishes');

export const fetchDishes = () => apiRequest(endpoint);

export const fetchDish = (id) => apiRequest(`${endpoint}/${id}`);

export const createDish = (payload) =>
  apiRequest(endpoint, { method: 'POST', body: payload });

export const updateDish = (id, payload) =>
  apiRequest(`${endpoint}/${id}`, { method: 'PUT', body: payload });

export const deleteDish = (id) =>
  apiRequest(`${endpoint}/${id}`, { method: 'DELETE' });

