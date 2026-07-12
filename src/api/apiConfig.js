const DEFAULT_BASE_URL = '/api';

export const apiConfig = {
  baseUrl: process.env.REACT_APP_API_BASE_URL || DEFAULT_BASE_URL,
  endpoints: {
    dishes: '/dishes',
    products: '/products',
    mealGroups: '/meal-groups',
    dishProducts: '/dish-products',
    mealGroupDishes: '/meal-group-dishes',
    shoppingList: '/shopping-list',
    baseShoppingProducts: '/base-shopping-products',
  },
};

export const buildApiUrl = (path = '') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiConfig.baseUrl}${normalizedPath}`;
};

export const getEndpoint = (key) => apiConfig.endpoints[key];
