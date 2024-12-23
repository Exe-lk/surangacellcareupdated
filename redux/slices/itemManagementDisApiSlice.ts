import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const ItemDisApiSlice = createApi({
  reducerPath: 'ItemDisApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000/api/' }),
  tagTypes: ['ItemDis'],
  endpoints: (builder) => ({
    getItemDiss: builder.query({
      query: () => 'ItemDis/route',
      providesTags: ['ItemDis'],
    }),
    getItemDisById: builder.query({
      query: (id) => `ItemDis/${id}`,
      providesTags: ['ItemDis'],
    }),
    getDeleteItemDiss: builder.query({
      query: () => 'ItemDis/bin',
      providesTags: ['ItemDis'],
    }),
    addItemDis: builder.mutation({
      query: (newItemDis) => ({
        url: 'ItemDis/route',
        method: 'POST',
        body: newItemDis,
      }),
      invalidatesTags: ['ItemDis'],
    }),
    updateItemDis: builder.mutation({
      query: (updatedItemDis) => ({
        url: `ItemDis/${updatedItemDis.id}`,
        method: 'PUT',
        body: updatedItemDis,
      }),
      invalidatesTags: ['ItemDis'],
    }),
    deleteItemDis: builder.mutation({
      query: (id) => ({
        url: `ItemDis/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetItemDissQuery,
  useGetItemDisByIdQuery,
  useGetDeleteItemDissQuery,
  useAddItemDisMutation,
  useUpdateItemDisMutation,
  useDeleteItemDisMutation,
} = ItemDisApiSlice;
