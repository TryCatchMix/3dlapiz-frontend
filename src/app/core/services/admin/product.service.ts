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
    categoryId?: number;
    page?: number;
  } = {}): Observable<any> {
    const params = new URLSearchParams();

    if (options.perPage) params.append('per_page', options.perPage.toString());
    if (options.sortBy) params.append('sort_by', options.sortBy);
    if (options.sortOrder) params.append('sort_order', options.sortOrder);
    if (options.search) params.append('search', options.search);
    if (options.categoryId) params.append('category_id', options.categoryId.toString());
    if (options.page) params.append('page', options.page.toString());

    const queryString = params.toString();
    const url = `${this.apiUrl}/admin/products${queryString ? '?' + queryString : ''}`;

    return this.http.get(url);
  }

  createProduct(productData: FormData): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/admin/products`, productData);
  }

  updateProduct(id: number | string, productData: any): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/admin/products/${id}`, productData);
  }

  manageProductImages(id: number | string, imageData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/products/${id}/images`, imageData);
  }

  updateProductStatus(id: number | string, status: 'active' | 'inactive' | 'draft'): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/admin/products/${id}/status`, { status });
  }

  updateProductFeatured(id: number | string, featured: boolean): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/admin/products/${id}/featured`, { featured });
  }

  duplicateProduct(id: number | string): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/admin/products/${id}/duplicate`, {});
  }

  getLowStockProducts(threshold: number = 5): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/products/low-stock?threshold=${threshold}`);
  }

  getDashboardMetrics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/products/dashboard`);
  }

  getProductStatistics(id: number | string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/products/${id}/statistics`);
  }
}
