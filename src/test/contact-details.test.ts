import { describe, expect, it } from "vitest";
import { contact, telHref } from "@/lib/site-data";

describe("client-approved contact details", () => {
  it("shows the official email address", () => {
    expect(contact.email).toBe("official@pluraldynamics.com");
  });
  it("lists the three supplied offices in order", () => {
    expect(contact.offices.map((o) => o.address)).toEqual([
      "Fichtenweg 13, Tübingen, Germany",
      "Via di Quarto 1, Firenze, Italy",
      "H-3115 King Cottages, Gulistan-e-Johar Block 7, Karachi, Pakistan",
    ]);
  });
  it("uses the supplied Firenze phone number; the other two are marked placeholders", () => {
    const [de, it_, pk] = contact.offices;
    expect(it_?.phone).toBe("+39 344 658 0188");
    expect(it_ && "placeholder" in it_).toBe(false);
    expect([de, pk].every((o) => o && "placeholder" in o && o.placeholder)).toBe(true);
  });
  it("builds dialable tel: links", () => {
    expect(telHref("+39 344 658 0188")).toBe("tel:+393446580188");
  });
});
