import React from "react";

function Footer() {
  return (
    <div className="flex items-center justify-center h-16">
      <p>© {new Date().getFullYear()} Netflix Clone. All rights reserved.</p>
    </div>
  );
}

export default Footer;
