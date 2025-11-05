import React from 'react';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const baseClasses = "animate-pulse rounded-md bg-neutral-800";
  const combinedClasses = [baseClasses, className].filter(Boolean).join(' ');

  return (
    <div
      className={combinedClasses}
      {...props}
    />
  );
}

export { Skeleton };
