// Entry file for hosts that start a Node.js file directly (e.g. Hostinger "Entry file").
// Not named server.mjs on purpose: Nitro would treat that name as its own server entry.
// `npm run build` creates the real server in .output/; this file just starts it. It reads
// the port from the PORT environment variable (default 3000).
import "./.output/server/index.mjs";
