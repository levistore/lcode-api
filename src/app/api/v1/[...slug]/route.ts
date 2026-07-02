import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSpecByRoute } from "@/lib/api-specs";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  return handleRequest(request, params, "GET");
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  return handleRequest(request, params, "POST");
}

async function handleRequest(request: Request, paramsPromise: Promise<{ slug: string[] }>, method: string) {
  const startTime = Date.now();
  const { slug } = await paramsPromise;
  const path = `/api/v1/${slug.join("/")}`;

  // Get user IP
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  let userId: string | null = null;
  let endpointId: string | null = null;
  let statusCode = 200;

  try {
    // 1. Authenticate API Key
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      statusCode = 401;
      return NextResponse.json({ error: "Missing or invalid Authorization header" }, { status: 401 });
    }

    const key = authHeader.replace("Bearer ", "").trim();
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { key },
      include: { user: true }
    });

    if (!apiKeyRecord || apiKeyRecord.status !== "ACTIVE") {
      statusCode = 401;
      return NextResponse.json({ error: "Unauthorized: Invalid or inactive API key" }, { status: 401 });
    }

    userId = apiKeyRecord.userId;

    // 2. Resolve Endpoint
    const endpoint = await prisma.apiEndpoint.findFirst({
      where: {
        route: {
          endsWith: slug.join("/")
        }
      }
    });

    if (!endpoint || endpoint.status !== "ACTIVE") {
      statusCode = 404;
      return NextResponse.json({ error: "API Endpoint not found or inactive" }, { status: 404 });
    }

    endpointId = endpoint.id;

    if (endpoint.method !== method) {
      statusCode = 405;
      return NextResponse.json({ error: `Method ${method} Not Allowed on this endpoint` }, { status: 405 });
    }

    // 3. Verify Subscription Permissions
    if (endpoint.accessLevel !== "FREE") {
      const activeSubscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: "ACTIVE",
          plan: {
            code: endpoint.accessLevel === "ENTERPRISE" ? "ENTERPRISE" : { in: ["PREMIUM", "ENTERPRISE"] }
          }
        }
      });

      if (!activeSubscription) {
        statusCode = 403;
        return NextResponse.json({
          error: `Forbidden: Upgrade subscription plan to access this ${endpoint.accessLevel} endpoint`
        }, { status: 403 });
      }
    }

    // 4. Rate Limiting
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const requestCountInLastMinute = await prisma.apiRequest.count({
      where: {
        userId,
        createdAt: { gte: oneMinuteAgo }
      }
    });

    if (requestCountInLastMinute >= endpoint.rateLimit) {
      statusCode = 429;
      return NextResponse.json({ error: "Too Many Requests: Rate limit exceeded" }, { status: 429 });
    }

    // 5. Build Response
    const spec = getSpecByRoute(path);
    let resultPayload = {};

    if (spec) {
      try {
        resultPayload = JSON.parse(spec.responseExample);
      } catch {
        resultPayload = { result: "Success" };
      }
    } else {
      resultPayload = {
        status: true,
        message: "Request successfully processed",
        endpoint: path,
        timestamp: new Date().toISOString()
      };
    }

    // Measure exact execution duration
    const responseTime = Date.now() - startTime;

    // 6. Log Request in DB
    await prisma.apiRequest.create({
      data: {
        userId,
        endpointId,
        route: path,
        method,
        ip,
        statusCode,
        responseTime
      }
    });

    // Increment requestCount on Endpoint model
    await prisma.apiEndpoint.update({
      where: { id: endpointId },
      data: { requestCount: { increment: 1 } }
    });

    // Update API Key lastUsed
    await prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsed: new Date() }
    });

    return NextResponse.json(resultPayload);
  } catch (error: any) {
    console.error("Gateway execution error:", error);
    const responseTime = Date.now() - startTime;
    statusCode = 500;

    // Log failed request as well if we have context
    if (userId || endpointId) {
      await prisma.apiRequest.create({
        data: {
          userId,
          endpointId,
          route: path,
          method,
          ip,
          statusCode,
          responseTime
        }
      });
    }

    return NextResponse.json({ error: "Internal gateway execution error" }, { status: 500 });
  }
}
