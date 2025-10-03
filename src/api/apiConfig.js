const DEFAULT_BASE_URL = 'https://localhost:7252';

export const apiConfig = {
  baseUrl: process.env.REACT_APP_API_BASE_URL || DEFAULT_BASE_URL,
  endpoints: {
    dishes: '/api/dishes',
    products: '/api/products',
    mealGroups: '/api/meal-groups',
    dishProducts: '/api/dish-products',
    mealGroupDishes: '/api/meal-group-dishes',
  },
};

export const buildApiUrl = (path = '') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiConfig.baseUrl}${normalizedPath}`;
};

export const getEndpoint = (key) => apiConfig.endpoints[key];

