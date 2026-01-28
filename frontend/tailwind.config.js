import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-8 py-6 border-t border-slate-100 text-center">
      <p className="text-sm text-slate-400">
        &copy; {new Date().getFullYear()} AutoDTR System. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;