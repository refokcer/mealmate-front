import { useState } from 'react';
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

  return (
    <div className="page">
      <div className="page__header">
        <h2 className="page__title">Продукты</h2>
        <Button onClick={openCreateModal}>Новый продукт</Button>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="Список продуктов пуст"
          description="Добавьте продукты из холодильника и создавайте блюда быстрее."
          action={<Button onClick={openCreateModal}>Добавить продукт</Button>}
        />
      ) : (
        <div className="stack">
          {products.map((product) => (
            <Card key={product.id} className="product-card">
              <CardHeader
                title={product.name}
                subtitle={product.category}
                endSlot={
                  <div className="card-action-buttons">
                    <Button variant="ghost" onClick={() => openEditModal(product)}>
                      Редактировать
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => deleteProduct(product.id)}
                      disabled={isMutating}
                    >
                      Удалить
                    </Button>
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

