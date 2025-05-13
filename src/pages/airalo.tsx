import Link from "next/link";
import { useTranslation } from "react-i18next";
import Header from "../components/Header";

export default function MobileDataPage() {
  const { t } = useTranslation();

  return (
    <main className="bg-gray-50 min-h-screen">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            {t("airalo.title", "Mobile Travel Data with Airalo")}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            {t(
              "airalo.subtitle",
              "Stay connected effortlessly while traveling with Airalo – the world’s first eSIM store."
            )}
          </p>
        </div>

        {/* Content Section */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Image */}
            <div className="flex justify-center">
              <Link
                href="https://www.airalo.com/profile/referral"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/assets/images/airalo.png" // Replace with your image path or URL
                  alt={t("airalo.imageAlt", "Airalo eSIM")}
                  className="w-full max-w-sm h-auto object-contain rounded-lg hover:opacity-90 transition"
                />
              </Link>
            </div>

            {/* Description */}
            <div className="space-y-6 text-gray-800 text-sm sm:text-base leading-relaxed">
              <p>
                {t(
                  "airalo.description",
                  "Avoid expensive roaming fees and the hassle of swapping SIM cards. With Airalo, you can easily download an eSIM for your destination and start browsing, navigating, and sharing your journey online as soon as you land."
                )}
              </p>

              {/* Promo Section */}
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-300">
                <p className="font-semibold text-base sm:text-lg text-gray-900">
                  💡 {t("airalo.promoTitle", "Get €3 off your first eSIM!")}
                </p>
                <p>
                  {t("airalo.promoDescription", "Use referral code")}{" "}
                  <span className="font-mono font-semibold text-blue-600">
                    GOOGLE4204
                  </span>{" "}
                  {t(
                    "airalo.promoInstruction",
                    "at checkout or click the link below."
                  )}
                </p>
              </div>

              {/* Call-to-Action Button */}
              <div className="text-center lg:text-left">
                <Link
                  href="https://www.airalo.com/profile/referral"
                  className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-full text-sm sm:text-base font-medium hover:bg-blue-700 transition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("airalo.ctaButton", "Get Your Airalo eSIM")}
                </Link>
              </div>

              {/* Disclaimer */}
              <p className="text-xs sm:text-sm text-gray-500 mt-6">
                {t(
                  "airalo.disclaimer",
                  "Airalo is a trusted solution used by millions of travelers worldwide. Ensure your phone supports eSIM before purchasing."
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
