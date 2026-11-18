import type { MetadataRoute } from "next";
import { STORE } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: ["/", "/lab/entrar", "/lab/privacidade"], disallow: ["/checkout", "/lab/"] }, sitemap: `${STORE.url}/sitemap.xml` };
}
