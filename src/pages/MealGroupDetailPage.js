import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { FormField, SelectInput } from '../components/forms/FormField';

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

  const dishOptions = useMemo(
    () => dishes.map((dish) => ({ label: dish.name, value: String(dish.id) })),
    [dishes],
  );

  const selectedGroupDishIds = mealGroup?.dishes?.map((item) => item.dishId) ?? [];
  const filteredDishOptions = dishOptions.filter((option) => !selectedGroupDishIds.includes(Number(option.value)));

  const openAssignDishModal = () => {
    setSelectedDishId('');
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
          <button type="button" className="link-button" onClick={onBack}>
            ← Назад к наборам
          </button>
          <h2 className="page__title">{mealGroup.name}</h2>
          {mealGroup.description && <p className="muted">{mealGroup.description}</p>}
        </div>

        <Button onClick={openAssignDishModal}>Добавить блюдо</Button>
      </div>

      <Card accentColor={mealGroup.accentColor}>
        <CardHeader title="Блюда в наборе" accentColor={mealGroup.accentColor} />

        <CardContent>
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
        </CardContent>
      </Card>

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
        <FormField label="Блюдо" hint="Можно добавить любое блюдо из списка">
          <SelectInput
            value={selectedDishId}
            onChange={(event) => setSelectedDishId(event.target.value)}
            options={filteredDishOptions}
            placeholder={filteredDishOptions.length ? 'Выберите блюдо' : 'Все блюда уже добавлены'}
            disabled={filteredDishOptions.length === 0}
          />
        </FormField>
      </Modal>
    </div>
  );
};
