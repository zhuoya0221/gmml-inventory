// Configuration for both local development and GitHub Pages deployment
export const getBasePath = () => {
  return process.env.NODE_ENV === 'production' ? '/gmml-inventory' : '';
};

// Helper function for router navigation (router.push already handles basePath)
export const getRouterPath = (path: string) => {
  // Next.js router automatically handles basePath, so just return the path
  return path.startsWith('/') ? path : `/${path}`;
};

// Helper function for window.location (needs manual basePath handling)
export const getFullPath = (path: string) => {
  const basePath = getBasePath();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
};
