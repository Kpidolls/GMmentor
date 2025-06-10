import React from 'react';
import { useTranslation } from 'react-i18next';

const Reviews = () => {
  const { t } = useTranslation();

  const reviews = [
    {
      text: t('reviews.review1'),
      author: t('reviews.author1'),
    },
    {
      text: t('reviews.review2'),
      author: t('reviews.author2'),
    },
    {
      text: t('reviews.review3'),
      author: t('reviews.author3'),
    },
    {
      text: t('reviews.review4'),
      author: t('reviews.author4'),
    },
  ];

  return (
    <section className="relative z-10 max-w-3xl mx-auto my-12 px-4">
      <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-2xl p-8 border border-white/40">
        <h2 className="text-2xl font-bold text-center mb-8 text-blue-900 drop-shadow">
          {t('reviews.title')}
        </h2>
        <div className="grid gap-8">
          {reviews.map((review, idx) => (
            <blockquote
              key={idx}
              className="relative bg-white/80 rounded-xl shadow p-6 text-gray-900 border-l-4 border-blue-400"
            >
              <p className="italic mb-4 text-lg leading-relaxed drop-shadow">
                “{review.text}”
              </p>
              <footer className="text-right font-semibold text-blue-700 drop-shadow">
                — {review.author}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;