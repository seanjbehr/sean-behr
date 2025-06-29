import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

// Cosmos DB setup
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
  context.log("Get user started.");

  const userId = request.query.get("id");

  try {
    if (userId) {
      // Get a single user by ID (used as both ID and partition key)
      const { resource } = await container.item(userId, userId).read();

      if (!resource) {
        return {
          status: 404,
          jsonBody: { error: "User not found" },
        };
      }

      return {
        status: 200,
        jsonBody: resource,
      };
    } else {
      // Get ALL users
      const query = {
        query: "SELECT * FROM c"
      };

      const { resources } = await container.items.query(query).fetchAll();

      return {
        status: 200,
        jsonBody: resources,
      };
    }
  } catch (error) {
    context.log(`Cosmos DB query failed: ${error}`);
    return {
      status: 500,
      jsonBody: { error: "Failed to fetch user(s) from Cosmos DB" },
    };
  }
};

export default app.http("GetUser", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: async (req, ctx) => {
    const res = await httpTrigger(req, ctx);
    return {
      ...res,
      headers: {
        ...res?.headers,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*"
      }
    };
  }
});

