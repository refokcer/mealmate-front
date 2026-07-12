import { useCallback, useEffect, useMemo, useState } from 'react';
import * as dishesApi from '../api/dishes';
import * as productsApi from '../api/products';
import * as mealGroupsApi from '../api/mealGroups';
import * as dishProductsApi from '../api/dishProducts';
import * as mealGroupDishesApi from '../api/mealGroupDishes';
import * as shoppingListApi from '../api/shoppingList';
import * as baseShoppingProductsApi from '../api/baseShoppingProducts';

const extractErrorMessage = (error) => {
  if (!error) {
    return null;
  }

  if (error.payload?.message) {
    return error.payload.message;
  }

  if (typeof error.payload === 'string' && error.payload.trim().length > 0) {
    return error.payload;
  }

  if (error.status === 404) {
    return 'Запрашиваемый ресурс не найден.';
  }

  if (error.status === 409) {
    return 'Такая запись уже существует. Обновите данные и попробуйте снова.';
  }

  return 'Не удалось выполнить запрос. Проверьте подключение или попробуйте ещё раз.';
};

export const usePlannerData = () => {
  const [dishes, setDishes] = useState([]);
  const [products, setProducts] = useState([]);
  const [mealGroups, setMealGroups] = useState([]);
  const [dishProducts, setDishProducts] = useState([]);
  const [mealGroupDishes, setMealGroupDishes] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [baseShoppingProducts, setBaseShoppingProducts] = useState([]);

  const [initialLoading, setInitialLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState(null);

  const handleError = useCallback((err) => {
    console.error(err);
    setError(extractErrorMessage(err));
    return err;
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const loadDishes = useCallback(async () => {
    const data = await dishesApi.fetchDishes();
    setDishes(data ?? []);
    return data;
  }, []);

  const loadProducts = useCallback(async () => {
    const data = await productsApi.fetchProducts();
    setProducts(data ?? []);
    return data;
  }, []);

  const loadMealGroups = useCallback(async () => {
    const data = await mealGroupsApi.fetchMealGroups();
    setMealGroups(data ?? []);
    return data;
  }, []);

  const loadDishProducts = useCallback(async () => {
    const data = await dishProductsApi.fetchDishProducts();
    setDishProducts(data ?? []);
    return data;
  }, []);

  const loadMealGroupDishes = useCallback(async () => {
    const data = await mealGroupDishesApi.fetchMealGroupDishes();
    setMealGroupDishes(data ?? []);
    return data;
  }, []);

  const loadShoppingList = useCallback(async () => {
    const data = await shoppingListApi.fetchShoppingList();
    setShoppingList(data ?? []);
    return data;
  }, []);

  const loadBaseShoppingProducts = useCallback(async () => {
    const data = await baseShoppingProductsApi.fetchBaseShoppingProducts();
    setBaseShoppingProducts(data ?? []);
    return data;
  }, []);

  const loadAll = useCallback(async () => {
    setInitialLoading(true);
    clearError();

    try {
      await Promise.all([
        loadDishes(),
        loadProducts(),
        loadMealGroups(),
        loadDishProducts(),
        loadMealGroupDishes(),
        loadShoppingList(),
        loadBaseShoppingProducts(),
      ]);
    } catch (err) {
      handleError(err);
    } finally {
      setInitialLoading(false);
    }
  }, [clearError, handleError, loadBaseShoppingProducts, loadDishProducts, loadDishes, loadMealGroupDishes, loadMealGroups, loadProducts, loadShoppingList]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const runMutation = useCallback(
    async (mutation, refreshers = []) => {
      clearError();
      setIsMutating(true);

      try {
        const result = await mutation();
        await Promise.all(refreshers.map((ref) => ref()));
        return result;
      } catch (err) {
        throw handleError(err);
      } finally {
        setIsMutating(false);
      }
    },
    [clearError, handleError],
  );

  const value = useMemo(
    () => ({
      dishes,
      products,
      mealGroups,
      dishProducts,
      mealGroupDishes,
      shoppingList,
      baseShoppingProducts,
      loading: initialLoading,
      error,
      isMutating,
      refresh: loadAll,
      clearError,
      async createDish(payload) {
        return runMutation(() => dishesApi.createDish(payload), [loadDishes]);
      },
      async updateDish(id, payload) {
        return runMutation(() => dishesApi.updateDish(id, payload), [loadDishes]);
      },
      async deleteDish(id) {
        return runMutation(() => dishesApi.deleteDish(id), [loadDishes, loadMealGroups, loadDishProducts]);
      },
      async createProduct(payload) {
        return runMutation(() => productsApi.createProduct(payload), [loadProducts]);
      },
      async updateProduct(id, payload) {
        return runMutation(() => productsApi.updateProduct(id, payload), [loadProducts]);
      },
      async deleteProduct(id) {
        return runMutation(() => productsApi.deleteProduct(id), [loadProducts, loadDishes, loadDishProducts]);
      },
      async createMealGroup(payload) {
        return runMutation(() => mealGroupsApi.createMealGroup(payload), [loadMealGroups]);
      },
      async updateMealGroup(id, payload) {
        return runMutation(() => mealGroupsApi.updateMealGroup(id, payload), [loadMealGroups]);
      },
      async deleteMealGroup(id) {
        return runMutation(() => mealGroupsApi.deleteMealGroup(id), [loadMealGroups, loadMealGroupDishes]);
      },
      async createDishProduct(payload) {
        return runMutation(() => dishProductsApi.createDishProduct(payload), [loadDishProducts, loadDishes]);
      },
      async updateDishProduct(dishId, productId, payload) {
        return runMutation(
          () => dishProductsApi.updateDishProduct(dishId, productId, payload),
          [loadDishProducts, loadDishes],
        );
      },
      async deleteDishProduct(dishId, productId) {
        return runMutation(
          () => dishProductsApi.deleteDishProduct(dishId, productId),
          [loadDishProducts, loadDishes],
        );
      },
      async createMealGroupDish(payload) {
        return runMutation(
          () => mealGroupDishesApi.createMealGroupDish(payload),
          [loadMealGroupDishes, loadMealGroups, loadDishes],
        );
      },
      async updateMealGroupDish(mealGroupId, dishId, payload) {
        return runMutation(
          () => mealGroupDishesApi.updateMealGroupDish(mealGroupId, dishId, payload),
          [loadMealGroupDishes, loadMealGroups, loadDishes],
        );
      },
      async deleteMealGroupDish(mealGroupId, dishId) {
        return runMutation(
          () => mealGroupDishesApi.deleteMealGroupDish(mealGroupId, dishId),
          [loadMealGroupDishes, loadMealGroups, loadDishes],
        );
      },
      async saveShoppingList(items) {
        return runMutation(() => shoppingListApi.saveShoppingList(items), [loadShoppingList]);
      },
      async createShoppingListItem(payload) {
        return runMutation(() => shoppingListApi.createShoppingListItem(payload), [loadShoppingList]);
      },
      async updateShoppingListItem(id, payload) {
        return runMutation(() => shoppingListApi.updateShoppingListItem(id, payload), [loadShoppingList]);
      },
      async deleteShoppingListItem(id) {
        return runMutation(() => shoppingListApi.deleteShoppingListItem(id), [loadShoppingList]);
      },
      async clearShoppingList() {
        return runMutation(() => shoppingListApi.clearShoppingList(), [loadShoppingList]);
      },
      async addBaseProductsToShoppingList() {
        return runMutation(() => shoppingListApi.addBaseProductsToShoppingList(), [loadShoppingList]);
      },
      async createBaseShoppingProduct(payload) {
        return runMutation(() => baseShoppingProductsApi.createBaseShoppingProduct(payload), [loadBaseShoppingProducts]);
      },
      async updateBaseShoppingProduct(id, payload) {
        return runMutation(() => baseShoppingProductsApi.updateBaseShoppingProduct(id, payload), [loadBaseShoppingProducts]);
      },
      async deleteBaseShoppingProduct(id) {
        return runMutation(() => baseShoppingProductsApi.deleteBaseShoppingProduct(id), [loadBaseShoppingProducts]);
      },
    }),
    [
      baseShoppingProducts,
      clearError,
      dishProducts,
      dishes,
      error,
      initialLoading,
      isMutating,
      loadAll,
      loadBaseShoppingProducts,
      loadDishProducts,
      loadDishes,
      loadMealGroupDishes,
      loadMealGroups,
      loadProducts,
      loadShoppingList,
      mealGroupDishes,
      mealGroups,
      products,
      runMutation,
      shoppingList,
    ],
  );

  return value;
};

