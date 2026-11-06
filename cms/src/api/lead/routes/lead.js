const { factories } = require('@strapi/strapi');

// The website may only create leads; reading them is admin-panel only.
module.exports = factories.createCoreRouter('api::lead.lead', { only: ['create'] });
