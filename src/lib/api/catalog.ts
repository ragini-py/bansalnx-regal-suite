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

export async function createProductRequest(
  product: Omit<Product, "id" | "createdAt">,
): Promise<Product> {
  const { data } = await apiClient.post<{ product: Product }>("/products", product);
  return data.product;
}

export async function updateProductRequest(product: Product): Promise<Product> {
  const { id, ...body } = product;
  const { data } = await apiClient.put<{ product: Product }>(`/products/${id}`, body);
  return data.product;
}

export async function deleteProductRequest(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}

export async function getCollections(): Promise<Collection[]> {
  const { data } = await apiClient.get<{ collections: Collection[] }>("/collections");
  return data.collections;
}

export async function createCollectionRequest(
  collection: Omit<Collection, "id">,
): Promise<Collection> {
  const { data } = await apiClient.post<{ collection: Collection }>("/collections", collection);
  return data.collection;
}

export async function updateCollectionRequest(collection: Collection): Promise<Collection> {
  const { id, ...body } = collection;
  const { data } = await apiClient.put<{ collection: Collection }>(`/collections/${id}`, body);
  return data.collection;
}

export async function deleteCollectionRequest(id: string): Promise<void> {
  await apiClient.delete(`/collections/${id}`);
}
