// src/components/auth/JarvisLogo.tsx
import React from 'react';
// Assuming vite-plugin-svgr or similar is configured for SVG imports as React components.
// Make sure the path to your Logo.svg is correct and vite-env.d.ts has SVG type declarations.
import LogoIcon from '../../assets/Logo.svg?react'; 

const JarvisLogo = (props: React.SVGProps<SVGSVGElement>) => {
  // The ?react query imports the SVG as a React component.
  // Pass through any props like className, width, height.
  return <LogoIcon {...props} />;
};

export default JarvisLogo;
