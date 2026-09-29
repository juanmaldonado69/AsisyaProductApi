export interface CategoryResponseDto {
  categoryID: number;
  categoryName: string;
  description?: string;
  base64Picture?: string;
}

export interface CreateCategoryDto {
  categoryName: string;
  description?: string;
  base64Picture?: string;
}