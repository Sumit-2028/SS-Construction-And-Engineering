import { okResponse, withRouteHandler } from "@/lib/errors/http";

export const runtime = "nodejs";

export const GET = withRouteHandler(async () =>
  okResponse({
    status: "ok",
    service: "construction-management-platform",
    timestamp: new Date().toISOString()
  })
);
