import axios, { AxiosError } from "axios";
import React from "react";
import { useQuery, useQueryClient, useMutation } from "react-query";
import API_PATHS from "~/constants/apiPaths";
import { CartItem } from "~/models/CartItem";

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
    const status = error.response?.status;

    if (status === 401) {
      alert('Unauthorized (401)\n\nMissing or invalid Authorization header.\n\nPlease ensure you have set the authorization token in localStorage:\n\nconst token = btoa("PashaSmurf:TEST_PASSWORD");\nlocalStorage.setItem("authorization_token", token);');
    } else if (status === 403) {
      alert('Forbidden (403)\n\nInvalid credentials provided.\n\nPlease check your username and password.');
    }
    // Only show network error alert if no token is set
    else if (!error.response && !localStorage.getItem("authorization_token")) {
      alert('Authorization Failed\n\nPlease ensure you have set the authorization token in localStorage:\n\nconst token = btoa("PashaSmurf:TEST_PASSWORD");\nlocalStorage.setItem("authorization_token", token);');
    }
    return Promise.reject(error);
  }
);

export function useCart() {
  return useQuery<CartItem[], AxiosError>("cart", async () => {
    const res = await axiosInstance.get<CartItem[]>(`${API_PATHS.cart}/profile/cart`);
    return res.data;
  }, { enabled: false }); // Disabled temporarily due to constant errors
}

export function useCartData() {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<CartItem[]>("cart");
}

export function useInvalidateCart() {
  const queryClient = useQueryClient();
  return React.useCallback(
    () => queryClient.invalidateQueries("cart", { exact: true }),
    []
  );
}

export function useUpsertCart() {
  return useMutation((values: CartItem) =>
    axiosInstance.put<CartItem[]>(`${API_PATHS.cart}/profile/cart`, values)
  );
}
