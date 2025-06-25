import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

// Cosmos DB setup
const cosmosConnectionString = process.env.CosmosDBConnection;
if (!cosmosConnectionString) {
  throw new Error("CosmosDBConnection is not defined in environment variables.");
}

const client = new CosmosClient(cosmosConnectionString);
const container = client.database("usercontainer").container("User1"); // Adjust as needed

const httpTrigger = async function (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("DeleteUser function started");

  const id = request.query.get("id");
  const userId = request.headers.get("x-user-id");

  if (!id || !userId) {
    return {
      status: 400,
      jsonBody: { error: "Missing id or x-user-id in request." }
    };
  }

  try {
    await container.item(id, userId).delete();
    context.log(`User with ID ${id} deleted.`);
    return {
      status: 200,
      jsonBody: { message: "User deleted successfully." }
    };
  } catch (error) {
    context.log(`Delete failed: ${error}`);
    return {
      status: 500,
      jsonBody: { error: "Failed to delete user from Cosmos DB." }
    };
  }
};

export default app.http("DeleteUser", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  handler: httpTrigger
});
