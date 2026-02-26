import React from 'react';

const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 px-10">
      {children}
    </div>
  );
};

export default Container;
