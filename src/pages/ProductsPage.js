import { useMemo, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { FormField, TextInput } from '../components/forms/FormField';
import { Tag } from '../components/common/Tag';
import { EmptyState } from '../components/common/EmptyState';

const defaultProduct = {
  name: '',
  category: '',
  notes: '',
};

export const ProductsPage = ({ products, createProduct, updateProduct, deleteProduct, isMutating }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(defaultProduct);
  const [productErrors, setProductErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [openActionMenuId, setOpenActionMenuId] = useState(null);

  const openCreateModal = () => {
    setEditingProduct(null);
    setProductForm(defaultProduct);
    setProductErrors({});
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name ?? '',
      category: product.category ?? '',
      notes: product.notes ?? '',
    });
    setProductErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    setProductForm(defaultProduct);
  };

  const submitProduct = async () => {
    if (!productForm.name.trim()) {
      setProductErrors({ name: 'Название обязательно' });
      return;
    }

    const payload = {
      name: productForm.name.trim(),
      category: productForm.category.trim() || null,
      notes: productForm.notes.trim() || null,
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, payload);
    } else {
      await createProduct(payload);
    }

    closeModal();
  };

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = useMemo(() => {
    if (!normalizedSearchQuery) {
      return products;
    }

    return products.filter((product) => {
      const name = product.name?.toLowerCase() ?? '';
      const category = product.category?.toLowerCase() ?? '';
      const notes = product.notes?.toLowerCase() ?? '';
      const dishes = (product.dishes ?? []).map((item) => item.dishName?.toLowerCase() ?? '');

      return (
        name.includes(normalizedSearchQuery) ||
        category.includes(normalizedSearchQuery) ||
        notes.includes(normalizedSearchQuery) ||
        dishes.some((dishName) => dishName.includes(normalizedSearchQuery))
      );
    });
  }, [products, normalizedSearchQuery]);

  const toggleActionMenu = (productId) => {
    setOpenActionMenuId((current) => (current === productId ? null : productId));
  };

  const closeActionMenu = () => setOpenActionMenuId(null);

  return (
    <div className="page">
      <div className="page__header">
        <h2 className="page__title">Продукты</h2>
        <Button onClick={openCreateModal}>Новый продукт</Button>
      </div>

      {products.length > 0 && (
        <div className="page__filters">
          <TextInput
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Поиск по названию, категории или блюду"
            aria-label="Поиск по продуктам"
          />
        </div>
      )}

      {products.length === 0 ? (
        <EmptyState
          title="Список продуктов пуст"
          description="Добавьте продукты из холодильника и создавайте блюда быстрее."
          action={<Button onClick={openCreateModal}>Добавить продукт</Button>}
        />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="Продукты не найдены"
          description="Не удалось найти продукты по этому запросу. Попробуйте изменить поисковый текст."
          action={
            <Button variant="ghost" onClick={() => setSearchQuery('')}>
              Сбросить поиск
            </Button>
          }
        />
      ) : (
        <div className="stack">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="product-card">
              <CardHeader
                title={product.name}
                subtitle={product.category}
                endSlot={
                  <div className="product-card__actions" onClick={(event) => event.stopPropagation()}>
                    <Button
                      variant="ghost"
                      className="icon-button"
                      onClick={() => toggleActionMenu(product.id)}
                      aria-label={`Действия с продуктом ${product.name}`}
                    >
                      ⚙️
                    </Button>
                    {openActionMenuId === product.id && (
                      <div className="product-card__menu" role="menu">
                        <button
                          type="button"
                          className="product-card__menu-item"
                          onClick={() => {
                            closeActionMenu();
                            openEditModal(product);
                          }}
                        >
                          Редактировать
                        </button>
                        <button
                          type="button"
                          className="product-card__menu-item product-card__menu-item--danger"
                          onClick={() => {
                            closeActionMenu();
                            deleteProduct(product.id);
                          }}
                          disabled={isMutating}
                        >
                          Удалить
                        </button>
                      </div>
                    )}
                  </div>
                }
              />

              <CardContent>
                {product.notes ? <p className="multiline">{product.notes}</p> : <p className="muted">Нет заметок</p>}

                <div className="product-card__dishes">
                  <div className="section-header">
                    <h3>Используется в блюдах</h3>
                  </div>
                  {product.dishes?.length ? (
                    <ul className="chip-list">
                      {product.dishes.map((dish) => (
                        <li key={dish.dishId} className="chip-list__item chip-list__item--static">
                          <Tag tone="accent">{dish.dishName}</Tag>
                          {dish.quantity && <span className="muted">{dish.quantity}</span>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">Пока не используется ни в одном блюде</p>
                  )}
                </div>
              </CardContent>

              <CardFooter />
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={isModalOpen}
        title={editingProduct ? 'Редактирование продукта' : 'Новый продукт'}
        onClose={closeModal}
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} disabled={isMutating}>
              Отмена
            </Button>
            <Button onClick={submitProduct} disabled={isMutating}>
              {editingProduct ? 'Сохранить' : 'Добавить'}
            </Button>
          </>
        }
      >
        <FormField label="Название" error={productErrors.name}>
          <TextInput
            value={productForm.name}
            onChange={(event) => setProductForm((state) => ({ ...state, name: event.target.value }))}
            placeholder="Например, Авокадо"
          />
        </FormField>

        <FormField label="Категория" hint="Овощи, молочные продукты, крупы и т.д.">
          <TextInput
            value={productForm.category}
            onChange={(event) => setProductForm((state) => ({ ...state, category: event.target.value }))}
            placeholder="Категория"
          />
        </FormField>

        <FormField label="Заметки" hint="Например, производителя или срок годности">
          <TextInput
            multiline
            rows={4}
            value={productForm.notes}
            onChange={(event) => setProductForm((state) => ({ ...state, notes: event.target.value }))}
            placeholder="Хранить в холодильнике, использовать до пятницы"
          />
        </FormField>
      </Modal>
    </div>
  );
};

