import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import ProductArt from "@/components/ProductArt";
import type { Art } from "@/lib/products";

export const OG_SIZE = { width: 1200, height: 630 };

const font = (w: number) => readFile(path.join(process.cwd(), "src/assets", `bricolage-${w}.ttf`));

export async function ogCard(opts: { kicker: string; title: string; sub: string; art: Art; color: string; bg: string }) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#fbfaf7", fontFamily: "Bricolage" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 0 64px 72px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: "#15121f", color: "#d4f55a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 800 }}>i3</div>
            <div style={{ display: "flex", fontSize: 36, fontWeight: 700, color: "#15121f" }}>
              inventores<span style={{ color: "#6d4aff" }}>3d</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: "#6d4aff", marginBottom: 14 }}>{opts.kicker}</div>
            <div style={{ display: "flex", fontSize: opts.title.length > 28 ? 58 : 70, fontWeight: 800, color: "#15121f", lineHeight: 1.02, letterSpacing: -2, maxWidth: 560 }}>{opts.title}</div>
          </div>
          <div style={{ display: "flex", alignSelf: "flex-start", background: "#d4f55a", color: "#15121f", fontSize: 26, fontWeight: 700, padding: "14px 28px", borderRadius: 999 }}>{opts.sub}</div>
        </div>
        <div style={{ width: 560, margin: 36, borderRadius: 40, background: opts.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ProductArt art={opts.art} color={opts.color} id="og" noText size={500} />
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Bricolage", data: await font(700), weight: 700, style: "normal" },
        { name: "Bricolage", data: await font(800), weight: 800, style: "normal" },
      ],
    }
  );
}
