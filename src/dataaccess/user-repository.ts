import { CosmosClient } from "@azure/cosmos";
import { UserRecord } from "../models/user-record";

function getCosmosDbContainer() {
    const connectionString = process.env.CosmosDBConnection;
    if (!connectionString) {
        throw new Error("CosmosDBConnection not defined in environment variables.");
    }

    const client = new CosmosClient(connectionString);
    const db = client.database("usercontainer");
    const container = db.container("User1");
    return container;
}

export async function createUser(user: UserRecord) {
    const container = getCosmosDbContainer();
    const { resource: createdItem } = await container.items.create(user);
    return createdItem;
}

export async function getUserById(id: string) {
    const container = getCosmosDbContainer();
    const { resource } = await container.item(id, id).read(); // assuming id is partition key
    return resource;
}

export async function getAllUsers(userId: string): Promise<UserRecord[]> {
    const querySpec = {
        query: `SELECT * FROM c WHERE c.userId = @userId`,
        parameters: [{ name: "@userId", value: userId }]
    };

    const container = getCosmosDbContainer();
    const { resources } = await container.items.query(querySpec).fetchAll();

    return resources;
}

export async function deleteUser(id: string, userId: string) {
    const container = getCosmosDbContainer();
    const { resource } = await container.item(id, userId).delete();
    return resource;
}
