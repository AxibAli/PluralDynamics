const { factories } = require('@strapi/strapi');

// Public (website) access is find/findOne only; set in src/index.js.
module.exports = factories.createCoreRouter('api::blog.blog', { only: ['find', 'findOne'] });
