import { useMemo, useState } from 'react';
import './App.css';
import { AppLayout } from './components/layout/AppLayout';
import { usePlannerData } from './hooks/usePlannerData';
import { MealPlannerPage } from './pages/MealPlannerPage';
import { DishesPage } from './pages/DishesPage';
import { ProductsPage } from './pages/ProductsPage';
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
};

const NAV_ITEMS = [
  { id: 'planner', label: 'План', icon: '🗓️' },
  { id: 'dishes', label: 'Блюда', icon: '🍽️' },
  { id: 'products', label: 'Продукты', icon: '🧺' },
];

function App() {
  const [view, setView] = useState('planner');
  const planner = usePlannerData();

  const { title, subtitle } = VIEW_CONFIG[view] ?? VIEW_CONFIG.planner;

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
            createDish={planner.createDish}
            updateDish={planner.updateDish}
            deleteDish={planner.deleteDish}
            createDishProduct={planner.createDishProduct}
            updateDishProduct={planner.updateDishProduct}
            deleteDishProduct={planner.deleteDishProduct}
            isMutating={planner.isMutating}
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
      case 'planner':
      default:
        return (
          <MealPlannerPage
            mealGroups={planner.mealGroups}
            dishes={planner.dishes}
            createMealGroup={planner.createMealGroup}
            updateMealGroup={planner.updateMealGroup}
            deleteMealGroup={planner.deleteMealGroup}
            createMealGroupDish={planner.createMealGroupDish}
            deleteMealGroupDish={planner.deleteMealGroupDish}
            isMutating={planner.isMutating}
          />
        );
    }
  }, [planner, view]);

  return (
    <AppLayout
      activeView={view}
      onChangeView={setView}
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

