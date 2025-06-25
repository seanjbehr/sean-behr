import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";
import { NewUser } from "../Models/new-user";
import { User } from "../Models/user";
import { UserRecord } from "../Models/user-record";
import { getGuid, getUserId } from "../common/utils";


// Load Cosmos DB connection
const cosmosConnectionString = process.env.CosmosDBConnection;
if (!cosmosConnectionString) {
  throw new Error("CosmosDBConnection is not defined in environment variables.");
}

//  Connect to Cosmos DB
const cosmosClient = new CosmosClient(cosmosConnectionString);
const database = cosmosClient.database("usercontainer");
const container = database.container("User1");

const httpTrigger = async function (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Create user started.');

  const newUser = await request.json() as NewUser;

  if (newUser && newUser.title && newUser.description) {
    const userId = getUserId(request.headers);

    // Build your user object
    const user: User = {
      id: getGuid(), // Generate a unique ID for the user
      title: newUser.title,
      description: newUser.description
    };

    // Include userId in a UserRecord
    const userRecord: UserRecord = {
      userId,
      ...user
    };

    //  Save to Cosmos DB
 try{
    const { resource: createdItem } = await container.items.create(userRecord);

    context.log('Create user completed.');
    return {
      status: 201,
      jsonBody: createdItem
    };
} catch (error) {
      // If error occurs, log it and return a 500 response
      context.log(`Cosmos DB create failed: ${error}`);

      return {
        status: 500,
        jsonBody: { error: "Failed to create user in Cosmos DB" }
      };
    }
  } else {
    context.log(`Create user invalid input. InvocationId: ${context.invocationId}, NewUser: ${JSON.stringify(newUser)}`);
    return {
      status: 400,
      jsonBody: { error: "Invalid input. Please provide title and description." }
    };
  }
};

export default app.http('CreateUser', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: httpTrigger
});
