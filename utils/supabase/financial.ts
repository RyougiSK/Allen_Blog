import { createServiceClient } from "./service";
import { createClient } from "./server";

export function createFinancialServiceClient() {
  return createServiceClient().schema("financial");
}

export async function createFinancialClient() {
  const client = await createClient();
  return client.schema("financial");
}
