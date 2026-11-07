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
  it("uses the supplied phone numbers", () => {
    expect(contact.offices.map((o) => o.phone)).toEqual(["+49 1515 6228596", "+39 344 658 0188", "+92 331 3006368"]);
  });
  it("builds dialable tel: links", () => {
    expect(telHref("+39 344 658 0188")).toBe("tel:+393446580188");
  });
});
