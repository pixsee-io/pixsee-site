import React, { ReactNode } from "react";

interface ContainerProps {
  className?: string;
  children: ReactNode;
}

const Container = ({ className, children }: ContainerProps) => {
  return (
    <div className={`max-w-screen-2xl px-3 sm:px-5 mx-auto ${className}`}>
      {children}
    </div>
  );
};

export default Container;
