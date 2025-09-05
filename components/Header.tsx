
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
          AI Character Pose Generator
        </h1>
        <p className="mt-2 text-lg text-slate-400">
          Bring your characters to life. Upload an image, describe a pose, and let Nano Banana work its magic.
        </p>
      </div>
    </header>
  );
};

export default Header;
