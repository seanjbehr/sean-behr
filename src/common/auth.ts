import { HttpRequest, HttpResponseInit } from "@azure/functions";

const validApiKey = process.env.API_KEY;

export function checkApiKey(request: HttpRequest): HttpResponseInit | null {
  const incomingKey = request.headers.get("x-api-key");

  if (!validApiKey || incomingKey !== validApiKey) {
    return {
      status: 401,
      jsonBody: { error: "Unauthorized: Invalid or missing API key" }
    };
  }

  return null; // All good
}
