import React, { useState } from 'react';

const QASection = () => {
  const questionsAndAnswers = [
    {
      question: "What is Googlementor.com?",
      answer: "Googlementor.com is your go-to platform for expert advice on using Google Maps. We offer curated custom maps, tips and insights to help you navigate, explore and discover with ease."
    },
    {
      question: "What are custom maps?",
      answer: "Custom maps are curated collections of saved locations organized around a specific theme. They simplify your search, making it easier to discover and explore places that match your interests. You can save a map and then it will appear in your Google Maps with all the locations as emojis."
    },
    {
      question: "How can I request a custom Google Maps List?",
      answer: "It’s simple! Email us your request with the name of the List and the Country. Don’t forget to add 'I agree to googlementor.com terms' as the title of your email for a smooth process."
    },
    {
      question: "Are the Google Maps lists free?",
      answer: "Yes, all our curated Google Maps lists are currently available for free. However, if you’d like to support our work, you can do so through https://buymeacoffee.com/googlementor."
    },
    {
      question: "How do I use the custom Google Maps list I receive?",
      answer: "After receiving the link to your custom map, click it to open the map in Google Maps. From there, you can save it to your account for easy access on your devices. You will also receive directions via email."
    },
    {
      question: "How can I hide the custom map?",
      answer: "Select 'You' -> Click and expand the Saved tab -> Select the dots on the List you wish to hide ... -> Select 'Hide on your map' ✅"
    },
    {
      question: "How can I see the custom map?",
      answer: "Select 'You' -> Click and expand the Saved tab -> Select the dots on the List you wish to show ... -> Select 'Show on your map' ✅"
    },
    {
      question: "How often do you update the maps?",
      answer: "We strive to keep our maps current, regularly updating them with new locations and feedback from users like you."
    },
    {
      question: "Can I request multiple maps?",
      answer: "Yes, you can request as many maps as you need. Just include the list names in your email, and we’ll handle the rest."
    },
    {
      question: "Why should I buy insurance?",
      answer: "Travel insurance is essential for trips that involve adventure, remote locations or unpredictable conditions. Emergency medical expenses, trip interruptions or cancellations, lost or delayed baggage and adventure sports coverage are covered by SafetyWing."
    },
    {
      question: "Who can benefit from Googlementor.com?",
      answer: "Whether you’re a traveler, foodie or local explorer, Googlementor.com is designed for anyone looking to make the most out of Google Maps and discover amazing places tailored to their preferences."
    },
    {
      question: "Why is Airalo eSIM the cheapest reliable option?",
      answer: "Airalo offers cheap eSIM starting as low as $5 with no physical SIM card needed. It eliminates shipping and handling costs. They provide service in over 190 countries and have region plans so you can avoid getting multiple sims for different countries. You have instant activation that saves time and effort with seamless online setup."
    },
    {
      question: "How do I contact you for additional help?",
      answer: "You can reach us at mapsmentorinfo@gmail.com. We’re here to assist you with any questions or requests you have."
    },
    {
      question: "Are Google Maps lists secure?",
      answer: "Yes, Google protects your lists using robust security measures, including encryption. Additionally, your lists are tied to your Google account, which can be secured with two-factor authentication (2FA). If you are a creator, avoid including personal or sensitive details in public lists."
    },
    {
      question: "Can I delete a list if I no longer need it?",
      answer: "Yes, you can delete any list you’ve created at any time from your Google Maps account."
    }
  ];
    // Add more questions and answers here;
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
      setActiveIndex(activeIndex === index ? null : index);
    };

  return (
    <section className="bg-white py-16" id="qa-section">
      <div className="container mx-auto px-6 lg:px-8">
        <h2 className="text-5xl font-extrabold text-center text-gray-900 mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {questionsAndAnswers.map((qa, index) => (
            <div key={index} className="border-b border-gray-200">
              <button
                className="w-full text-left py-4 px-6 text-xl font-semibold text-gray-800 focus:outline-none"
                onClick={() => toggleAccordion(index)}
              >
                {qa.question}
                <span className="float-right">
                  {activeIndex === index ? '-' : '+'}
                </span>
              </button>
              {activeIndex === index && (
                <div className="px-6 pb-4 text-lg text-gray-700">
                  {qa.answer}
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