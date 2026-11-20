declare module '@thesvg/react/*' {
  const Icon: import('react').ComponentType<
    import('react').SVGProps<SVGSVGElement> & {
      size?: number | string;
      variant?: 'light' | 'dark' | string;
    }
  >;
  export default Icon;
}
