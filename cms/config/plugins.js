module.exports = ({ env }) => ({
  'users-permissions': { config: { jwtSecret: env('JWT_SECRET') } },

  // Images go to Cloudinary: Render's disk is wiped on every deploy. Without Cloudinary keys
  // (local development) Strapi keeps uploads in public/uploads.
  ...(env('CLOUDINARY_NAME')
    ? {
        upload: {
          config: {
            provider: 'cloudinary',
            providerOptions: {
              cloud_name: env('CLOUDINARY_NAME'),
              api_key: env('CLOUDINARY_KEY'),
              api_secret: env('CLOUDINARY_SECRET'),
            },
            actionOptions: { upload: { folder: env('CLOUDINARY_FOLDER', 'pluraldynamics') }, uploadStream: { folder: env('CLOUDINARY_FOLDER', 'pluraldynamics') }, delete: {} },
            sizeLimit: 5 * 1024 * 1024,
          },
        },
      }
    : {}),

  // Lead emails (sent by the new-lead webhook). Gmail: smtp.gmail.com:465 + a 16-character App Password.
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'smtp.gmail.com'),
        port: env.int('SMTP_PORT', 465),
        secure: env.int('SMTP_PORT', 465) === 465,
        auth: { user: env('SMTP_USER'), pass: env('SMTP_PASS') },
      },
      settings: {
        defaultFrom: env('MAIL_FROM', env('SMTP_USER')),
        defaultReplyTo: env('MAIL_FROM', env('SMTP_USER')),
      },
    },
  },
});
