export interface ProductResponseDto {
  productID: number;
  productName: string;
  categoryID: number;
  categoryName?: string;
  unitPrice: number;
  unitsInStock: number;
  quantityPerUnit?: string;
  categoryPicture?: string;
}

export interface CreateProductDto {
  productName: string;
  categoryID: number;
  unitPrice: number;
  unitsInStock: number;
  quantityPerUnit?: string;
}