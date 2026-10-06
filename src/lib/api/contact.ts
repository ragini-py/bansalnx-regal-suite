import { apiClient } from "@/lib/api/client";

export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function submitContactRequest(contact: ContactRequest): Promise<void> {
  await apiClient.post("/contact", contact);
}
