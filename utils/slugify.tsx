// utils/slugify.ts
export const slugify = (text: string): string => {
  if (!text) return '';

  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Spaces to dashes
    .replace(/[^\w\-]+/g, '')       // Remove non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple dashes
    .replace(/^-+/, '')             // Trim dash from start
    .replace(/-+$/, '');            // Trim dash from end
};

export const deslugify = (slug: string): string => {
  if (!slug) return '';

  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};