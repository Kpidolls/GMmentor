import { useState, useEffect } from 'react';
import config from '../config/index.json';

const MainHero = () => {
  const { mainHero } = config;

  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    // Set up an interval to change the text every 3 seconds
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % mainHero.primaryAction.text.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [mainHero.primaryAction.text.length]);

  return (
    <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-12 lg:mt-12 lg:px-8 xl:mt-12">
      <div className="sm:text-center lg:text-left">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-primary font-extrabold tracking-tight text-gray-900 leading-tight">
  <span className="block xl:inline">{mainHero.title}</span>{' '}
  <span className="block xl:inline text-blue-600 font-extrabold">
    {mainHero.subtitle}
  </span>
</h1>
        <p className="mt-3 text-base font-secondary text text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
          {mainHero.description}
        </p>
        <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
          <div className="rounded-md shadow">
            <a
              href={mainHero.primaryAction.href}
              className="w-full flex items-center justify-center px-8 py-3 sm:px-10 sm:py-4 border border-transparent text-base sm:text-lg font-bold rounded-md text-white font-primary bg-red-600 hover:bg-red-700 md:py-5 md:text-xl md:px-12 min-w-[350px]"
              aria-label={`Primary action: ${mainHero.primaryAction.text[currentTextIndex]}`}
            >
              {mainHero.primaryAction.text[currentTextIndex]}
            </a>
          </div>
          <div className="mt-3 sm:mt-0 sm:ml-3">
            <a
              href={mainHero.secondaryAction.href}
              className="w-full flex items-center justify-center font-secondary px-8 py-3 sm:px-10 sm:py-4 border border-[#0878fe] text-base sm:text-lg font-bold rounded-md text-[#0878fe] bg-white hover:bg-indigo-50 md:py-5 md:text-xl md:px-12 min-w-[200px]"
              aria-label={`Secondary action: ${mainHero.secondaryAction.text}`}
            >
              {mainHero.secondaryAction.text}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MainHero;