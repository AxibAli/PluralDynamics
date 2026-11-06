// Receiver for the "Email new leads" webhook (registered in src/index.js). Strapi posts
// entry.create events here; the shared secret header keeps anyone else out.
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/hooks/lead-email',
      handler: 'lead.emailHook',
      config: { auth: false, policies: [] },
    },
  ],
};
