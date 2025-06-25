import { v4 as uuidv4 } from "uuid";
import { HttpRequest } from "@azure/functions";

export function getGuid(): string {
  return uuidv4();
}

export function getUserId(headers: HttpRequest["headers"]): string {
  const userId = headers.get?.("x-user-id");
  return userId ?? "anonymous";
}
