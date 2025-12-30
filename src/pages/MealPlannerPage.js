import { useState } from 'react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { FormField, TextInput } from '../components/forms/FormField';
import { EmptyState } from '../components/common/EmptyState';

const DEFAULT_ACCENT_COLOR = '#ff7e5f';

const defaultGroup = {
  name: '',
  description: '',
  accentColor: DEFAULT_ACCENT_COLOR,
};

export const MealPlannerPage = ({
  mealGroups,
  createMealGroup,
  updateMealGroup,
  deleteMealGroup,
  isMutating,
  onOpenGroup,
}) => {
  const [isGroupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupForm, setGroupForm] = useState(defaultGroup);
  const [groupErrors, setGroupErrors] = useState({});

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

  const handleDeleteGroup = async () => {
    if (!editingGroup) return;

    await deleteMealGroup(editingGroup.id);
    resetGroupModal();
  };

  return (
    <div className="page">
      <div className="page__header">
        <h2 className="page__title">Наборы приёмов пищи</h2>
        <Button onClick={openCreateModal} className="meal-groups__add-button" aria-label="Новый набор">
          <span className="meal-groups__add-label">Новый набор</span>
          <span className="meal-groups__add-icon" aria-hidden>
            +
          </span>
        </Button>
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
            <Card
              key={group.id}
              className="meal-group-card"
              accentColor={group.accentColor || DEFAULT_ACCENT_COLOR}
              role="button"
              tabIndex={0}
              onClick={() => onOpenGroup?.(group.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onOpenGroup?.(group.id);
                }
              }}
            >
              <CardHeader
                title={group.name}
                subtitle={group.description}
                accentColor={group.accentColor || DEFAULT_ACCENT_COLOR}
                endSlot={
                  <Button
                    variant="ghost"
                    className="icon-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openEditModal(group);
                    }}
                    aria-label={`Настройки набора ${group.name}`}
                  >
                    ⚙️
                  </Button>
                }
              />
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={isGroupModalOpen}
        title={editingGroup ? 'Редактирование набора' : 'Новый набор'}
        onClose={resetGroupModal}
        footer={
          <div className="modal-actions">
            {editingGroup && (
              <Button variant="danger" onClick={handleDeleteGroup} disabled={isMutating}>
                Удалить набор
              </Button>
            )}

            <div className="modal-actions__end">
              <Button variant="ghost" onClick={resetGroupModal} disabled={isMutating}>
                Отмена
              </Button>
              <Button onClick={submitGroup} disabled={isMutating}>
                {editingGroup ? 'Сохранить' : 'Создать'}
              </Button>
            </div>
          </div>
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
    </div>
  );
};

