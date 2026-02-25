'use client';

function Loading() {
  return (
    <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center">
      <div className="w-16 h-16 border-2 border-dashed rounded-full animate-spin border-red-500"></div>
    </div>
  );
}

export default Loading;
