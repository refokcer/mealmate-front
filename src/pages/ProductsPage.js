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
  unit: 'шт.',
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
      unit: product.unit ?? 'шт.',
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
    const errors = {};

    if (!productForm.name.trim()) {
      errors.name = 'Название обязательно';
    }

    if (!productForm.unit.trim()) {
      errors.unit = 'Метрика обязательна';
    }

    if (Object.keys(errors).length) {
      setProductErrors(errors);
      return;
    }

    const payload = {
      name: productForm.name.trim(),
      category: productForm.category.trim() || null,
      unit: productForm.unit.trim(),
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
        <h2 className="page__title">РџСЂРѕРґСѓРєС‚С‹</h2>
        <Button onClick={openCreateModal}>РќРѕРІС‹Р№ РїСЂРѕРґСѓРєС‚</Button>
      </div>

      {products.length > 0 && (
        <div className="page__filters">
          <TextInput
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="РџРѕРёСЃРє РїРѕ РЅР°Р·РІР°РЅРёСЋ, РєР°С‚РµРіРѕСЂРёРё РёР»Рё Р±Р»СЋРґСѓ"
            aria-label="РџРѕРёСЃРє РїРѕ РїСЂРѕРґСѓРєС‚Р°Рј"
          />
        </div>
      )}

      {products.length === 0 ? (
        <EmptyState
          title="РЎРїРёСЃРѕРє РїСЂРѕРґСѓРєС‚РѕРІ РїСѓСЃС‚"
          description="Р”РѕР±Р°РІСЊС‚Рµ РїСЂРѕРґСѓРєС‚С‹ РёР· С…РѕР»РѕРґРёР»СЊРЅРёРєР° Рё СЃРѕР·РґР°РІР°Р№С‚Рµ Р±Р»СЋРґР° Р±С‹СЃС‚СЂРµРµ."
          action={<Button onClick={openCreateModal}>Р”РѕР±Р°РІРёС‚СЊ РїСЂРѕРґСѓРєС‚</Button>}
        />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="РџСЂРѕРґСѓРєС‚С‹ РЅРµ РЅР°Р№РґРµРЅС‹"
          description="РќРµ СѓРґР°Р»РѕСЃСЊ РЅР°Р№С‚Рё РїСЂРѕРґСѓРєС‚С‹ РїРѕ СЌС‚РѕРјСѓ Р·Р°РїСЂРѕСЃСѓ. РџРѕРїСЂРѕР±СѓР№С‚Рµ РёР·РјРµРЅРёС‚СЊ РїРѕРёСЃРєРѕРІС‹Р№ С‚РµРєСЃС‚."
          action={
            <Button variant="ghost" onClick={() => setSearchQuery('')}>
              РЎР±СЂРѕСЃРёС‚СЊ РїРѕРёСЃРє
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
                      aria-label={`Р”РµР№СЃС‚РІРёСЏ СЃ РїСЂРѕРґСѓРєС‚РѕРј ${product.name}`}
                    >
                      вљ™пёЏ
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
                          Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ
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
                          РЈРґР°Р»РёС‚СЊ
                        </button>
                      </div>
                    )}
                  </div>
                }
              />

              <CardContent>
                {product.notes ? <p className="multiline">{product.notes}</p> : <p className="muted">РќРµС‚ Р·Р°РјРµС‚РѕРє</p>}
                <p className="muted">Метрика: {product.unit || 'шт.'}</p>

                <div className="product-card__dishes">
                  <div className="section-header">
                    <h3>РСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ РІ Р±Р»СЋРґР°С…</h3>
                  </div>
                  {product.dishes?.length ? (
                    <ul className="chip-list">
                      {product.dishes.map((dish) => (
                        <li key={dish.dishId} className="chip-list__item chip-list__item--static">
                          <Tag tone="accent">{dish.dishName}</Tag>
                          {dish.quantity && <span className="muted">{dish.quantity} {dish.unit || product.unit}</span>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">РџРѕРєР° РЅРµ РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ РЅРё РІ РѕРґРЅРѕРј Р±Р»СЋРґРµ</p>
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
        title={editingProduct ? 'Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ РїСЂРѕРґСѓРєС‚Р°' : 'РќРѕРІС‹Р№ РїСЂРѕРґСѓРєС‚'}
        onClose={closeModal}
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} disabled={isMutating}>
              РћС‚РјРµРЅР°
            </Button>
            <Button onClick={submitProduct} disabled={isMutating}>
              {editingProduct ? 'РЎРѕС…СЂР°РЅРёС‚СЊ' : 'Р”РѕР±Р°РІРёС‚СЊ'}
            </Button>
          </>
        }
      >
        <FormField label="РќР°Р·РІР°РЅРёРµ" error={productErrors.name}>
          <TextInput
            value={productForm.name}
            onChange={(event) => setProductForm((state) => ({ ...state, name: event.target.value }))}
            placeholder="РќР°РїСЂРёРјРµСЂ, РђРІРѕРєР°РґРѕ"
          />
        </FormField>

        <FormField label="РљР°С‚РµРіРѕСЂРёСЏ" hint="РћРІРѕС‰Рё, РјРѕР»РѕС‡РЅС‹Рµ РїСЂРѕРґСѓРєС‚С‹, РєСЂСѓРїС‹ Рё С‚.Рґ.">
          <TextInput
            value={productForm.category}
            onChange={(event) => setProductForm((state) => ({ ...state, category: event.target.value }))}
            placeholder="РљР°С‚РµРіРѕСЂРёСЏ"
          />
        </FormField>

        <FormField label="Метрика" error={productErrors.unit} hint="Например: шт., г, мл, зубчик">
          <TextInput
            value={productForm.unit}
            onChange={(event) => setProductForm((state) => ({ ...state, unit: event.target.value }))}
            placeholder="шт."
          />
        </FormField>

        <FormField label="Р—Р°РјРµС‚РєРё" hint="РќР°РїСЂРёРјРµСЂ, РїСЂРѕРёР·РІРѕРґРёС‚РµР»СЏ РёР»Рё СЃСЂРѕРє РіРѕРґРЅРѕСЃС‚Рё">
          <TextInput
            multiline
            rows={4}
            value={productForm.notes}
            onChange={(event) => setProductForm((state) => ({ ...state, notes: event.target.value }))}
            placeholder="РҐСЂР°РЅРёС‚СЊ РІ С…РѕР»РѕРґРёР»СЊРЅРёРєРµ, РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РґРѕ РїСЏС‚РЅРёС†С‹"
          />
        </FormField>
      </Modal>
    </div>
  );
};

