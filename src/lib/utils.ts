import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names and handles Tailwind CSS conflicts
 * Uses clsx for conditional classes and tailwind-merge to resolve conflicts
 * 
 * @param inputs - Class names to combine
 * @returns - Combined class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
