const BASE = import.meta.env.VITE_CF_IMG_BASE;

export const cfImg = (id: string): string => {
  if (!BASE) {
    console.warn(
      'VITE_CF_IMG_BASE is not defined in environment variables. Image URLs will be incorrect.'
    );
    // Fallback or throw error, depending on desired strictness
    return `/images/placeholder.svg`; // Or some other default/error indicator
  }
  return `${BASE}/${id}/public`;
};
