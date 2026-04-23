import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
  {
    path: 'quick-add',
    loadComponent: () =>
      import('./features/quick-add/quick-add.page').then((m) => m.QuickAddPage),
  },
  {
    path: 'transactions',
    loadComponent: () =>
      import('./features/transactions/list/transaction-list.page').then(
        (m) => m.TransactionListPage,
      ),
  },
  {
    path: 'transactions/:id',
    loadComponent: () =>
      import('./features/transactions/detail/transaction-detail.page').then(
        (m) => m.TransactionDetailPage,
      ),
  },
  {
    path: 'fixed-costs',
    loadComponent: () =>
      import('./features/fixed-costs/list/fixed-cost-list.page').then(
        (m) => m.FixedCostListPage,
      ),
  },
  {
    path: 'fixed-costs/new',
    loadComponent: () =>
      import('./features/fixed-costs/form/fixed-cost-form.page').then(
        (m) => m.FixedCostFormPage,
      ),
  },
  {
    path: 'fixed-costs/:id/edit',
    loadComponent: () =>
      import('./features/fixed-costs/form/fixed-cost-form.page').then(
        (m) => m.FixedCostFormPage,
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.page').then((m) => m.SettingsPage),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
