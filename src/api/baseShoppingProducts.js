import { apiRequest } from './httpClient';
import { getEndpoint } from './apiConfig';

const endpoint = getEndpoint('baseShoppingProducts');

export const fetchBaseShoppingProducts = () => apiRequest(endpoint);

export const createBaseShoppingProduct = (payload) =>
  apiRequest(endpoint, {
    method: 'POST',
    body: payload,
  });

export const updateBaseShoppingProduct = (id, payload) =>
  apiRequest(`${endpoint}/${id}`, {
    method: 'PUT',
    body: payload,
  });

export const deleteBaseShoppingProduct = (id) =>
  apiRequest(`${endpoint}/${id}`, {
    method: 'DELETE',
  });
