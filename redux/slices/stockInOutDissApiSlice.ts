import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const stockInOutApiSlice = createApi({
  reducerPath: 'stockInOutApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://suranga-cellcare-inventory.netlify.app/api/' }),
  tagTypes: ['StockInOut'],
  endpoints: (builder) => ({
    getStockInOuts: builder.query({
      query: () => 'stockInOut/route',
      providesTags: ['StockInOut'],
    }),
    getStockInOutById: builder.query({
      query: (id) => `stockInOut/${id}`,
      providesTags: ['StockInOut'],
    }),
    getDeleteStockInOuts: builder.query({
      query: () => 'stockInOut/bin',
      providesTags: ['StockInOut'],
    }),
    addStockIn: builder.mutation({
      query: (newStockIn) => ({
        url: 'stockInOut/route',
        method: 'POST',
        body: newStockIn,
      }),
      invalidatesTags: ['StockInOut'],
    }),
    addStockOut: builder.mutation({
      query: (newStockOut) => ({
        url: 'stockInOut/route1',
        method: 'POST',
        body: newStockOut,
      }),
      invalidatesTags: ['StockInOut'],
    }),
    updateStockInOut: builder.mutation({
      query: (updatedStockInOut) => ({
        url: `stockInOut/${updatedStockInOut.id}`,
        method: 'PUT',
        body: updatedStockInOut,
      }),
      invalidatesTags: ['StockInOut'],
    }),
    deleteStockInOut: builder.mutation({
      query: (id) => ({
        url: `stockInOut/${id}`,
        method: 'DELETE',
      }),
    }),
    getSubStockInOuts: builder.query({
      query: () => 'stockInOut/route1',
      providesTags: ['StockInOut'],
    }),
    updateSubStockInOut: builder.mutation({
      query: (updatedStockInOut) => ({
        url: `stockInOut/route1`,
        method: 'PUT',
        body: updatedStockInOut,
      }),
      invalidatesTags: ['StockInOut'],
    }),
  }),
});

export const {
  useGetStockInOutsQuery,
  useGetStockInOutByIdQuery,
  useGetDeleteStockInOutsQuery,
  useAddStockInMutation,
  useAddStockOutMutation,
  useUpdateStockInOutMutation,
  useDeleteStockInOutMutation,
  useGetSubStockInOutsQuery,
  useUpdateSubStockInOutMutation,
} = stockInOutApiSlice;
