import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const dealerApiSlice = createApi({
  reducerPath: 'dealerApi',
<<<<<<< Updated upstream
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000/api/' }),
=======
  baseQuery: fetchBaseQuery({ baseUrl: 'https://suranga-cellcare-inventory.netlify.app/api/' }),
>>>>>>> Stashed changes
  tagTypes: ['Dealer'],
  endpoints: (builder) => ({
    getDealers: builder.query({
      query: () => 'dealer/route',
      providesTags: ['Dealer'],
    }),
    getDealerById: builder.query({
      query: (id) => `dealer/${id}`,
      providesTags: ['Dealer'],
    }),
    getDeleteDealers: builder.query({
      query: () => 'dealer/bin',
      providesTags: ['Dealer'],
    }),
    addDealer: builder.mutation({
      query: (newDealer) => ({
        url: 'dealer/route',
        method: 'POST',
        body: newDealer,
      }),
      invalidatesTags: ['Dealer'],
    }),
    updateDealer: builder.mutation({
      query: (updatedDealer) => ({
        url: `dealer/${updatedDealer.id}`,
        method: 'PUT',
        body: updatedDealer,
      }),
      invalidatesTags: ['Dealer'],
    }),
    deleteDealer: builder.mutation({
      query: (id) => ({
        url: `dealer/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetDealersQuery,
  useGetDealerByIdQuery,
  useGetDeleteDealersQuery,
  useAddDealerMutation,
  useUpdateDealerMutation,
  useDeleteDealerMutation,
} = dealerApiSlice;
