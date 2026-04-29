import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

interface AdminCard {
  title: string;
  description: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent {
  cards: AdminCard[] = [
    {
      title: 'Add Product',
      description: 'Create new products for the store',
      icon: '➕',
      route: '/admin/product-add',
    },
    {
      title: 'Edit Product',
      description: 'Modify or update existing products',
      icon: '✏️',
      route: '/admin/product-edit',
    },
      { title: 'Delete Product',  description: 'Remove products from catalog',       icon: '🗑️',  route: '/admin/product-delete' },
    {
      title: 'Precios de envío',
      description: 'Configura el precio del envío por país',
      icon: '🚚',
      route: '/admin/shipping-rates',
    },
    {
      title: 'Pedidos',
      description: 'Ver pedidos y gestionar envíos',
      icon: '📦',
      route: '/admin/orders',
    },
  ];
}
