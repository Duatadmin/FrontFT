declare module 'react' {
  export const Fragment: any;
  export interface FC<P = {}> {
    (props: P): any;
  }
  export function createElement(...args: any[]): any;
  export function useState<T>(initial: T): [T, (v: T) => void];
  export function useEffect(...args: any[]): void;
}

declare module 'react/jsx-runtime' {
  export function jsx(...args: any[]): any;
  export function jsxs(...args: any[]): any;
  export const Fragment: any;
}

declare module 'lucide-react' {
  const icons: Record<string, any>;
  export default icons;
  export const Loader2: any;
  export const Dumbbell: any;
  export const Target: any;
  export const FileStack: any;
  export const CalendarDays: any;
  export const BarChart2: any;
  export const LineChart: any;
  export const Clock: any;
  export const Download: any;
  export const ChevronLeft: any;
  export const ChevronRight: any;
}
