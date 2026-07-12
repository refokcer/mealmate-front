import { apiRequest } from './httpClient';
import { getEndpoint } from './apiConfig';

const endpoint = getEndpoint('shoppingList');

export const fetchShoppingList = () => apiRequest(endpoint);

export const saveShoppingList = (items) =>
  apiRequest(endpoint, {
    method: 'PUT',
    body: { items },
  });

export const createShoppingListItem = (payload) =>
  apiRequest(`${endpoint}/items`, {
    method: 'POST',
    body: payload,
  });

export const updateShoppingListItem = (id, payload) =>
  apiRequest(`${endpoint}/items/${id}`, {
    method: 'PUT',
    body: payload,
  });

export const deleteShoppingListItem = (id) =>
  apiRequest(`${endpoint}/items/${id}`, {
    method: 'DELETE',
  });

export const clearShoppingList = () =>
  apiRequest(endpoint, {
    method: 'DELETE',
  });

export const addBaseProductsToShoppingList = () =>
  apiRequest(`${endpoint}/add-base-products`, {
    method: 'POST',
  });
