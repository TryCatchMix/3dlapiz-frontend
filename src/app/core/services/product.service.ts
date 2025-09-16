import { Observable, tap } from 'rxjs';

import { BaseHttpService } from '../../shared/data-access/base-http.service';
import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService extends BaseHttpService {
  getProducts(): Observable<Product[]> {
    return this.http
      .get<Product[]>(`${this.apiUrl}/products`)
      .pipe(tap((products) => console.log('Productos obtenidos:', products)));
  }

  getProduct(id: string | number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  getProductWithImages(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}/images`);
  }

  searchProducts(term: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/search?q=${term}`);
  }
}
