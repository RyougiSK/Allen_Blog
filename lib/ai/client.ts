import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";

let client: BedrockRuntimeClient | null = null;

export function getBedrockClient(): BedrockRuntimeClient {
  if (!client) {
    client = new BedrockRuntimeClient({ region: process.env.AWS_REGION });
  }
  return client;
}

export function getModelId(): string {
  return process.env.BEDROCK_MODEL_ID || "us.deepseek.r1-v1:0";
}
