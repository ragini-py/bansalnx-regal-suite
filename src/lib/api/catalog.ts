/**
 * `/api/products` and `/api/collections` — matches bansalnx-backend's
 * modules/catalog shape field-for-field (Product/Collection in data/types.ts).
 */
import type { Collection, Product } from "@/data/types";
import { apiClient } from "@/lib/api/client";

export async function getProducts(): Promise<Product[]> {
  const { data } = await apiClient.get<{ products: Product[] }>("/products");
  return data.products;
}

export async function updateProductRequest(product: Product): Promise<Product> {
  const { id, ...body } = product;
  const { data } = await apiClient.put<{ product: Product }>(`/products/${id}`, body);
  return data.product;
}

export async function getCollections(): Promise<Collection[]> {
  const { data } = await apiClient.get<{ collections: Collection[] }>("/collections");
  return data.collections;
}
