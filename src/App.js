import { useMemo, useState } from 'react';
import './App.css';
import { AppLayout } from './components/layout/AppLayout';
import { usePlannerData } from './hooks/usePlannerData';
import { MealPlannerPage } from './pages/MealPlannerPage';
import { MealGroupDetailPage } from './pages/MealGroupDetailPage';
import { DishesPage } from './pages/DishesPage';
import { DishDetailPage } from './pages/DishDetailPage';
import { ProductsPage } from './pages/ProductsPage';
import { ShoppingPage } from './pages/ShoppingPage';
import { Alert } from './components/common/Alert';
import { Button } from './components/common/Button';

const VIEW_CONFIG = {
  planner: {
    title: 'Домашний план питания',
    subtitle: 'MealMate',
  },
  dishes: {
    title: 'Коллекция блюд',
    subtitle: 'MealMate',
  },
  products: {
    title: 'Продукты и холодильник',
    subtitle: 'MealMate',
  },
  shopping: {
    title: 'Планирование покупок',
    subtitle: 'MealMate',
  },
  groupDetail: {
    title: 'Набор приёмов пищи',
    subtitle: 'MealMate',
  },
  dishDetail: {
    title: 'Блюдо',
    subtitle: 'MealMate',
  },
};

const NAV_ITEMS = [
  { id: 'planner', label: 'План', icon: '🗓️' },
  { id: 'dishes', label: 'Блюда', icon: '🍽️' },
  { id: 'products', label: 'Продукты', icon: '🧺' },
  { id: 'shopping', label: 'Покупки', icon: '🛒' },
];

function App() {
  const [view, setView] = useState('planner');
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [activeDishId, setActiveDishId] = useState(null);
  const [dishDetailReturnView, setDishDetailReturnView] = useState('dishes');
  const [pendingDishEditId, setPendingDishEditId] = useState(null);
  const planner = usePlannerData();

  const activeGroup = planner.mealGroups.find((group) => group.id === activeGroupId);
  const activeDish = planner.dishes.find((dish) => dish.id === activeDishId);

  const { title, subtitle } = (() => {
    if (view === 'groupDetail' && activeGroup) {
      return { title: activeGroup.name, subtitle: 'Набор приёмов пищи' };
    }

    if (view === 'dishDetail' && activeDish) {
      return { title: activeDish.name, subtitle: 'Блюдо' };
    }

    return VIEW_CONFIG[view] ?? VIEW_CONFIG.planner;
  })();

  const changeView = (nextView) => {
    setView(nextView);
    setActiveGroupId(null);
    setActiveDishId(null);
  };

  const content = useMemo(() => {
    if (planner.loading) {
      return (
        <div className="loading-state">
          <div className="loading-spinner" aria-hidden />
          <p>Загружаем ваши блюда и продукты…</p>
        </div>
      );
    }

    switch (view) {
      case 'dishes':
        return (
          <DishesPage
            dishes={planner.dishes}
            products={planner.products}
            mealGroups={planner.mealGroups}
            createDish={planner.createDish}
            updateDish={planner.updateDish}
            deleteDish={planner.deleteDish}
            createDishProduct={planner.createDishProduct}
            updateDishProduct={planner.updateDishProduct}
            deleteDishProduct={planner.deleteDishProduct}
            createMealGroupDish={planner.createMealGroupDish}
            deleteMealGroupDish={planner.deleteMealGroupDish}
            isMutating={planner.isMutating}
            editingDishId={pendingDishEditId}
            onEditingDishHandled={() => setPendingDishEditId(null)}
            onOpenDish={(dishId) => {
              setActiveDishId(dishId);
              setDishDetailReturnView('dishes');
              setView('dishDetail');
            }}
          />
        );
      case 'products':
        return (
          <ProductsPage
            products={planner.products}
            createProduct={planner.createProduct}
            updateProduct={planner.updateProduct}
            deleteProduct={planner.deleteProduct}
            isMutating={planner.isMutating}
          />
        );
      case 'shopping':
        return (
          <ShoppingPage
            dishes={planner.dishes}
            mealGroups={planner.mealGroups}
            products={planner.products}
            shoppingList={planner.shoppingList}
            baseShoppingProducts={planner.baseShoppingProducts}
            saveShoppingList={planner.saveShoppingList}
            updateShoppingListItem={planner.updateShoppingListItem}
            deleteShoppingListItem={planner.deleteShoppingListItem}
            clearShoppingList={planner.clearShoppingList}
            addBaseProductsToShoppingList={planner.addBaseProductsToShoppingList}
            createBaseShoppingProduct={planner.createBaseShoppingProduct}
            deleteBaseShoppingProduct={planner.deleteBaseShoppingProduct}
            isMutating={planner.isMutating}
          />
        );
      case 'planner':
      default:
        return (
          <MealPlannerPage
            mealGroups={planner.mealGroups}
            createMealGroup={planner.createMealGroup}
            updateMealGroup={planner.updateMealGroup}
            deleteMealGroup={planner.deleteMealGroup}
            isMutating={planner.isMutating}
            onOpenGroup={(groupId) => {
              setActiveGroupId(groupId);
              setView('groupDetail');
            }}
          />
        );
      case 'groupDetail':
        return (
          <MealGroupDetailPage
            mealGroup={activeGroup}
            dishes={planner.dishes}
            createMealGroupDish={planner.createMealGroupDish}
            deleteMealGroupDish={planner.deleteMealGroupDish}
            isMutating={planner.isMutating}
            onBack={() => setView('planner')}
            onOpenDish={(dishId) => {
              setActiveDishId(dishId);
              setDishDetailReturnView('groupDetail');
              setView('dishDetail');
            }}
          />
        );
      case 'dishDetail':
        return (
          <DishDetailPage
            dish={activeDish}
            onBack={() => {
              setActiveDishId(null);
              setView(dishDetailReturnView);
            }}
            onEditDish={(dishId) => {
              setPendingDishEditId(dishId);
              setView('dishes');
            }}
            onDeleteDish={async (dishId) => {
              await planner.deleteDish(dishId);
              setActiveDishId(null);
              setView(dishDetailReturnView);
            }}
            isMutating={planner.isMutating}
          />
        );
    }
  }, [activeDish, activeGroup, dishDetailReturnView, pendingDishEditId, planner, view]);

  return (
    <AppLayout
      activeView={view === 'groupDetail' ? 'planner' : view === 'dishDetail' ? 'dishes' : view}
      onChangeView={changeView}
      title={title}
      subtitle={subtitle}
      navigationItems={NAV_ITEMS}
      footer={<p className="footer-note">MealMate © {new Date().getFullYear()}</p>}
    >
      {planner.error && (
        <Alert tone="error" title="Что-то пошло не так" onClose={planner.clearError}>
          {planner.error}
          <Button variant="ghost" onClick={planner.refresh} className="alert__action">
            Повторить
          </Button>
        </Alert>
      )}
      {content}
    </AppLayout>
  );
}

export default App;
