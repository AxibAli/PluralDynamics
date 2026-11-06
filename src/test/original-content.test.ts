import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { catalog, getPage, toSections } from "@/lib/original";

describe("restored original content", () => {
  it("every menu item links to a page with real content", () => {
    for (const group of Object.values(catalog)) {
      for (const item of group) {
        const p = getPage(item.slug);
        expect(p, item.slug).toBeDefined();
        expect(toSections(p!).length, item.slug).toBeGreaterThan(0);
      }
    }
  });

  it("no template filler text is shown", () => {
    const raw = readFileSync("src/content/original-pages.json", "utf8");
    expect(raw).not.toMatch(/lorem ipsum|Jane Doe|Lexi Blake|rubyitsolution/i);
  });

  it("brand red is #E5252A", () => {
    expect(readFileSync("src/styles.css", "utf8")).toContain("--brand-primary: #E5252A");
  });
});
