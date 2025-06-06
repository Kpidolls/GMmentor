"use client";
import { useEffect, useRef } from "react";

const GetYourGuideWidget = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!document.querySelector('script[data-gyg-partner-id="V2LLO22"]')) {
      const script = document.createElement("script");
      script.src = "https://widget.getyourguide.com/dist/pa.umd.production.min.js";
      script.async = true;
      script.defer = true;
      script.setAttribute("data-gyg-partner-id", "V2LLO22");
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="gyg-widget-container mb-8"
    >
      <div data-gyg-widget="auto" data-gyg-partner-id="V2LLO22"></div>
    </div>
  );
};

export default GetYourGuideWidget;