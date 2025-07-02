import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";
import { UserRecord } from "../../models/user-record";
import { checkApiKey } from "../../common/auth";

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
  context.log("EditUser function started");

  const unauthorized = checkApiKey(request);
  if (unauthorized) return unauthorized;

  const id = request.query.get("id");
  if (!id) {
    return {
      status: 400,
      jsonBody: { error: "Missing user ID in query string: ?id=123" },
    };
  }

  let updatedData: Partial<UserRecord>;
  try {
    updatedData = await request.json() as Partial<UserRecord>;
  } catch (error) {
    return {
      status: 400,
      jsonBody: { error: "Invalid JSON body." },
    };
  }

  try {
    const { resource: existingUser } = await container.item(id, updatedData.userId).read();
    if (!existingUser) {
      return {
        status: 404,
        jsonBody: { error: "User not found." },
      };
    }

    const updatedUser = {
      ...existingUser,
      ...updatedData,
    };

    const { resource: savedItem } = await container.item(id, updatedUser.userId).replace(updatedUser);

    return {
      status: 200,
      jsonBody: savedItem,
    };
  } catch (error) {
    context.log("Failed to update user", error);
    return {
      status: 500,
      jsonBody: { error: "Failed to update user in Cosmos DB." },
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
