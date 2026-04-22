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
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent {

  cards: AdminCard[] = [
    {
      title: 'Add Product',
      description: 'Create new products for the store',
      icon: '➕',
      route: '/admin/product-add'
    },
    {
      title: 'Edit Product',
      description: 'Modify or update existing products',
      icon: '✏️',
      route: '/admin/product-edit'
    }
  ];

}
