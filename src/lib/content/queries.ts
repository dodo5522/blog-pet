export const SITE_SETTINGS_QUERY = `
*[_type == "siteSettings" && !(_id in path("drafts.**"))] | order(_id asc)[0]{
  siteTitle,
  siteTagline,
  siteUrl,
  defaultSeoTitle,
  defaultSeoDescription,
  defaultOgImage{alt, asset->{url}},
  socialLinks[]{label, url},
  contactUrl,
  contactLabel
}
`;

const POST_PROJECTION = `{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  updatedAt,
  body[]{..., asset->{url}},
  coverImage{alt, asset->{url}},
  "categories": coalesce(categories[]->{_id, name, "slug": slug.current, description}, []),
  "tags": coalesce(tags[]->{_id, name, "slug": slug.current, description}, []),
  "author": author->{
    _id,
    _type,
    name,
    "slug": slug.current,
    role,
    bio,
    avatar{alt, asset->{url}},
    links[]{label, url}
  },
  seoTitle,
  seoDescription,
  ogImage{alt, asset->{url}}
}`;

export const POSTS_QUERY = `
*[_type == "post" && defined(slug.current) && defined(publishedAt) && !(_id in path("drafts.**"))]
  | order(publishedAt desc) ${POST_PROJECTION}
`;

export const POST_BY_SLUG_QUERY = `
*[_type == "post" && slug.current == $slug && defined(publishedAt) && !(_id in path("drafts.**"))][0]
${POST_PROJECTION}
`;

export const CATEGORIES_QUERY = `
*[_type == "category" && defined(slug.current) && !(_id in path("drafts.**"))] | order(name asc){
  _id, name, "slug": slug.current, description
}
`;

export const STAFF_QUERY = `
*[_type == "staff" && !(_id in path("drafts.**"))] | order(name asc){
  _id, name, "slug": slug.current, role, bio,
  avatar{alt, asset->{url}},
  links[]{label, url}
}
`;

export const SERVICE_PAGE_BY_KIND_QUERY = `
*[_type == "servicePage" && kind == $kind && !(_id in path("drafts.**"))]
  | order(_id asc)[0]{
    _id, kind, title, body[]{..., asset->{url}},
    heroImage{alt, asset->{url}}, seoTitle, seoDescription, ogImage{alt, asset->{url}}
  }
`;

// Temporary compatibility for existing /tags/ routes during Issue #4 migration.
export const TAGS_QUERY = `
*[_type == "tag" && defined(slug.current) && !(_id in path("drafts.**"))] | order(name asc){
  _id, name, "slug": slug.current, description
}
`;
