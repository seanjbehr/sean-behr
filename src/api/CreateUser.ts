import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { NewUser } from "../models/new-user";
import { User } from "../models/user";
import { UserRecord } from "../models/user-record";
import { getGuid, getUserId } from "../common/utils";
import { createUser } from "../dataaccess/user-repository";
import { checkApiKey } from "../common/auth";

const httpTrigger = async function (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("Create user started.");

  const unauthorized = checkApiKey(request);
  if (unauthorized) return unauthorized;

  const newUser = await request.json() as NewUser;

  if (newUser && newUser.title && newUser.description && newUser.email) {
    const user: User = {
      id: getGuid(),
      title: newUser.title,
      description: newUser.description,
      email: newUser.email,
      isApproved: !!newUser.isApproved // ensure it's a boolean
    };

    const userRecord: UserRecord = {
      userId: getUserId(request.headers),
      ...user
    };

    try {
      const createdItem = await createUser(userRecord);

      context.log("Create user completed.");
      return {
        status: 201,
        jsonBody: createdItem
      };
    } catch (error) {
      context.log(`Create user failed: ${error}`);
      return {
        status: 500,
        jsonBody: { error: "Failed to create user" }
      };
    }
  } else {
    return {
      status: 400,
      jsonBody: { error: "Missing required fields: title, description, and email" }
    };
  }
};

export default app.http("CreateUser", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (req, ctx) => {
    const response = await httpTrigger(req, ctx);

    return {
      ...response,
      headers: {
        ...response?.headers,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*"
      }
    };
  }
});
