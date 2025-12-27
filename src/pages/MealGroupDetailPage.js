import { useMemo, useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { FormField } from '../components/forms/FormField';

export const MealGroupDetailPage = ({
  mealGroup,
  dishes,
  onBack,
  createMealGroupDish,
  deleteMealGroupDish,
  isMutating,
}) => {
  const [isAssignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedDishId, setSelectedDishId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDishListOpen, setDishListOpen] = useState(false);

  const dishOptions = useMemo(
    () => dishes.map((dish) => ({ label: dish.name, value: String(dish.id) })),
    [dishes],
  );

  const selectedGroupDishIds = mealGroup?.dishes?.map((item) => item.dishId) ?? [];
  const availableDishOptions = useMemo(
    () => dishOptions.filter((option) => !selectedGroupDishIds.includes(Number(option.value))),
    [dishOptions, selectedGroupDishIds],
  );

  const filteredDishOptions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return availableDishOptions;

    return availableDishOptions.filter((option) => option.label.toLowerCase().includes(query));
  }, [availableDishOptions, searchTerm]);

  const openAssignDishModal = () => {
    setSelectedDishId('');
    setSearchTerm('');
    setDishListOpen(false);
    setAssignModalOpen(true);
  };

  const submitAssignDish = async () => {
    if (!selectedDishId || !mealGroup) return;

    await createMealGroupDish({ mealGroupId: mealGroup.id, dishId: Number(selectedDishId) });
    setAssignModalOpen(false);
  };

  if (!mealGroup) {
    return (
      <EmptyState
        title="Набор не найден"
        description="Вернитесь на предыдущую страницу и выберите другой набор."
        action={
          onBack && (
            <Button variant="ghost" onClick={onBack}>
              Назад
            </Button>
          )
        }
      />
    );
  }

  return (
    <div className="page">
      <div className="page__header">
        <div className="page__breadcrumbs">
          <button type="button" className="link-button" onClick={onBack}>← Назад к наборам</button>
          <h2 className="page__title">{mealGroup.name}</h2>
          {mealGroup.description && <p className="muted">{mealGroup.description}</p>}
        </div>

        <Button onClick={openAssignDishModal}>Добавить блюдо</Button>
      </div>

      <div className="section">
        <div className="section-header">
          <div className="section-heading">
            {mealGroup.accentColor && (
              <span
                className="card__accent"
                aria-hidden
                style={{ backgroundColor: mealGroup.accentColor }}
              />
            )}
            <div>
              <h3 className="section-heading__title">Блюда в наборе</h3>
              <p className="muted">Каждое блюдо представлено отдельной карточкой.</p>
            </div>
          </div>
        </div>

        {mealGroup.dishes?.length ? (
          <div className="dish-grid">
            {mealGroup.dishes.map((dish) => (
              <Card key={dish.dishId} className="dish-card" accentColor={mealGroup.accentColor}>
                <div className="dish-card__header">
                  <div className="dish-card__title">
                    {mealGroup.accentColor && (
                      <span
                        className="card__accent"
                        aria-hidden
                        style={{ backgroundColor: mealGroup.accentColor }}
                      />
                    )}
                    <p className="dish-card__name">{dish.dishName}</p>
                  </div>

                  <Button
                    variant="ghost"
                    className="icon-button"
                    onClick={() => deleteMealGroupDish(mealGroup.id, dish.dishId)}
                    disabled={isMutating}
                    aria-label={`Убрать блюдо ${dish.dishName}`}
                  >
                    ×
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Блюд пока нет"
            description="Добавьте первые блюда в этот набор, чтобы перейти к планированию."
            action={<Button onClick={openAssignDishModal}>Добавить блюдо</Button>}
          />
        )}
      </div>

      <Modal
        open={isAssignModalOpen}
        title="Добавить блюдо в набор"
        onClose={() => setAssignModalOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setAssignModalOpen(false)} disabled={isMutating}>
              Отмена
            </Button>
            <Button onClick={submitAssignDish} disabled={!selectedDishId || isMutating}>
              Добавить
            </Button>
          </>
        }
      >
        <FormField label="Блюдо" hint="Найдите и добавьте любое блюдо из коллекции">
          <div
            className="searchable-select"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setDishListOpen(false);
              }
            }}
          >
            <input
              type="search"
              className="form-field__input searchable-select__input"
              placeholder={availableDishOptions.length ? 'Введите название блюда' : 'Все блюда уже добавлены'}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onFocus={() => availableDishOptions.length && setDishListOpen(true)}
              onClick={() => availableDishOptions.length && setDishListOpen(true)}
              disabled={availableDishOptions.length === 0}
            />

            {isDishListOpen && (
              <div className="searchable-select__list" role="list">
                {availableDishOptions.length === 0 && (
                  <p className="muted" role="status">
                    Все блюда уже добавлены в этот набор.
                  </p>
                )}

                {availableDishOptions.length > 0 && filteredDishOptions.length === 0 && (
                  <p className="muted" role="status">
                    Ничего не найдено. Попробуйте изменить запрос.
                  </p>
                )}

                {filteredDishOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`searchable-select__option ${selectedDishId === option.value ? 'searchable-select__option--active' : ''}`}
                    onClick={() => {
                      setSelectedDishId(option.value);
                      setDishListOpen(false);
                    }}
                  >
                    <span className="searchable-select__option-title">{option.label}</span>
                    {selectedDishId === option.value && <span className="searchable-select__check">Добавлено</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </FormField>
      </Modal>
    </div>
  );
};
