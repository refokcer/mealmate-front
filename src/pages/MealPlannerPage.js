import { useMemo, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Tag } from '../components/common/Tag';
import { Modal } from '../components/common/Modal';
import { FormField, SelectInput, TextInput } from '../components/forms/FormField';
import { EmptyState } from '../components/common/EmptyState';

const DEFAULT_ACCENT_COLOR = '#ff7e5f';

const defaultGroup = {
  name: '',
  description: '',
  accentColor: DEFAULT_ACCENT_COLOR,
};

const createAccentGradient = (color) => {
  const sourceColor = color || DEFAULT_ACCENT_COLOR;
  const hexMatch = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(sourceColor);

  if (hexMatch) {
    let hex = hexMatch[1];

    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((char) => `${char}${char}`)
        .join('');
    }

    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return `linear-gradient(90deg, rgba(${r}, ${g}, ${b}, 1) 0%, rgba(${r}, ${g}, ${b}, 0) 100%)`;
  }

  return `linear-gradient(90deg, ${sourceColor} 0%, transparent 100%)`;
};

export const MealPlannerPage = ({
  mealGroups,
  dishes,
  createMealGroup,
  updateMealGroup,
  deleteMealGroup,
  createMealGroupDish,
  deleteMealGroupDish,
  isMutating,
}) => {
  const [isGroupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupForm, setGroupForm] = useState(defaultGroup);
  const [groupErrors, setGroupErrors] = useState({});

  const [isAssignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedDishId, setSelectedDishId] = useState('');

  const groupOptions = useMemo(
    () => dishes.map((dish) => ({ label: dish.name, value: String(dish.id) })),
    [dishes],
  );

  const resetGroupModal = () => {
    setGroupModalOpen(false);
    setEditingGroup(null);
    setGroupForm(defaultGroup);
    setGroupErrors({});
  };

  const openCreateModal = () => {
    setEditingGroup(null);
    setGroupForm(defaultGroup);
    setGroupModalOpen(true);
  };

  const openEditModal = (group) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name ?? '',
      description: group.description ?? '',
      accentColor: group.accentColor ?? '#ff7e5f',
    });
    setGroupModalOpen(true);
  };

  const submitGroup = async () => {
    if (!groupForm.name.trim()) {
      setGroupErrors({ name: 'Название обязательно' });
      return;
    }

    const payload = {
      name: groupForm.name.trim(),
      description: groupForm.description.trim() || null,
      accentColor: groupForm.accentColor,
    };

    if (editingGroup) {
      await updateMealGroup(editingGroup.id, payload);
    } else {
      await createMealGroup(payload);
    }

    resetGroupModal();
  };

  const openAssignDishModal = (groupId) => {
    setSelectedGroupId(groupId);
    setSelectedDishId('');
    setAssignModalOpen(true);
  };

  const submitAssignDish = async () => {
    if (!selectedDishId || !selectedGroupId) {
      return;
    }

    await createMealGroupDish({
      mealGroupId: Number(selectedGroupId),
      dishId: Number(selectedDishId),
    });

    setAssignModalOpen(false);
  };

  const selectedGroup = mealGroups.find((group) => group.id === selectedGroupId);
  const selectedGroupDishIds = selectedGroup?.dishes?.map((item) => item.dishId) ?? [];

  const filteredGroupOptions = groupOptions.filter((option) => !selectedGroupDishIds.includes(Number(option.value)));

  return (
    <div className="page">
      <div className="page__header">
        <h2 className="page__title">Наборы приёмов пищи</h2>
        <Button onClick={openCreateModal}>Новый набор</Button>
      </div>

      {mealGroups.length === 0 ? (
        <EmptyState
          title="Наборы ещё не созданы"
          description="Создайте наборы, чтобы собрать план питания на неделю."
          action={<Button onClick={openCreateModal}>Создать набор</Button>}
        />
      ) : (
        <div className="grid grid--responsive">
          {mealGroups.map((group) => (
            <Card key={group.id} className="meal-group-card">
              <div
                className="meal-group-card__accent"
                style={{ background: createAccentGradient(group.accentColor) }}
              />
              <CardHeader
                title={group.name}
                subtitle={group.description}
                endSlot={
                  <div className="card-action-buttons">
                    <Button variant="ghost" onClick={() => openAssignDishModal(group.id)}>
                      Добавить блюдо
                    </Button>
                    <Button variant="ghost" onClick={() => openEditModal(group)}>
                      Редактировать
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => deleteMealGroup(group.id)}
                      disabled={isMutating}
                    >
                      Удалить
                    </Button>
                  </div>
                }
              />

              <CardContent>
                {group.dishes?.length ? (
                  <ul className="chip-list">
                    {group.dishes.map((dish) => (
                      <li key={dish.dishId} className="chip-list__item">
                        <Tag tone="accent">{dish.dishName}</Tag>
                        <button
                          type="button"
                          className="chip-list__remove"
                          onClick={() => deleteMealGroupDish(group.id, dish.dishId)}
                          aria-label={`Убрать блюдо ${dish.dishName}`}
                          disabled={isMutating}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">Блюда пока не добавлены.</p>
                )}
              </CardContent>

              <CardFooter>
                <Button variant="ghost" onClick={() => openAssignDishModal(group.id)}>
                  Подобрать блюдо
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={isGroupModalOpen}
        title={editingGroup ? 'Редактирование набора' : 'Новый набор'}
        onClose={resetGroupModal}
        footer={
          <>
            <Button variant="ghost" onClick={resetGroupModal} disabled={isMutating}>
              Отмена
            </Button>
            <Button onClick={submitGroup} disabled={isMutating}>
              {editingGroup ? 'Сохранить' : 'Создать'}
            </Button>
          </>
        }
      >
        <FormField label="Название" error={groupErrors.name}>
          <TextInput
            value={groupForm.name}
            onChange={(event) => setGroupForm((state) => ({ ...state, name: event.target.value }))}
            placeholder="Например, Завтрак"
          />
        </FormField>

        <FormField label="Описание" hint="Добавьте короткую заметку или настроение">
          <TextInput
            multiline
            rows={4}
            value={groupForm.description}
            onChange={(event) => setGroupForm((state) => ({ ...state, description: event.target.value }))}
            placeholder="Лёгкий и бодрый старт дня"
          />
        </FormField>

        <FormField label="Цвет акцента" hint="Используется в карточках и тегах">
          <TextInput
            type="color"
            value={groupForm.accentColor}
            onChange={(event) => setGroupForm((state) => ({ ...state, accentColor: event.target.value }))}
          />
        </FormField>
      </Modal>

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
            options={filteredGroupOptions}
            placeholder={filteredGroupOptions.length ? 'Выберите блюдо' : 'Все блюда уже добавлены'}
            disabled={filteredGroupOptions.length === 0}
          />
        </FormField>
      </Modal>
    </div>
  );
};

