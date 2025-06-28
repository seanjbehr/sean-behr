import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { NewUser } from "../models/new-user";
import { User } from "../models/user";
import { UserRecord } from "../models/user-record";
import { getGuid, getUserId } from "../common/utils";
import { createUser } from "../dataaccess/user-repository";

const httpTrigger = async function (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("Create user started.");

  const newUser = await request.json() as NewUser;

  if (newUser && newUser.title && newUser.description) {
    const user: User = {
      id: getGuid(),
      title: newUser.title,
      description: newUser.description
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

export default app.http("CreateUser", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: httpTrigger
});
