import axiosClient from '../../../api/axiosClient';
import type { CategoryResponseDto, CreateCategoryDto } from '../dtos/category.dto';

export const categoryService = {
  getAll: async () => {
    const response = await axiosClient.get<CategoryResponseDto[]>('/categories');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await axiosClient.get<CategoryResponseDto>(`/categories/${id}`);
    return response.data;
  },

  create: async (data: CreateCategoryDto) => {
    const response = await axiosClient.post('/categories', data);
    return response.data;
  },

  update: async (id: number, data: CreateCategoryDto) => {
    const response = await axiosClient.put(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await axiosClient.delete(`/categories/${id}`);
  }
};