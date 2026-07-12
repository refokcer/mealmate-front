import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { FormField, SelectInput, TextInput } from '../components/forms/FormField';
import { Tag } from '../components/common/Tag';

const formatQuantity = (quantity, unit) => {
  if (quantity === null || quantity === undefined || quantity === '') {
    return unit || '';
  }

  return `${Number(quantity).toLocaleString('ru-RU')} ${unit || ''}`.trim();
};

const buildShoppingItemsFromDishes = (selectedDishes) => {
  const map = new Map();

  selectedDishes.forEach((dish) => {
    (dish.products ?? []).forEach((product) => {
      const current = map.get(product.productId) ?? {
        productId: product.productId,
        productName: product.productName,
        unit: product.unit,
        quantity: 0,
        dishes: [],
      };

      current.quantity += Number(product.quantity ?? 0);
      current.dishes.push(dish.name);
      map.set(product.productId, current);
    });
  });

  return [...map.values()].sort((a, b) => a.productName.localeCompare(b.productName, 'ru'));
};

const ConfirmModal = ({ confirmation, onCancel, onConfirm, isMutating }) => (
  <Modal
    open={Boolean(confirmation)}
    title={confirmation?.title ?? ''}
    onClose={onCancel}
    footer={
      <>
        <Button variant="ghost" onClick={onCancel} disabled={isMutating}>
          Отмена
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isMutating}>
          Подтвердить
        </Button>
      </>
    }
  >
    <p className="muted">{confirmation?.message}</p>
  </Modal>
);

