
export function getImageUrl(path) {
  if (!path) return '';
  
  if (
    path.startsWith('data:image/') || 
    path.startsWith('http://') || 
    path.startsWith('https://')
  ) {
    return path;
  }

  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const base = import.meta.env.BASE_URL || '/';
  
  return `${base === '/' ? '' : base}/${cleanPath}`.replace(/\/+/g, '/');
}