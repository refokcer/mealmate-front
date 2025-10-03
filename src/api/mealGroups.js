import { apiRequest } from './httpClient';
import { getEndpoint } from './apiConfig';

const endpoint = getEndpoint('mealGroups');

export const fetchMealGroups = () => apiRequest(endpoint);

export const fetchMealGroup = (id) => apiRequest(`${endpoint}/${id}`);

export const createMealGroup = (payload) =>
  apiRequest(endpoint, { method: 'POST', body: payload });

export const updateMealGroup = (id, payload) =>
  apiRequest(`${endpoint}/${id}`, { method: 'PUT', body: payload });

export const deleteMealGroup = (id) =>
  apiRequest(`${endpoint}/${id}`, { method: 'DELETE' });

