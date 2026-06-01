import axios, { AxiosError } from "axios";
import React from "react";
import { useQuery, useQueryClient, useMutation } from "react-query";
import API_PATHS from "~/constants/apiPaths";
import { OrderStatus } from "~/constants/order";
import { Order } from "~/models/Order";

// Create axios instance with authorization header and error handling
const axiosInstance = axios.create();

axiosInstance.interceptors.request.use((config) => {
  const authToken = localStorage.getItem("authorization_token");
  if (authToken && config.headers) {
    config.headers.Authorization = `Basic ${authToken}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('API Error:', { status: error.response?.status, statusText: error.response?.statusText, code: error.code, message: error.message });

    // Check if this is an auth-related error
    const isHttpError = error.response !== undefined;
    const status = error.response?.status;
    const isNetworkError = error.code === 'ERR_NETWORK' || !isHttpError;

    if (status === 401) {
      alert('Unauthorized (401)\n\nMissing or invalid Authorization header.\n\nPlease ensure you have set the authorization token in localStorage:\n\nconst token = btoa("PashaSmurf:TEST_PASSWORD");\nlocalStorage.setItem("authorization_token", token);');
    } else if (status === 403) {
      alert('Forbidden (403)\n\nInvalid credentials provided.\n\nPlease check your username and password.');
    } else if (isNetworkError) {
      // Network error - likely auth failure or CORS issue
      alert('Authorization Failed\n\nPlease ensure you have set the authorization token in localStorage:\n\nconst token = btoa("PashaSmurf:TEST_PASSWORD");\nlocalStorage.setItem("authorization_token", token);');
    }
    return Promise.reject(error);
  }
);

export function useOrders() {
  return useQuery<Order[], AxiosError>("orders", async () => {
    const res = await axiosInstance.get<Order[]>(`${API_PATHS.order}/order`);
    return res.data;
  });
}

export function useInvalidateOrders() {
  const queryClient = useQueryClient();
  return React.useCallback(
    () => queryClient.invalidateQueries("orders", { exact: true }),
    []
  );
}

export function useUpdateOrderStatus() {
  return useMutation(
    (values: { id: string; status: OrderStatus; comment: string }) => {
      const { id, ...data } = values;
      return axiosInstance.put(`${API_PATHS.order}/order/${id}/status`, data);
    }
  );
}

export function useSubmitOrder() {
  return useMutation((values: Omit<Order, "id">) => {
    return axiosInstance.put<Omit<Order, "id">>(`${API_PATHS.order}/order`, values);
  });
}

export function useInvalidateOrder() {
  const queryClient = useQueryClient();
  return React.useCallback(
    (id: string) =>
      queryClient.invalidateQueries(["order", { id }], { exact: true }),
    []
  );
}

export function useDeleteOrder() {
  return useMutation((id: string) =>
    axiosInstance.delete(`${API_PATHS.order}/order/${id}`)
  );
}
