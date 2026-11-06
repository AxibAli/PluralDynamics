// Shared shapes for dashboard-managed content (solutions and blogs).
import { z } from "zod";

// Links and images may only be site-relative paths or http(s) URLs, so no
// javascript: or data: URL can reach an href or src.
const safeUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === "" || v.startsWith("/") || /^https?:\/\//i.test(v), "Use a path starting with / or an http(s) URL");

const line = (max: number) => z.string().trim().max(max);

export const solutionInput = z.object({
  id: z.string().optional(),
  image: safeUrl,
  eyebrow: line(120),
  heading: line(120).min(1, "Heading is required"),
  tagline: line(240),
  paragraphs: z.array(line(4000)).max(10),
  points: z.array(line(200)).max(12),
  badge: line(120),
  buttonLabel: line(60),
  buttonLink: safeUrl,
  order: z.number().int().min(0).max(9999),
});
export type SolutionInput = z.infer<typeof solutionInput>;
export type Solution = SolutionInput & { id: string; createdAt: string; updatedAt: string };

export const blogInput = z.object({
  id: z.string().optional(),
  title: line(200).min(1, "Title is required"),
  slug: z
    .string()
    .trim()
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens")
    .or(z.literal("")),
  excerpt: line(500),
  metaDescription: line(300),
  cover: safeUrl,
  category: line(60),
  author: line(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  content: z.string().max(100_000),
  featured: z.boolean(),
});
export type BlogInput = z.infer<typeof blogInput>;
export type Blog = Omit<BlogInput, "slug"> & { id: string; slug: string; createdAt: string; updatedAt: string };

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "post";

/** Featured post first, then newest first. */
export const sortBlogs = (list: Blog[]) =>
  [...list].sort((a, b) => Number(b.featured) - Number(a.featured) || b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));

export const sortSolutions = (list: Solution[]) => [...list].sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));

export const readingMinutes = (text: string) => Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 220));

export const formatDate = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
};

// Contact form: single-line fields can't carry newlines into email headers.
const one = (max: number) => z.string().trim().max(max).regex(/^[^\r\n]*$/, "Single line only");
export const contactInput = z.object({
  firstName: one(80).min(1, "Please add your first name"),
  lastName: one(80),
  email: z.string().trim().email("Please add a valid email").max(200),
  phone: one(40),
  country: one(80),
  projectType: one(80),
  message: z.string().trim().min(1, "Please add a message").max(5000),
  page: one(200),
  website: z.string().max(200), // honeypot: real visitors never see or fill it
});
export type ContactInput = z.infer<typeof contactInput>;
export type Contact = Omit<ContactInput, "website"> & { id: string; createdAt: string; emailed: boolean };
