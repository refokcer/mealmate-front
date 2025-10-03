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
};

export const DishesPage = ({
  dishes,
  products,
  createDish,
  updateDish,
  deleteDish,
  createDishProduct,
  updateDishProduct,
  deleteDishProduct,
  isMutating,
}) => {
  const [isDishModalOpen, setDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [dishForm, setDishForm] = useState(defaultDish);
  const [dishErrors, setDishErrors] = useState({});

  const [isIngredientModalOpen, setIngredientModalOpen] = useState(false);
  const [ingredientForm, setIngredientForm] = useState(defaultIngredient);
  const [editingIngredient, setEditingIngredient] = useState(null);

  const productOptions = useMemo(
    () => products.map((product) => ({ label: product.name, value: String(product.id) })),
    [products],
  );

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
    setDishModalOpen(true);
  };

  const closeDishModal = () => {
    setDishModalOpen(false);
    setEditingDish(null);
    setDishForm(defaultDish);
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

    if (editingDish) {
      await updateDish(editingDish.id, payload);
    } else {
      await createDish(payload);
    }

    closeDishModal();
  };

  const openIngredientModal = (dish, ingredient) => {
    setEditingIngredient(ingredient ?? null);
    setIngredientForm({
      dishId: dish.id,
      productId: ingredient ? String(ingredient.productId) : '',
      quantity: ingredient?.quantity ?? '',
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

    const payload = {
      dishId: Number(ingredientForm.dishId),
      productId: Number(ingredientForm.productId),
      quantity: ingredientForm.quantity ? String(ingredientForm.quantity) : null,
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

  const availableProducts = useMemo(() => {
    if (!ingredientForm.dishId) {
      return productOptions;
    }

    const dish = dishes.find((item) => item.id === ingredientForm.dishId);
    if (!dish) {
      return productOptions;
    }

    const usedProductIds = dish.products?.map((product) => product.productId) ?? [];

    if (editingIngredient) {
      return productOptions;
    }

    return productOptions.filter((option) => !usedProductIds.includes(Number(option.value)));
  }, [dishes, editingIngredient, ingredientForm.dishId, productOptions]);

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
                {dish.imageUrl && (
                  <img src={dish.imageUrl} alt="Блюдо" className="dish-card__image" loading="lazy" />
                )}
                <div className="dish-card__info">
                  {dish.preparationMinutes ? (
                    <Tag tone="warning">{dish.preparationMinutes} мин.</Tag>
                  ) : (
                    <span className="muted">Время готовки не указано</span>
                  )}

                  {dish.instructions ? (
                    <p className="multiline">{dish.instructions}</p>
                  ) : (
                    <p className="muted">Нет инструкций по приготовлению</p>
                  )}
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

        {editingDish && (
          <div className="dish-card__ingredients">
            <div className="section-header">
              <h3>Ингредиенты</h3>
              <Button variant="ghost" onClick={() => openIngredientModal(editingDish)} disabled={isMutating}>
                Добавить
              </Button>
            </div>

            {editingDish.products?.length ? (
              <ul className="ingredient-list">
                {editingDish.products.map((product) => (
                  <li key={product.productId} className="ingredient-list__item">
                    <div>
                      <strong>{product.productName}</strong>
                      {product.quantity && <p className="muted">{product.quantity}</p>}
                    </div>
                    <div className="ingredient-list__actions">
                      <Button
                        variant="ghost"
                        onClick={() => openIngredientModal(editingDish, product)}
                        disabled={isMutating}
                      >
                        Изменить
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteIngredient(editingDish.id, product.productId)}
                        disabled={isMutating}
                      >
                        Удалить
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">Ингредиенты ещё не добавлены</p>
            )}
          </div>
        )}
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

