import { useCallback, useEffect, useMemo, useState } from 'react';
import * as dishesApi from '../api/dishes';
import * as productsApi from '../api/products';
import * as mealGroupsApi from '../api/mealGroups';
import * as dishProductsApi from '../api/dishProducts';
import * as mealGroupDishesApi from '../api/mealGroupDishes';

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
      ]);
    } catch (err) {
      handleError(err);
    } finally {
      setInitialLoading(false);
    }
  }, [clearError, handleError, loadDishProducts, loadDishes, loadMealGroupDishes, loadMealGroups, loadProducts]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const runMutation = useCallback(
    async (mutation, refreshers = []) => {
      clearError();
      setIsMutating(true);

      try {
        await mutation();
        await Promise.all(refreshers.map((ref) => ref()));
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
      loading: initialLoading,
      error,
      isMutating,
      refresh: loadAll,
      clearError,
      async createDish(payload) {
        await runMutation(() => dishesApi.createDish(payload), [loadDishes]);
      },
      async updateDish(id, payload) {
        await runMutation(() => dishesApi.updateDish(id, payload), [loadDishes]);
      },
      async deleteDish(id) {
        await runMutation(() => dishesApi.deleteDish(id), [loadDishes, loadMealGroups, loadDishProducts]);
      },
      async createProduct(payload) {
        await runMutation(() => productsApi.createProduct(payload), [loadProducts]);
      },
      async updateProduct(id, payload) {
        await runMutation(() => productsApi.updateProduct(id, payload), [loadProducts]);
      },
      async deleteProduct(id) {
        await runMutation(() => productsApi.deleteProduct(id), [loadProducts, loadDishes, loadDishProducts]);
      },
      async createMealGroup(payload) {
        await runMutation(() => mealGroupsApi.createMealGroup(payload), [loadMealGroups]);
      },
      async updateMealGroup(id, payload) {
        await runMutation(() => mealGroupsApi.updateMealGroup(id, payload), [loadMealGroups]);
      },
      async deleteMealGroup(id) {
        await runMutation(() => mealGroupsApi.deleteMealGroup(id), [loadMealGroups, loadMealGroupDishes]);
      },
      async createDishProduct(payload) {
        await runMutation(() => dishProductsApi.createDishProduct(payload), [loadDishProducts, loadDishes]);
      },
      async updateDishProduct(dishId, productId, payload) {
        await runMutation(
          () => dishProductsApi.updateDishProduct(dishId, productId, payload),
          [loadDishProducts, loadDishes],
        );
      },
      async deleteDishProduct(dishId, productId) {
        await runMutation(
          () => dishProductsApi.deleteDishProduct(dishId, productId),
          [loadDishProducts, loadDishes],
        );
      },
      async createMealGroupDish(payload) {
        await runMutation(
          () => mealGroupDishesApi.createMealGroupDish(payload),
          [loadMealGroupDishes, loadMealGroups, loadDishes],
        );
      },
      async updateMealGroupDish(mealGroupId, dishId, payload) {
        await runMutation(
          () => mealGroupDishesApi.updateMealGroupDish(mealGroupId, dishId, payload),
          [loadMealGroupDishes, loadMealGroups, loadDishes],
        );
      },
      async deleteMealGroupDish(mealGroupId, dishId) {
        await runMutation(
          () => mealGroupDishesApi.deleteMealGroupDish(mealGroupId, dishId),
          [loadMealGroupDishes, loadMealGroups, loadDishes],
        );
      },
    }),
    [
      clearError,
      dishProducts,
      dishes,
      error,
      initialLoading,
      isMutating,
      loadAll,
      loadDishProducts,
      loadDishes,
      loadMealGroupDishes,
      loadMealGroups,
      loadProducts,
      mealGroupDishes,
      mealGroups,
      products,
      runMutation,
    ],
  );

  return value;
};

