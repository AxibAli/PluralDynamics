// Only one highlighted post: marking one as featured clears the rest.
async function clearOtherFeatured(event) {
  const { result } = event;
  if (!result?.featured || !result.documentId) return;
  await strapi.db.query('api::blog.blog').updateMany({
    where: { featured: true, documentId: { $ne: result.documentId } },
    data: { featured: false },
  });
}

module.exports = { afterCreate: clearOtherFeatured, afterUpdate: clearOtherFeatured };
