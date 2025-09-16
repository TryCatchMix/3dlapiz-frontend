import { BaseHttpService } from '../../../shared/data-access/base-http.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class AdminProductService extends BaseHttpService {

  getAdminProducts(options: {
    perPage?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    page?: number;
  } = {}): Observable<any> {
    const params = new URLSearchParams();
    if (options.perPage) params.append('per_page', options.perPage.toString());
    if (options.sortBy) params.append('sort_by', options.sortBy);
    if (options.sortOrder) params.append('sort_order', options.sortOrder);
    if (options.search) params.append('search', options.search);
    if (options.page) params.append('page', options.page.toString());

    const queryString = params.toString();
    const url = `${this.apiUrl}/admin/products${queryString ? '?' + queryString : ''}`;
    return this.http.get(url);
  }

  createProduct(productData: FormData): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/admin/products`, productData);
  }

  updateProduct(id: string, productData: any): Observable<Product> {
    // Usar PUT para actualización, no POST
    return this.http.put<Product>(`${this.apiUrl}/admin/products/${id}`, productData);
  }

  manageProductImages(id: string, imageData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/products/${id}/images`, imageData);
  }

  duplicateProduct(id: string): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/admin/products/${id}/duplicate`, {});
  }

  getLowStockProducts(threshold: number = 5): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/products/low-stock?threshold=${threshold}`);
  }

  getDashboardMetrics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/products/dashboard`);
  }

  getProductStatistics(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/products/${id}/statistics`);
  }

  // Método para obtener categorías (necesario para el formulario)
  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories`);
  }
}
