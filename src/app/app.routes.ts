import { CheckoutComponent } from './features/checkout/checkout.component';
import { HomeComponent } from './features/home/home.component';
import { OrderSuccessComponent } from './features/order/order-success/order-success.component';
import { ProductDetailsComponent } from './features/products/product-details/product-details.component';
import { ProfileComponent } from './features/profile/profile.component';
import { Routes } from '@angular/router';
import { TermsConditionsComponent } from './shared/legal/terms-conditions/terms-conditions.component';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./features/products/product-list/product-list.component').then(
        (m) => m.ProductListComponent
      ),
  },
  {
    path: 'product/:id',
    component: ProductDetailsComponent,
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/signup/signup.component').then(
        (m) => m.SignupComponent
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forget_password/forget-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./shared/legal/privacy-policy/privacy-policy.component').then(
        (m) => m.PrivacyPolicyComponent
      ),
  },
  {
    path: 'terms-conditions',
    component: TermsConditionsComponent,
  },

  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard],
  },
  {
    path: 'order-success',
    component: OrderSuccessComponent,
    canActivate: [authGuard],
  },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/cart/cart.component').then((m) => m.CartComponent),
    canActivate: [authGuard],
  },
  {
    path: 'product-add',
    loadComponent: () =>
      import('./features/products/product-add/product-add.component').then(
        (m) => m.ProductAddComponent
      ),
    canActivate: [adminGuard],
  },

  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];
