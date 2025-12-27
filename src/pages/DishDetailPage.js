import { Card, CardContent } from '../components/common/Card';
import { Tag } from '../components/common/Tag';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';

export const DishDetailPage = ({ dish, onBack }) => {
  if (!dish) {
    return (
      <EmptyState
        title="Блюдо не найдено"
        description="Вернитесь назад и выберите другое блюдо из коллекции."
        action={
          onBack && (
            <Button variant="ghost" onClick={onBack}>
              Назад к блюдам
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
            ← Назад к блюдам
          </button>
          <h2 className="page__title">{dish.name}</h2>
          {dish.description && <p className="muted">{dish.description}</p>}
        </div>
      </div>

      <Card className="dish-detail">
        <CardContent>
          <div className="dish-detail__layout">
            <div className="dish-detail__main">
              <div className="dish-detail__section">
                <h3 className="section-heading__title">Описание</h3>
                {dish.description ? (
                  <p className="multiline">{dish.description}</p>
                ) : (
                  <p className="muted">Описание не указано</p>
                )}
              </div>

              <div className="dish-detail__section">
                <h3 className="section-heading__title">Инструкции</h3>
                {dish.instructions ? (
                  <p className="multiline">{dish.instructions}</p>
                ) : (
                  <p className="muted">Инструкции отсутствуют</p>
                )}
              </div>
            </div>

            <div className="dish-detail__sidebar">
              <div className="dish-detail__section">
                <h3 className="section-heading__title">Время приготовления</h3>
                {dish.preparationMinutes ? (
                  <span className="dish-card__meta-time">{dish.preparationMinutes} мин.</span>
                ) : (
                  <p className="muted">Не указано</p>
                )}
              </div>

              <div className="dish-detail__section">
                <h3 className="section-heading__title">Ингредиенты</h3>
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
