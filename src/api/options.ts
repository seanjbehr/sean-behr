import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

const optionsHandler = async function (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("Handling CORS preflight request");

  return {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "*"
    }
  };
};

export default app.http("Options", {
  methods: ["OPTIONS"],
  authLevel: "anonymous",
  handler: optionsHandler
});
