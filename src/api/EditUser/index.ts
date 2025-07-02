import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";
import { checkApiKey } from "../../common/auth";
import { UserRecord } from "../../models/user-record";

const cosmosConnectionString = process.env.CosmosDBConnection;
if (!cosmosConnectionString) {
  throw new Error("CosmosDBConnection is not defined in environment variables.");
}

const client = new CosmosClient(cosmosConnectionString);
const container = client.database("usercontainer").container("User1");

const httpTrigger = async function (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("Edit user started.");

  const unauthorized = checkApiKey(request);
  if (unauthorized) return unauthorized;

  const body = await request.json() as UserRecord;
  const user: UserRecord = body;

  if (!user || !user.id || !user.userId) {
    return {
      status: 400,
      jsonBody: { error: "Missing user data, ID, or userId" },
    };
  }

  try {
    const { resource } = await container.item(user.id, user.userId).read();

    if (!resource) {
      return {
        status: 404,
        jsonBody: { error: "User not found" },
      };
    }

    const updated = {
      ...resource,
      ...user
    };

    await container.item(user.id, user.userId).replace(updated);

    return {
      status: 200,
      jsonBody: { message: "User updated successfully", user: updated },
    };
  } catch (error) {
    context.log(`Error updating user: ${error}`);
    return {
      status: 500,
      jsonBody: { error: "Failed to update user" },
    };
  }
};

export default app.http("EditUser", {
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
