import React, { useEffect } from 'react';

const BrevoForm = () => {
  useEffect(() => {
    // Only load the script if the form exists
    const form = document.getElementById('sib-form');
    if (form) {
      const script = document.createElement('script');
      script.src = 'https://sibforms.com/forms/end-form/build/main.js';
      script.async = true;
      script.onload = () => {
        // Defensive: ensure main.js does not throw if form is missing
        try {
          // If main.js exposes a function, you can call it here if needed
        } catch (e) {
          // Handle errors gracefully
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="sib-form-container bg-blue-500 text-center">
      <iframe
        title="Brevo Form"
        src="https://58191143.sibforms.com/serve/MUIFAI4MgNZhTZSION7Wrpz8cuXYPZValHET18fwovE7dTM_86tDsvNR_Yt8yeFSfo-SCLGVF4ExyTEQnziFTN3EQrQ-iUQs2qkBadTxuJ6hiMoO9I8nT86stw-g69pZzGI14Z6MAxae1E6y4ElAJpMVf8obclBkD_SuRug6i0K0hoEF0NsW-oq9jgfU9nhzFwZxBw8-TiTPHcpe"
        width="100%"
        height="600"
        frameBorder="0"
        scrolling="auto"
        className="sib-form-iframe font-primary block mx-auto max-w-full"
        aria-label="Brevo Form"
      ></iframe>
    </div>
  );
};

export default BrevoForm;