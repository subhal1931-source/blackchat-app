// utils/utils.ts

/**
 * Creates a URL for a given page and optional query parameters.
 * @param pageName - Name of the page (like 'home' or 'ChatRoom')
 * @param params - Optional object of query parameters
 * @returns URL string
 */
export const createPageUrl = (pageName: string, params?: Record<string, string>) => {
  // Convert page name to lowercase for the URL
  let url = `/${pageName.toLowerCase()}`;

  // Add query parameters if provided
  if (params) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }

  return url;
};