export const ShoppingPage = ({
  dishes,
  mealGroups,
  products,
  shoppingList,
  baseShoppingProducts,
  saveShoppingList,
  updateShoppingListItem,
  deleteShoppingListItem,
  clearShoppingList,
  addBaseProductsToShoppingList,
  createBaseShoppingProduct,
  deleteBaseShoppingProduct,
  isMutating,
}) => {
  const [mode, setMode] = useState('list');
  const [selectedDishIds, setSelectedDishIds] = useState([]);
  const [baseProductForm, setBaseProductForm] = useState({ productId: '', quantity: '' });
  const [manualProductForm, setManualProductForm] = useState({ productId: '', quantity: '' });
  const [confirmation, setConfirmation] = useState(null);
  const [swipedItemId, setSwipedItemId] = useState(null);
  const [swipeStartX, setSwipeStartX] = useState(null);

  const productOptions = useMemo(
    () => products.map((product) => ({ label: `${product.name} (${product.unit})`, value: String(product.id) })),
    [products],
  );

  const productMap = useMemo(() => {
    const map = new Map();
    products.forEach((product) => map.set(product.id, product));
    return map;
  }, [products]);

  const selectedDishes = useMemo(
    () => dishes.filter((dish) => selectedDishIds.includes(dish.id)),
    [dishes, selectedDishIds],
  );

  const groupedDishes = useMemo(() => {
    const usedDishIds = new Set();
    const groups = mealGroups.map((group) => {
      const groupDishIds = new Set((group.dishes ?? []).map((item) => item.dishId));
      const groupDishes = dishes.filter((dish) => groupDishIds.has(dish.id));
      groupDishes.forEach((dish) => usedDishIds.add(dish.id));

      return {
        id: `group-${group.id}`,
        name: group.name,
        dishes: groupDishes,
      };
    }).filter((group) => group.dishes.length > 0);

    const uncategorized = dishes.filter((dish) => !usedDishIds.has(dish.id));
    if (uncategorized.length > 0) {
      groups.push({ id: 'uncategorized', name: 'Без категории', dishes: uncategorized });
    }

    return groups;
  }, [dishes, mealGroups]);

  const sortedShoppingList = useMemo(
    () =>
      [...shoppingList].sort((a, b) => {
        if (a.isChecked !== b.isChecked) {
          return a.isChecked ? 1 : -1;
        }

        return a.productName.localeCompare(b.productName, 'ru');
      }),
    [shoppingList],
  );

  const hasSavedList = shoppingList.length > 0;

  const openMode = (nextMode) => {
    setMode(nextMode);

    if (nextMode !== 'generator') {
      setSelectedDishIds([]);
    }
  };

  const toggleDishSelection = (dishId) => {
    setSelectedDishIds((ids) =>
      ids.includes(dishId) ? ids.filter((id) => id !== dishId) : [...ids, dishId],
    );
  };

  const handleSwipeStart = (event) => {
    setSwipeStartX(event.clientX);
  };

  const handleSwipeEnd = (event, itemId) => {
    if (swipeStartX === null) {
      return;
    }

    const deltaX = event.clientX - swipeStartX;
    if (deltaX < -36) {
      setSwipedItemId(itemId);
    } else if (deltaX > 24 || Math.abs(deltaX) < 8) {
      setSwipedItemId((current) => (current === itemId ? null : current));
    }

    setSwipeStartX(null);
  };

  const generateList = async () => {
    const generatedItems = buildShoppingItemsFromDishes(selectedDishes);

    await saveShoppingList(
      generatedItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        isChecked: false,
        notes: item.dishes.length ? `Блюда: ${item.dishes.join(', ')}` : null,
      })),
    );
    openMode('list');
  };

  const askConfirmation = (config) => setConfirmation(config);

  const confirmAction = async () => {
    if (!confirmation?.action) {
      setConfirmation(null);
      return;
    }

    await confirmation.action();
    setConfirmation(null);
  };

  const handleClearList = () => {
    askConfirmation({
      title: 'Сброс списка',
      message: 'Текущий список покупок будет очищен. Продолжить?',
      action: async () => {
        await clearShoppingList();
        setSelectedDishIds([]);
      },
    });
  };

  const deleteShoppingItem = (item) => {
    askConfirmation({
      title: 'Удаление продукта',
      message: `Удалить "${item.productName}" из списка покупок?`,
      action: () => deleteShoppingListItem(item.id),
    });
  };

  const deleteBaseProduct = (item) => {
    askConfirmation({
      title: 'Удаление базового продукта',
      message: `Удалить "${item.productName}" из базовых покупок?`,
      action: () => deleteBaseShoppingProduct(item.id),
    });
  };

  const addBaseProduct = async () => {
    if (!baseProductForm.productId) {
      return;
    }

    await createBaseShoppingProduct({
      productId: Number(baseProductForm.productId),
      quantity: baseProductForm.quantity === '' ? null : Number(baseProductForm.quantity),
    });
    setBaseProductForm({ productId: '', quantity: '' });
  };

  const addManualProduct = async () => {
    if (!manualProductForm.productId) {
      return;
    }

    const item = productMap.get(Number(manualProductForm.productId));
    const nextItems = [
      ...shoppingList.map((shoppingItem) => ({
        productId: shoppingItem.productId,
        quantity: shoppingItem.quantity,
        isChecked: shoppingItem.isChecked,
        notes: shoppingItem.notes,
      })),
      {
        productId: Number(manualProductForm.productId),
        quantity: manualProductForm.quantity === '' ? null : Number(manualProductForm.quantity),
        isChecked: false,
        notes: item ? 'Добавлено вручную' : null,
      },
    ];

    await saveShoppingList(nextItems);
    setManualProductForm({ productId: '', quantity: '' });
  };

  const renderGenerator = () => (
    <Card className="shopping-generator">
      <CardHeader
        title="Сформировать список"
        subtitle="Выберите блюда по категориям, MealMate посчитает суммарное количество продуктов."
      />
      <CardContent>
        {dishes.length ? (
          <>
            <div className="shopping-category-list">
              {groupedDishes.map((group) => (
                <section key={group.id} className="shopping-category">
                  <div className="section-header">
                    <h3>{group.name}</h3>
                    <span className="muted">{group.dishes.length}</span>
                  </div>
                  <div className="shopping-dish-grid">
                    {group.dishes.map((dish) => {
                      const selected = selectedDishIds.includes(dish.id);

                      return (
                        <button
                          key={`${group.id}-${dish.id}`}
                          type="button"
                          className={selected ? 'shopping-dish-card shopping-dish-card--selected' : 'shopping-dish-card'}
                          onClick={() => toggleDishSelection(dish.id)}
                        >
                          <span>{dish.name}</span>
                          <span>{selected ? 'Выбрано' : 'Выбрать'}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            <div className="shopping-generator__actions">
              <Button onClick={generateList} disabled={selectedDishIds.length === 0 || isMutating}>
                Сгенерировать
              </Button>
              <Button variant="ghost" onClick={() => setSelectedDishIds([])} disabled={selectedDishIds.length === 0}>
                Очистить выбор
              </Button>
            </div>
          </>
        ) : (
          <EmptyState title="Блюд пока нет" description="Добавьте блюда и ингредиенты, чтобы собрать список покупок." />
        )}

      </CardContent>
    </Card>
  );

  const renderCurrentList = () => {
    if (!hasSavedList) {
      return (
        <EmptyState
          title="Список покупок пуст"
          description="Нажмите «Сформировать список», выберите блюда и сохраните список покупок."
          action={<Button onClick={() => openMode('generator')}>Сформировать список</Button>}
        />
      );
    }

    return (
      <Card className="shopping-current">
        <CardHeader title="Текущий список" subtitle={`${shoppingList.length} позиций`} />
        <CardContent>
          <ul className="shopping-list">
            {sortedShoppingList.map((item) => (
              <li
                key={item.id}
                className={[
                  'shopping-list__item',
                  'shopping-list__item--swipe',
                  item.isChecked ? 'shopping-list__item--checked' : '',
                  swipedItemId === item.id ? 'shopping-list__item--revealed' : '',
                ].filter(Boolean).join(' ')}
                onPointerDown={handleSwipeStart}
                onPointerUp={(event) => handleSwipeEnd(event, item.id)}
                onPointerCancel={() => setSwipeStartX(null)}
              >
                <div className="shopping-list__delete-action">
                  <Button variant="danger" onClick={() => deleteShoppingItem(item)} disabled={isMutating}>
                    Удалить
                  </Button>
                </div>
                <div className="shopping-list__item-content">
                  <label className="shopping-check">
                    <input
                      type="checkbox"
                      checked={item.isChecked}
                      onChange={(event) =>
                        updateShoppingListItem(item.id, {
                          quantity: item.quantity,
                          isChecked: event.target.checked,
                          notes: item.notes,
                        })
                      }
                    />
                    <span className="shopping-list__text">
                      <span className="shopping-list__main-line">
                        <strong>{item.productName}</strong>
                        <Tag tone="accent">{formatQuantity(item.quantity, item.unit)}</Tag>
                      </span>
                      {item.notes && <span className="shopping-list__note">{item.notes}</span>}
                    </span>
                  </label>
                </div>
              </li>
            ))}
          </ul>

          <div className="shopping-inline-form">
            <SelectInput
              value={manualProductForm.productId}
              onChange={(event) => setManualProductForm((state) => ({ ...state, productId: event.target.value }))}
              options={productOptions}
              placeholder="Добавить продукт"
            />
            <TextInput
              type="number"
              min="0"
              step="0.01"
              value={manualProductForm.quantity}
              onChange={(event) => setManualProductForm((state) => ({ ...state, quantity: event.target.value }))}
              placeholder="Кол-во"
            />
            <Button onClick={addManualProduct} disabled={!manualProductForm.productId || isMutating}>
              Добавить
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderBaseSettings = () => (
    <Card className="shopping-base">
      <CardHeader
        title="Базовые покупки"
        subtitle="Продукты, которые часто нужны независимо от выбранных блюд."
      />
      <CardContent>
        <div className="shopping-inline-form">
          <FormField label="Продукт">
            <SelectInput
              value={baseProductForm.productId}
              onChange={(event) => setBaseProductForm((state) => ({ ...state, productId: event.target.value }))}
              options={productOptions.filter(
                (option) => !baseShoppingProducts.some((item) => String(item.productId) === option.value),
              )}
              placeholder="Выберите продукт"
            />
          </FormField>
          <FormField label="Количество">
            <TextInput
              type="number"
              min="0"
              step="0.01"
              value={baseProductForm.quantity}
              onChange={(event) => setBaseProductForm((state) => ({ ...state, quantity: event.target.value }))}
              placeholder="1"
            />
          </FormField>
          <Button onClick={addBaseProduct} disabled={!baseProductForm.productId || isMutating}>
            Добавить в базовые
          </Button>
        </div>

        {baseShoppingProducts.length ? (
          <ul className="shopping-base-list">
            {baseShoppingProducts.map((item) => (
              <li key={item.id} className="shopping-base-list__item">
                <span>
                  <strong>{item.productName}</strong>
                  <span className="muted">{formatQuantity(item.quantity, item.unit)}</span>
                </span>
                <Button variant="ghost" onClick={() => deleteBaseProduct(item)} disabled={isMutating}>
                  Удалить
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Базовые продукты ещё не настроены.</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="page shopping-page">
      <div className="page__header">
        <div>
          <h2 className="page__title">Список покупок</h2>
          <p className="muted">Сначала работайте с текущим списком. Формирование из блюд и базовые настройки открываются отдельно.</p>
        </div>
        <div className="card-action-buttons">
          {mode === 'list' ? (
            <>
              <Button onClick={() => openMode('generator')}>Сформировать список</Button>
              <Button variant="ghost" onClick={() => openMode('base')}>Настроить базовые</Button>
              <Button variant="ghost" onClick={addBaseProductsToShoppingList} disabled={isMutating || baseShoppingProducts.length === 0}>
                Добавить базовые
              </Button>
              {hasSavedList && (
                <Button variant="danger" onClick={handleClearList} disabled={isMutating}>
                  Сбросить список
                </Button>
              )}
            </>
          ) : (
            <Button variant="ghost" onClick={() => openMode('list')}>
              Назад к списку
            </Button>
          )}
        </div>
      </div>

      {mode === 'generator' ? renderGenerator() : mode === 'base' ? renderBaseSettings() : renderCurrentList()}

      <ConfirmModal
        confirmation={confirmation}
        onCancel={() => setConfirmation(null)}
        onConfirm={confirmAction}
        isMutating={isMutating}
      />
    </div>
  );
};
