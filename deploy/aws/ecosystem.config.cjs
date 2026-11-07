// PM2 process file: keeps the website (one Node.js server: pages, /admin, API) running and
// restarts it after crashes or reboots. Settings come from /opt/pluraldynamics/.env.
module.exports = {
  apps: [
    {
      name: "pluraldynamics",
      cwd: "/opt/pluraldynamics",
      script: ".output/server/index.mjs",
      env: { NODE_ENV: "production", PORT: "3000", HOST: "127.0.0.1" },
      max_memory_restart: "600M",
      time: true,
    },
  ],
};
