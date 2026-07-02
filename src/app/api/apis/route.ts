import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSpecByRoute } from "@/lib/api-specs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      // Find details for a specific slug
      // We look up the spec by slug first, then check DB matching
      const specRoute = getSpecByRoute(`/api/v1/download/${slug}`) || 
                        getSpecByRoute(`/api/v1/ai/${slug}`) || 
                        getSpecByRoute(`/api/v1/image/${slug}`) ||
                        getSpecByRoute(`/api/v1/util/${slug}`) ||
                        getSpecByRoute(`/api/v1/search/${slug}`);
                        
      // Or query database directly by route containing slug
      const dbEndpoint = await prisma.apiEndpoint.findFirst({
        where: {
          OR: [
            { route: { endsWith: slug } },
            { route: { contains: `/${slug}` } }
          ]
        },
        include: {
          category: { select: { name: true, slug: true } }
        }
      });

      if (!dbEndpoint) {
        return NextResponse.json({ error: "API not found" }, { status: 404 });
      }

      // Query request count logs from ApiRequest table
      const totalRequests = await prisma.apiRequest.count({
        where: { endpointId: dbEndpoint.id }
      });

      return NextResponse.json({
        endpoint: {
          id: dbEndpoint.id,
          name: dbEndpoint.name,
          description: dbEndpoint.description,
          route: dbEndpoint.route,
          method: dbEndpoint.method,
          status: dbEndpoint.status === "ACTIVE" ? "Online" : "Maintenance",
          requests: totalRequests,
          accessLevel: dbEndpoint.accessLevel,
          rateLimit: dbEndpoint.rateLimit,
          category: dbEndpoint.category.name,
          categorySlug: dbEndpoint.category.slug,
        }
      });
    }

    // Default: return all active endpoints
    const dbEndpoints = await prisma.apiEndpoint.findMany({
      where: { status: "ACTIVE" },
      include: {
        category: { select: { name: true, slug: true } }
      },
      orderBy: { route: "asc" }
    });

    const activeEndpoints = await Promise.all(dbEndpoints.map(async (ep) => {
      const requestsCount = await prisma.apiRequest.count({
        where: { endpointId: ep.id }
      });

      // Format for the explore and docs frontend
      return {
        id: ep.id,
        name: ep.name,
        description: ep.description,
        path: ep.route,
        method: ep.method,
        category: ep.category.name,
        categorySlug: ep.category.slug,
        requests: new Intl.NumberFormat("id-ID").format(requestsCount),
        status: ep.status === "ACTIVE" ? "Online" : "Maintenance",
        // Helper to extract a friendly slug
        slug: ep.route.split("/").pop() || "api"
      };
    }));

    return NextResponse.json({ endpoints: activeEndpoints });
  } catch (error: any) {
    console.error("Public fetch APIs error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
