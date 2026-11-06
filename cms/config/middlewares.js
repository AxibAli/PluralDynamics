module.exports = ({ env }) => [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    // Only the website may call the API from a browser. Comma-separated list in CORS_ORIGIN.
    name: 'strapi::cors',
    config: {
      origin: env.array('CORS_ORIGIN', ['http://localhost:8080']),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  { name: 'strapi::body', config: { formLimit: '10mb', jsonLimit: '1mb', textLimit: '1mb', formidable: { maxFileSize: 5 * 1024 * 1024 } } },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
