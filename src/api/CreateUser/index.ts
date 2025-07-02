import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";
import { v4 as uuidv4 } from "uuid";
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
  context.log("Create user started.");

  const unauthorized = checkApiKey(request);
  if (unauthorized) return unauthorized;

  const body = await request.json() as UserRecord;
  const user: UserRecord = body;

  if (!user) {
    return {
      status: 400,
      jsonBody: { error: "User data is required" },
    };
  }

  user.id = uuidv4();

  // ✅ Set a consistent userId for testing purposes
  user.userId = "beta";

  try {
    await container.items.create(user);
    return {
      status: 201,
      jsonBody: { message: "User created successfully", user },
    };
  } catch (error) {
    context.log(`Error creating user: ${error}`);
    return {
      status: 500,
      jsonBody: { error: "Failed to create user" },
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
