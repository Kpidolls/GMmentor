import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import questionsAndAnswers from '../data/questionsAndAnswers.json'; // Import the JSON file

const QASection = () => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="bg-white py-16" id="qa-section">
      <div className="container mx-auto px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 text-center tracking-tight drop-shadow-lg">
          {t('qa.title')}
        </h2>
        <div className="space-y-4">
          {questionsAndAnswers.map((qa, index) => (
            <div key={index} className="border-b border-gray-200">
              <button
                className="w-full text-left py-4 px-6 text-xl font-semibold font-secondary text-gray-800 focus:outline-none"
                onClick={() => toggleAccordion(index)}
              >
                {t(qa.question)}
                <span className="float-right">
                  {activeIndex === index ? '-' : '+'}
                </span>
              </button>
              {activeIndex === index && (
                <div
                  id={`qa-answer-${index}`}
                  className="px-6 pb-4 text-gray-700 font-secondary leading-relaxed"
                >
                  {t(qa.answer)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QASection;