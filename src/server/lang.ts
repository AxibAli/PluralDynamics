// Reads the visitor's language cookie during server rendering. Server-only.
// getCookie is imported statically (like auth.ts) so it shares the request context.
import { getCookie } from "@tanstack/react-start/server";

export const langCookie = (name: string) => getCookie(name);
