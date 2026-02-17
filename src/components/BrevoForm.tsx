import React, { useState } from 'react';

const BrevoForm = () => {
  const [loadForm, setLoadForm] = useState(false);

  return (
    <div className="sib-form-container bg-blue-500 text-center">
      {!loadForm ? (
        <button
          type="button"
          onClick={() => setLoadForm(true)}
          className="inline-block bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          aria-label="Load newsletter signup form"
        >
          Newsletter Signup
        </button>
      ) : (
        <iframe
          title="Brevo Form"
          src="https://58191143.sibforms.com/serve/MUIFAI4MgNZhTZSION7Wrpz8cuXYPZValHET18fwovE7dTM_86tDsvNR_Yt8yeFSfo-SCLGVF4ExyTEQnziFTN3EQrQ-iUQs2qkBadTxuJ6hiMoO9I8nT86stw-g69pZzGI14Z6MAxae1E6y4ElAJpMVf8obclBkD_SuRug6i0K0hoEF0NsW-oq9jgfU9nhzFwZxBw8-TiTPHcpe"
          width="100%"
          height="600"
          loading="lazy"
          frameBorder="0"
          scrolling="auto"
          className="sib-form-iframe font-primary block mx-auto max-w-full"
          aria-label="Brevo Form"
        ></iframe>
      )}
    </div>
  );
};

export default BrevoForm;