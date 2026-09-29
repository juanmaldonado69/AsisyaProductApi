import axiosClient from '../../../api/axiosClient';
import type { PagedResult } from '../../../shared/dtos/paged-result.dto';
import type { ProductResponseDto, CreateProductDto } from '../dtos/product.dto';

export const productService = {
  getAll: async (search: string, pageNumber: number, pageSize: number) => {
    const response = await axiosClient.get<PagedResult<ProductResponseDto>>('/Products', {
      params: { search, pageNumber, pageSize }
    });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await axiosClient.get<ProductResponseDto>(`/Products/${id}`);
    return response.data;
  },

  create: async (data: CreateProductDto) => {
    const response = await axiosClient.post('/Products', data);
    return response.data;
  },

  update: async (id: number, data: CreateProductDto) => {
    const response = await axiosClient.put(`/Products/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await axiosClient.delete(`/Products/${id}`);
  },

  generateRandomProducts: async (count: number): Promise<{ message: string; totalGenerated: number }> => {
    const response = await axiosClient.post(`/Products/generate/${count}`);
    return response.data;
  }
};