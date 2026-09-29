import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  ProductResponseDto, 
  CreateProductDto, 
  CategoryResponseDto, 
  PagedResult 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:5066/api/Products';
  private categoryUrl = 'http://localhost:5066/api/Category';

  constructor(private http: HttpClient) {}

  // Consulta paginada (Retorna DTOs de lectura)
  getProducts(
    search?: string, 
    categoryId?: number, 
    pageNumber: number = 1, 
    pageSize: number = 10
  ): Observable<PagedResult<ProductResponseDto>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }

    if (categoryId && categoryId > 0) {
      params = params.set('categoryId', categoryId.toString());
    }

    return this.http.get<PagedResult<ProductResponseDto>>(this.apiUrl, { params });
  }

  // Detalle individual por ID
  getProductById(id: number): Observable<ProductResponseDto> {
    return this.http.get<ProductResponseDto>(`${this.apiUrl}/${id}`);
  }

  // Crear producto (Utiliza CreateProductDto)
  createProduct(product: CreateProductDto): Observable<ProductResponseDto> {
    return this.http.post<ProductResponseDto>(this.apiUrl, product);
  }

  // Actualizar producto
  updateProduct(id: number, product: CreateProductDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, product);
  }

  // Eliminar producto
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Obtener listado de categorías para selectores
  getCategories(): Observable<CategoryResponseDto[]> {
    return this.http.get<CategoryResponseDto[]>(this.categoryUrl);
  }

  // Carga masiva (Punto 2 de la prueba)
  bulkCreateProducts(categoryId: number, count: number = 100000): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk`, { categoryId, count });
  }
}