import React, { useState } from 'react';

const QASection = () => {
  const questionsAndAnswers = [
    ,
    {
      question: "I haven’t received the list I requested. What should I do?",
      answer: "If you haven't received an email with the list you requested within a few minutes, please check your spam folder. Also, ensure that you sent the request from the correct email address. If the issue persists, feel free to contact us directly for further assistance."
    },
    {
      question: "What is googlementor.com?",
      answer: "Googlementor is your trusted platform for curated lists of maps and expert navigation support. We provide tailored advice, practical tips, and fun insightful guidance to help you explore, discover and make the most out of Google Maps."
    },
    {
      question: "What are Googlementor lists?",
      answer: "Googlementor lists are curated collections of saved locations organized around a specific theme. They simplify your search, making it easier to discover and explore places that match your interests. Once saved, you can find them in Google Maps under the 'You' tab -> 'Lists that you saved. In Google Maps at the bottom center of your screen, 'You' tab -> under 'Lists that you saved'."
    },
    {
      question: "How can I request a Googlementor list for Google Maps?",
      answer: "It’s simple! Email us your request with the name of the list and the Country. Be sure to include 'I agree to googlementor.com terms' as the title of your email for a smooth process."
    },
    {
      question: "Are the Google Maps lists free?",
      answer: "Yes, all our curated Google Maps lists are currently available for free. However, if you’d like to support our work, you can do so at https://buymeacoffee.com/googlementor."
    },
    {
      question: "How do I use the Google Maps list I receive?",
      answer: "After receiving the link to your list, click it to open in Google Maps. From there, save it to your account. After saving the list, you can access it by selecting the 'You' tab at the bottom center of your screen -> under 'Lists that you saved'"
    },
    {
      question: "How can I hide the list?",
      answer: "Go to the 'You' tab -> Click 'Saved' -> Find the list you want to hide, tap the three dots (...), and select 'Hide on your map.' ✅"
    },
    {
      question: "How can I see the list in my Google Maps app?",
      answer: "Go to the 'You' tab -> Click 'Saved' -> Find the list you want to show, tap the three dots (...), and select 'Show on your map.' ✅"
    },
    {
      question: "How often do you update the lists?",
      answer: "We strive to keep our lists current, regularly updating them with new locations and feedback from users like you."
    },
    {
      question: "Can I request multiple maps?",
      answer: "Yes, you can request as many maps as you need. Just include the list names in your email and we’ll handle the rest."
    },
    {
      question: "Why should I buy insurance?",
      answer: "Travel insurance is essential for challenging  trips involving adventure, remote destinations or unpredictable circumstances. SafetyWing provides coverage for emergency medical expenses, trip interruptions or cancellations, lost or delayed baggage and even adventure sports activities. Prepare for unexpected situations with thorough trip planning."
    },
    {
      question: "Who can benefit from googlementor.com?",
      answer: "Whether you’re a traveler, foodie or local explorer, googlementor.com is designed for anyone looking to make the most out of Google Maps and discover amazing places."
    },
    {
      question: "Why buy an eSIM when my mobile contract already includes roaming?",
      answer: "eSIMs are a convenient and cost-effective alternative to traditional SIM cards. They often provide lower costs, better connectivity, and faster speeds by connecting directly to local networks. eSIMs are also ideal for areas where your provider has limited coverage, ensuring reliable and seamless connectivity throughout your trip."
    },
    {
      question: "Why is Airalo eSIM the cheapest reliable option?",
      answer: "Airalo offers cheap eSIMs, starting from $5 with no physical SIM card needed. It eliminates shipping and handling costs. They provide service in over 190 countries and have regional plans for neighboring countries so you can avoid getting multiple sims for different countries. Activation is instant, saving you time and effort with an easy online setup."
    },
    {
      question: "How do I contact you for additional help?",
      answer: "You can reach us at mapsmentorinfo@gmail.com. We’re here to assist you with any any questions or requests."
    },
    {
      question: "Are Google Maps lists secure?",
      answer: "Yes, Google protects your lists with robust security measures, including encryption. Additionally, your lists are tied to your Google account, which can be secured with two-factor authentication (2FA). If you are a creator, avoid including personal or sensitive details in public lists."
    },
    {
      question: "Can I delete a list if I no longer need it?",
      answer: "Yes, you can delete any list you’ve created at any time from your Google Maps account. Simply open the list, click the three dots in the top right corner, and select 'Delete list'."
    },
    {
      question: "How does the 'Request' button work?",
      answer: "When you press the 'Request' button, it opens your default email app to send an email to us with the subject line specifying the 'Googlementor list' you are requesting. The email helps us identify your request and send you the relevant list. To use the 'Request' button effectively, ensure your default email app is set up. For Windows -> Go to Settings > Apps > Default Apps. Scroll down to Email and choose your preferred app (e.g., Outlook, Gmail). For Mac -> Open the Mail app > Go to Mail > Preferences. Under the General tab, set your default email app. For iOS (iPhone/iPad) -> Go to Settings > Apps > Default Apps > Email and select your preference (e.g., Gmail). For Android (Samsung, Google Pixel, etc.) -> Go to Settings > Apps > Default Apps > Select Email and choose your preferred app.",
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
                {qa && qa.question}
                <span className="float-right">
                  {activeIndex === index ? '-' : '+'}
                </span>
              </button>
              {activeIndex === index && (
                <div className="px-6 pb-4 text-lg text-gray-700">
                  {qa && qa.answer}
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