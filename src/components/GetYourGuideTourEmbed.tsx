"use client";

import { useEffect, useRef } from "react";

interface GetYourGuideTourEmbedProps {
  productId: string;
  title?: string;
  description?: string;
}

const GetYourGuideTourEmbed = ({ 
  productId, 
  title = "Tour Details", 
  description 
}: GetYourGuideTourEmbedProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!document.querySelector('script[src*="widget.getyourguide.com"]')) {
      const script = document.createElement("script");
      script.async = true;
      script.defer = true;
      script.src = "https://widget.getyourguide.com/dist/pa.umd.production.min.js";
      script.setAttribute("data-gyg-partner-id", "V2LLO22");
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="gyg-widget-wrapper mb-8" aria-label={title}>
      <h3 className="sr-only">{title}</h3>
      {description && <p className="sr-only">{description}</p>}

      <div ref={containerRef} className="gyg-widget-container">
        <div
          data-gyg-href="https://widget.getyourguide.com/default/product.frame"
          data-gyg-product-id={productId}
          data-gyg-locale-code="en-US"
          data-gyg-widget="product"
          data-gyg-partner-id="V2LLO22"
          style={{ minHeight: '600px' }}
        ></div>
      </div>
    </div>
  );
};

export default GetYourGuideTourEmbed;
