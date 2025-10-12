import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from '@heroicons/react/24/solid';

const Reviews = () => {
  const { t } = useTranslation();
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const reviews = [
    {
      text: t('reviews.review1', 'GoogleMentor transformed our trip to Greece! The curated maps helped us discover hidden gems and authentic tavernas we would never have found on our own. Absolutely incredible experience!'),
      author: t('reviews.author1', 'Maria P.'),
      rating: 5,
      location: t('reviews.location1', 'Athens, Greece'),
      date: t('reviews.date1', 'March 2024'),
    },
    {
      text: t('reviews.review2', 'The reI’ve discovered so many amazing places I didn’t even know existed. Now I’m hooked and exploring everything on the Italian restaurants list!'),
      author: t('reviews.author2', 'Pantelis K.'),
      rating: 5,
      location: t('reviews.location2', 'Santorini, Greece'),
      date: t('reviews.date2', 'February 2024'),
    },
    {
      text: t('reviews.review3', 'As a food lover, I was blown away by the quality of restaurants GoogleMentor recommended. Each one felt like a local secret. Thank you for making our honeymoon unforgettable!'),
      author: t('reviews.author3', 'Sophie C.'),
      rating: 5,
      location: t('reviews.location3', 'Mykonos, Greece'),
      date: t('reviews.date3', 'January 2024'),
    },
    {
      text: t('reviews.review4', 'The maps are incredibly detailed and accurate. We felt like locals navigating through Greece. Best travel resource we have ever used!'),
      author: t('reviews.author4', 'Andreas M.'),
      rating: 5,
      location: t('reviews.location4', 'Crete, Greece'),
      date: t('reviews.date4', 'December 2023'),
    },
  ];

  // Auto-advance reviews every 6 seconds
  useEffect(() => {
    if (!isAutoPlaying || reviews.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, reviews.length]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentReviewIndex((prev) => {
      const newIndex = (prev - 1 + reviews.length) % reviews.length;
      return newIndex;
    });
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentReviewIndex((prev) => {
      const newIndex = (prev + 1) % reviews.length;
      return newIndex;
    });
  };

  const handleDotClick = (index: number) => {
    if (index >= 0 && index < reviews.length) {
      setIsAutoPlaying(false);
      setCurrentReviewIndex(index);
    }
  };

  const renderStars = (rating: number) => {
    const validRating = Math.min(Math.max(rating || 0, 0), 5); // Ensure rating is between 0-5
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        className={`w-5 h-5 ${
          index < validRating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const currentReview = reviews[currentReviewIndex];

  // Early return if no reviews or no current review
  if (!reviews.length || !currentReview) {
    return null;
  }

  return (
    <section className="py-16 lg:py-20 bg-gray-50" id="reviews">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 font-primary tracking-tight">
            {t('reviews.title', 'What Travelers Say')}
          </h2>
          <p className="text-lg text-gray-600 font-secondary max-w-2xl mx-auto">
            {t('reviews.subtitle', 'Real experiences from travelers who discovered Greece with our curated guides')}
          </p>
        </div>

        {/* Reviews Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main Review Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 border border-gray-100 overflow-hidden">
            {/* Quote Mark */}
            <div className="absolute top-6 left-6 text-6xl text-[#0878fe]/10 font-serif leading-none">
              "
            </div>
            
            <div className="relative z-10">
              {/* Stars */}
              <div className="flex justify-center mb-6">
                <div className="flex space-x-1">
                  {renderStars(currentReview.rating)}
                </div>
              </div>

              {/* Review Text */}
              <blockquote className="text-center mb-8">
                <p className="text-lg lg:text-xl text-gray-700 leading-relaxed font-secondary italic">
                  "{currentReview.text}"
                </p>
              </blockquote>

              {/* Author Info */}
              <div className="text-center">
                <div className="inline-flex items-center space-x-4">
                  {/* Avatar Placeholder */}
                  <div className="w-12 h-12 bg-gradient-to-r from-[#0878fe] to-[#0053b8] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {currentReview.author?.charAt(0) || 'U'}
                  </div>
                  
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 font-primary">
                      {currentReview.author}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 font-secondary">
                      <span>📍 {currentReview.location}</span>
                      <span>•</span>
                      <span>{currentReview.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#0878fe] hover:bg-blue-50 transition duration-300 group"
            aria-label={t('reviews.previousReview', 'Previous review')}
          >
            <ChevronLeftIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#0878fe] hover:bg-blue-50 transition duration-300 group"
            aria-label={t('reviews.nextReview', 'Next review')}
          >
            <ChevronRightIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-8 space-x-3">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentReviewIndex
                  ? 'bg-[#0878fe] w-8'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={t('reviews.goToReview', `Go to review ${index + 1}`)}
            />
          ))}
        </div>

        {/* Stats
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-3xl font-bold text-[#0878fe] font-primary mb-2">
              {t('reviews.stats.happyTravelers', '10,000+')}
            </div>
            <p className="text-gray-600 font-secondary text-sm">
              {t('reviews.stats.happyTravelersLabel', 'Happy Travelers')}
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-3xl font-bold text-[#0878fe] font-primary mb-2">
              {t('reviews.stats.destinations', '50+')}
            </div>
            <p className="text-gray-600 font-secondary text-sm">
              {t('reviews.stats.destinationsLabel', 'Destinations')}
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-3xl font-bold text-[#0878fe] font-primary mb-2">
              {t('reviews.stats.rating', '4.9')}
            </div>
            <p className="text-gray-600 font-secondary text-sm">
              {t('reviews.stats.ratingLabel', 'Average Rating')}
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-3xl font-bold text-[#0878fe] font-primary mb-2">
              {t('reviews.stats.maps', '200+')}
            </div>
            <p className="text-gray-600 font-secondary text-sm">
              {t('reviews.stats.mapsLabel', 'Curated Maps')}
            </p>
          </div>
        </div> */}

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 font-secondary mb-6">
            {t('reviews.cta.text', 'Ready to create your own Greek adventure?')}
          </p>
          <a
            href="#maps"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#0878fe] to-[#0053b8] text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            {t('reviews.cta.button', 'Explore Our Maps')}
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5-5 5M6 12h12"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Reviews;