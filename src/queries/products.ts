import axios, { AxiosError } from "axios";
import API_PATHS from "~/constants/apiPaths";
import { AvailableProduct } from "~/models/Product";
import { useQuery, useQueryClient, useMutation } from "react-query";
import React from "react";

// Create axios instance with authorization header
const axiosInstance = axios.create();

axiosInstance.interceptors.request.use((config) => {
  const authToken = localStorage.getItem("authorization_token");
  if (authToken && config.headers) {
    config.headers.Authorization = `Basic ${authToken}`;
  }
  return config;
});

// Response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error("API Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      code: error.code,
      message: error.message,
    });

    // Check if this is an auth-related error
    const isHttpError = error.response !== undefined;
    const status = error.response?.status;
    const isNetworkError = error.code === "ERR_NETWORK" || !isHttpError;

    if (status === 401) {
      alert(
        'Unauthorized (401)\n\nMissing or invalid Authorization header.\n\nPlease ensure you have set the authorization token in localStorage:\n\nconst token = btoa("PashaSmurf:TEST_PASSWORD");\nlocalStorage.setItem("authorization_token", token);'
      );
    } else if (status === 403) {
      alert(
        "Forbidden (403)\n\nInvalid credentials provided.\n\nPlease check your username and password."
      );
    } else if (isNetworkError) {
      // Network error - likely auth failure or CORS issue
      alert(
        'Authorization Failed\n\nPlease ensure you have set the authorization token in localStorage:\n\nconst token = btoa("PashaSmurf:TEST_PASSWORD");\nlocalStorage.setItem("authorization_token", token);'
      );
    }
    return Promise.reject(error);
  }
);

export function useAvailableProducts() {
  return useQuery<AvailableProduct[], AxiosError>(
    "available-products",
    async () => {
      const res = await axiosInstance.get<AvailableProduct[]>(
        `${API_PATHS.product}/products`
      );
      return res.data;
    }
  );
}

export function useInvalidateAvailableProducts() {
  const queryClient = useQueryClient();
  return React.useCallback(
    () => queryClient.invalidateQueries("available-products", { exact: true }),
    []
  );
}

export function useAvailableProduct(id?: string) {
  return useQuery<AvailableProduct, AxiosError>(
    ["product", { id }],
    async () => {
      const res = await axiosInstance.get<AvailableProduct>(
        `${API_PATHS.product}/products/${id}`
      );
      return res.data;
    },
    { enabled: !!id }
  );
}

export function useRemoveProductCache() {
  const queryClient = useQueryClient();
  return React.useCallback(
    (id?: string) =>
      queryClient.removeQueries(["product", { id }], { exact: true }),
    []
  );
}

export function useUpsertAvailableProduct() {
  return useMutation((values: AvailableProduct) =>
    axiosInstance.post<AvailableProduct>(
      `${API_PATHS.product}/products`,
      values
    )
  );
}

export function useUpdateAvailableProduct() {
  return useMutation((values: Partial<AvailableProduct> & { id: string }) => {
    const { id, ...data } = values;
    return axiosInstance.put<AvailableProduct>(
      `${API_PATHS.product}/products/${id}`,
      data
    );
  });
}

export function useDeleteAvailableProduct() {
  return useMutation((id: string) =>
    axiosInstance.delete(`${API_PATHS.product}/products/${id}`)
  );
}
