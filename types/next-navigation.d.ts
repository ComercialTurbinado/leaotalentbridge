declare module 'next/navigation' {
  export function useRouter(): {
    push: (url: string) => void;
    replace: (url: string) => void;
    back: () => void;
    forward: () => void;
    refresh: () => void;
    prefetch: (url: string) => void;
  };
  
  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
  export function useParams(): { [key: string]: string | string[] };
  export function redirect(url: string): never;
  export function notFound(): never;
} 