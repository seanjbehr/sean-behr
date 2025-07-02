import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";
import { checkApiKey } from "../common/auth";

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

  const unauthorized = checkApiKey(request);
  if (unauthorized) return unauthorized;

  const userId = request.query.get("id");

  try {
    if (userId) {
      const { resource } = await container.item(userId, userId).read();

      if (!resource) {
        return {
          status: 404,
          jsonBody: { error: "User not found" },
        };
      }

      // Reshape single user
      const user = {
        id: resource.id,
        userId: resource.userId,
        title: resource.title,
        description: resource.description,
        email: resource.email,
        isApproved: resource.isApproved
      };

      return {
        status: 200,
        jsonBody: user,
      };
    } else {
      const query = {
        query: "SELECT * FROM c"
      };

      const { resources } = await container.items.query(query).fetchAll();

      // Map and reshape all users
      const users = resources.map((u) => ({
        id: u.id,
        userId: u.userId,
        title: u.title,
        description: u.description,
        email: u.email,
        isApproved: u.isApproved
      }));

      return {
        status: 200,
        jsonBody: users,
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
