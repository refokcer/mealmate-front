import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { FormField, SelectInput, TextInput } from '../components/forms/FormField';
import { Tag } from '../components/common/Tag';
import { EmptyState } from '../components/common/EmptyState';

const defaultDish = {
  name: '',
  description: '',
  instructions: '',
  preparationMinutes: '',
  imageUrl: '',
};

const defaultIngredient = {
  dishId: null,
  productId: '',
  quantity: '',
  isDraft: false,
};

export const DishesPage = ({
  dishes,
  products,
  mealGroups,
  createDish,
  updateDish,
  deleteDish,
  createDishProduct,
  updateDishProduct,
  deleteDishProduct,
  createMealGroupDish,
  deleteMealGroupDish,
  isMutating,
}) => {
  const [isDishModalOpen, setDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [dishForm, setDishForm] = useState(defaultDish);
  const [dishErrors, setDishErrors] = useState({});
  const [pendingIngredients, setPendingIngredients] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [groupSelectValue, setGroupSelectValue] = useState('');

  const [isIngredientModalOpen, setIngredientModalOpen] = useState(false);
  const [ingredientForm, setIngredientForm] = useState(defaultIngredient);
  const [editingIngredient, setEditingIngredient] = useState(null);

  const productOptions = useMemo(
    () => products.map((product) => ({ label: product.name, value: String(product.id) })),
    [products],
  );

  const productNameMap = useMemo(() => {
    const map = new Map();

    products.forEach((product) => {
      map.set(product.id, product.name);
    });

    return map;
  }, [products]);

  const groupOptions = useMemo(
    () => mealGroups.map((group) => ({ label: group.name, value: String(group.id) })),
    [mealGroups],
  );

  const dishGroupMap = useMemo(() => {
    const map = new Map();

    mealGroups.forEach((group) => {
      (group.dishes ?? []).forEach((item) => {
        const current = map.get(item.dishId) ?? [];
        map.set(item.dishId, [...current, group.id]);
      });
    });

    return map;
  }, [mealGroups]);

  useEffect(() => {
    if (!editingDish) {
      return;
    }

    const updatedDish = dishes.find((item) => item.id === editingDish.id);
    if (updatedDish && updatedDish !== editingDish) {
      setEditingDish(updatedDish);
    }
  }, [dishes, editingDish]);

  const openCreateDishModal = () => {
    setEditingDish(null);
    setDishForm(defaultDish);
    setDishErrors({});
    setPendingIngredients([]);
    setSelectedGroupIds([]);
    setGroupSelectValue('');
    setDishModalOpen(true);
  };

  const openEditDishModal = (dish) => {
    setEditingDish(dish);
    setDishForm({
      name: dish.name ?? '',
      description: dish.description ?? '',
      instructions: dish.instructions ?? '',
      preparationMinutes: dish.preparationMinutes ?? '',
      imageUrl: dish.imageUrl ?? '',
    });
    setDishErrors({});
    setPendingIngredients([]);
    setSelectedGroupIds([...(dishGroupMap.get(dish.id) ?? [])]);
    setGroupSelectValue('');
    setDishModalOpen(true);
  };

  const closeDishModal = () => {
    setDishModalOpen(false);
    setEditingDish(null);
    setDishForm(defaultDish);
    setPendingIngredients([]);
    setSelectedGroupIds([]);
    setGroupSelectValue('');
  };

  const submitDish = async () => {
    if (!dishForm.name.trim()) {
      setDishErrors({ name: 'Название обязательно' });
      return;
    }

    const payload = {
      name: dishForm.name.trim(),
      description: dishForm.description.trim() || null,
      instructions: dishForm.instructions.trim() || null,
      preparationMinutes: dishForm.preparationMinutes
        ? Number(dishForm.preparationMinutes)
        : null,
      imageUrl: dishForm.imageUrl.trim() || null,
    };

    let dishId = editingDish?.id ?? null;

    if (editingDish) {
      await updateDish(editingDish.id, payload);
    } else {
      const createdDish = await createDish(payload);
      dishId = createdDish?.id ?? null;
    }

    if (!dishId) {
      closeDishModal();
      return;
    }

    if (!editingDish && pendingIngredients.length) {
      for (const ingredient of pendingIngredients) {
        await createDishProduct({
          dishId,
          productId: ingredient.productId,
          quantity: ingredient.quantity ? String(ingredient.quantity) : null,
        });
      }
    }

    const previousGroupIds = editingDish ? dishGroupMap.get(dishId) ?? [] : [];
    const groupsToAdd = selectedGroupIds.filter((groupId) => !previousGroupIds.includes(groupId));
    const groupsToRemove = previousGroupIds.filter((groupId) => !selectedGroupIds.includes(groupId));

    for (const groupId of groupsToAdd) {
      await createMealGroupDish({ mealGroupId: groupId, dishId });
    }

    for (const groupId of groupsToRemove) {
      await deleteMealGroupDish(groupId, dishId);
    }

    closeDishModal();
  };

  const openIngredientModal = (dish, ingredient) => {
    const isDraft = !dish;

    setEditingIngredient(
      ingredient
        ? {
            ...ingredient,
            isDraft,
          }
        : null,
    );
    setIngredientForm({
      dishId: dish?.id ?? null,
      productId: ingredient ? String(ingredient.productId) : '',
      quantity: ingredient?.quantity ?? '',
      isDraft,
    });
    setIngredientModalOpen(true);
  };

  const closeIngredientModal = () => {
    setIngredientForm(defaultIngredient);
    setEditingIngredient(null);
    setIngredientModalOpen(false);
  };

  const submitIngredient = async () => {
    if (!ingredientForm.productId) {
      return;
    }

    const productId = Number(ingredientForm.productId);
    const normalizedQuantity = ingredientForm.quantity?.trim() ?? '';

    if (ingredientForm.isDraft || !ingredientForm.dishId) {
      if (editingIngredient) {
        setPendingIngredients((items) =>
          items.map((item) =>
            item.productId === editingIngredient.productId
              ? { productId, quantity: normalizedQuantity }
              : item,
          ),
        );
      } else {
        setPendingIngredients((items) => [...items, { productId, quantity: normalizedQuantity }]);
      }

      closeIngredientModal();
      return;
    }

    const payload = {
      dishId: Number(ingredientForm.dishId),
      productId,
      quantity: normalizedQuantity ? normalizedQuantity : null,
    };

    if (editingIngredient) {
      await updateDishProduct(payload.dishId, editingIngredient.productId, {
        quantity: payload.quantity,
      });
    } else {
      await createDishProduct(payload);
    }

    closeIngredientModal();
  };

  const handleDeleteIngredient = async (dishId, productId) => {
    await deleteDishProduct(dishId, productId);
  };

  const handleDeleteDraftIngredient = (productId) => {
    setPendingIngredients((items) => items.filter((item) => item.productId !== productId));
  };

  const handleAddGroupSelection = () => {
    if (!groupSelectValue) {
      return;
    }

    const groupId = Number(groupSelectValue);

    setSelectedGroupIds((items) => {
      if (items.includes(groupId)) {
        return items;
      }

      return [...items, groupId];
    });

    setGroupSelectValue('');
  };

  const handleRemoveGroupSelection = (groupId) => {
    setSelectedGroupIds((items) => items.filter((id) => id !== groupId));
  };

  const availableProducts = useMemo(() => {
    const usedProductIds = new Set();

    if (ingredientForm.isDraft || !ingredientForm.dishId) {
      pendingIngredients.forEach((item) => {
        usedProductIds.add(item.productId);
      });

      if (editingIngredient?.isDraft) {
        usedProductIds.delete(editingIngredient.productId);
      }
    } else {
      const dish = dishes.find((item) => item.id === ingredientForm.dishId);

      dish?.products?.forEach((product) => {
        usedProductIds.add(product.productId);
      });

      if (editingIngredient && !editingIngredient.isDraft) {
        usedProductIds.delete(editingIngredient.productId);
      }
    }

    if (!usedProductIds.size) {
      return productOptions;
    }

    return productOptions.filter((option) => !usedProductIds.has(Number(option.value)));
  }, [
    dishes,
    editingIngredient,
    ingredientForm.dishId,
    ingredientForm.isDraft,
    pendingIngredients,
    productOptions,
  ]);

  const availableGroupOptions = useMemo(
    () => groupOptions.filter((option) => !selectedGroupIds.includes(Number(option.value))),
    [groupOptions, selectedGroupIds],
  );

  const isExistingDish = Boolean(editingDish);
  const modalIngredients = isExistingDish
    ? editingDish?.products ?? []
    : pendingIngredients;
  const disableIngredientActions = isExistingDish && isMutating;
  const disableGroupActions = isExistingDish && isMutating;

  return (
    <div className="page">
      <div className="page__header">
        <h2 className="page__title">Блюда</h2>
        <Button onClick={openCreateDishModal}>Новое блюдо</Button>
      </div>

      {dishes.length === 0 ? (
        <EmptyState
          title="Список блюд пуст"
          description="Добавьте любимые рецепты и планируйте меню в один клик."
          action={<Button onClick={openCreateDishModal}>Добавить блюдо</Button>}
        />
      ) : (
        <div className="stack">
          {dishes.map((dish) => (
            <Card key={dish.id} className="dish-card">
              <CardHeader
                title={dish.name}
                subtitle={dish.description}
                endSlot={
                  <div className="card-action-buttons">
                    <Button variant="ghost" onClick={() => openEditDishModal(dish)}>
                      Редактировать
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => deleteDish(dish.id)}
                      disabled={isMutating}
                    >
                      Удалить
                    </Button>
                  </div>
                }
              />

              <CardContent>
                <div className="dish-card__info">
                  {dish.instructions ? (
                    <p className="multiline">{dish.instructions}</p>
                  ) : (
                    <p className="muted">Нет инструкций по приготовлению</p>
                  )}

                  <div className="dish-card__meta">
                    {dish.preparationMinutes ? (
                      <span className="dish-card__meta-time">{dish.preparationMinutes} мин.</span>
                    ) : (
                      <span className="muted">Время готовки не указано</span>
                    )}
                  </div>
                </div>

                <div className="dish-card__ingredients">
                  <div className="section-header">
                    <h3>Ингредиенты</h3>
                    <Button variant="ghost" onClick={() => openIngredientModal(dish)}>
                      Добавить
                    </Button>
                  </div>
                  {dish.products?.length ? (
                    <div className="ingredient-tag-list">
                      {dish.products.map((product) => (
                        <Tag key={product.productId}>
                          <span className="ingredient-tag__name">{product.productName}</span>
                          {product.quantity && (
                            <span className="ingredient-tag__quantity">{product.quantity}</span>
                          )}
                        </Tag>
                      ))}
                    </div>
                  ) : (
                    <p className="muted">Ингредиенты ещё не добавлены</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={isDishModalOpen}
        title={editingDish ? 'Редактирование блюда' : 'Новое блюдо'}
        onClose={closeDishModal}
        footer={
          <>
            <Button variant="ghost" onClick={closeDishModal} disabled={isMutating}>
              Отмена
            </Button>
            <Button onClick={submitDish} disabled={isMutating}>
              {editingDish ? 'Сохранить' : 'Добавить'}
            </Button>
          </>
        }
      >
        <FormField label="Название" error={dishErrors.name}>
          <TextInput
            value={dishForm.name}
            onChange={(event) => setDishForm((state) => ({ ...state, name: event.target.value }))}
            placeholder="Например, Омлет с овощами"
          />
        </FormField>

        <FormField label="Описание">
          <TextInput
            multiline
            rows={3}
            value={dishForm.description}
            onChange={(event) => setDishForm((state) => ({ ...state, description: event.target.value }))}
            placeholder="Небольшое описание вкуса или подачи"
          />
        </FormField>

        <FormField label="Инструкции">
          <TextInput
            multiline
            rows={5}
            value={dishForm.instructions}
            onChange={(event) => setDishForm((state) => ({ ...state, instructions: event.target.value }))}
            placeholder="Шаги приготовления"
          />
        </FormField>

        <FormField label="Время приготовления (мин)" hint="Если блюдо готовится быстро — отметьте это!">
          <TextInput
            type="number"
            min="0"
            value={dishForm.preparationMinutes}
            onChange={(event) => setDishForm((state) => ({ ...state, preparationMinutes: event.target.value }))}
            placeholder="15"
          />
        </FormField>

        <FormField label="Ссылка на изображение" hint="Добавьте красивую картинку">
          <TextInput
            type="url"
            value={dishForm.imageUrl}
            onChange={(event) => setDishForm((state) => ({ ...state, imageUrl: event.target.value }))}
            placeholder="https://..."
          />
        </FormField>

        <div className="dish-card__ingredients">
          <div className="section-header">
            <h3>Ингредиенты</h3>
            <Button
              variant="ghost"
              onClick={() => openIngredientModal(isExistingDish ? editingDish : null)}
              disabled={disableIngredientActions}
            >
              Добавить
            </Button>
          </div>

          {modalIngredients.length ? (
            <ul className="ingredient-list">
              {modalIngredients.map((ingredient) => {
                const productId = ingredient.productId;
                const name = isExistingDish
                  ? ingredient.productName
                  : productNameMap.get(ingredient.productId) ?? 'Неизвестный продукт';
                const quantity = ingredient.quantity;

                return (
                  <li key={productId} className="ingredient-list__item">
                    <div>
                      <strong>{name}</strong>
                      {quantity && <p className="muted">{quantity}</p>}
                    </div>
                    <div className="ingredient-list__actions">
                      <Button
                        variant="ghost"
                        onClick={() =>
                          openIngredientModal(isExistingDish ? editingDish : null, ingredient)
                        }
                        disabled={disableIngredientActions}
                      >
                        Изменить
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() =>
                          isExistingDish
                            ? handleDeleteIngredient(editingDish.id, productId)
                            : handleDeleteDraftIngredient(productId)
                        }
                        disabled={disableIngredientActions}
                      >
                        Удалить
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="muted">Ингредиенты ещё не добавлены</p>
          )}
        </div>

        <div className="dish-card__ingredients">
          <div className="section-header">
            <h3>Наборы</h3>
          </div>

          {selectedGroupIds.length ? (
            <ul className="chip-list">
              {selectedGroupIds.map((groupId) => {
                const group = mealGroups.find((item) => item.id === groupId);

                return (
                  <li key={groupId} className="chip-list__item">
                    <Tag tone="accent">{group?.name ?? 'Без названия'}</Tag>
                    <button
                      type="button"
                      className="chip-list__remove"
                      onClick={() => handleRemoveGroupSelection(groupId)}
                      aria-label={`Убрать набор ${group?.name ?? ''}`}
                      disabled={disableGroupActions}
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="muted">Наборы ещё не выбраны</p>
          )}

          <div className="group-selector">
            <SelectInput
              value={groupSelectValue}
              onChange={(event) => setGroupSelectValue(event.target.value)}
              options={availableGroupOptions}
              disabled={availableGroupOptions.length === 0 || disableGroupActions}
              placeholder={
                availableGroupOptions.length
                  ? 'Выберите набор'
                  : groupOptions.length
                  ? 'Все наборы уже добавлены'
                  : 'Наборы ещё не созданы'
              }
            />
            <Button
              onClick={handleAddGroupSelection}
              disabled={!groupSelectValue || disableGroupActions}
              variant="ghost"
            >
              Добавить
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={isIngredientModalOpen}
        title={editingIngredient ? 'Изменить ингредиент' : 'Добавить ингредиент'}
        onClose={closeIngredientModal}
        footer={
          <>
            <Button variant="ghost" onClick={closeIngredientModal} disabled={isMutating}>
              Отмена
            </Button>
            <Button onClick={submitIngredient} disabled={!ingredientForm.productId || isMutating}>
              {editingIngredient ? 'Сохранить' : 'Добавить'}
            </Button>
          </>
        }
      >
        <FormField label="Продукт">
          <SelectInput
            value={ingredientForm.productId}
            onChange={(event) =>
              setIngredientForm((state) => ({ ...state, productId: event.target.value }))
            }
            options={availableProducts}
            disabled={availableProducts.length === 0}
            placeholder={availableProducts.length ? 'Выберите продукт' : 'Нет доступных продуктов'}
          />
        </FormField>

        <FormField label="Количество" hint="Например, 2 яйца или 150 г">
          <TextInput
            value={ingredientForm.quantity}
            onChange={(event) => setIngredientForm((state) => ({ ...state, quantity: event.target.value }))}
            placeholder="Количество ингредиента"
          />
        </FormField>
      </Modal>
    </div>
  );
};

