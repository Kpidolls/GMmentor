import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function MobileDataPage() {
  const { t } = useTranslation();

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 text-neutral-800">
      {/* Return to Home Link */}
      <div className="mb-6">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 text-lg font-medium transition duration-300"
        >
          ← {t("airalo.returnHome", "Return to Home")}
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {t("airalo.title", "Mobile Travel Data with Airalo")}
        </h1>
        <p className="text-lg text-gray-600">
          {t(
            "airalo.subtitle",
            "Stay connected effortlessly while traveling with Airalo – the world’s first eSIM store."
          )}
        </p>
      </div>
      <div className="relative bg-gray-100 p-6 rounded-xl shadow-md border border-gray-200">
        <Link
          href="https://www.airalo.com/profile/referral"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/assets/images/airalo.png" // Replace with your image path or URL
            alt={t("airalo.imageAlt", "Airalo eSIM")}
            className="w-full h-64 object-cover rounded-lg mb-6 hover:opacity-90 transition"
          />
        </Link>
        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            {t(
              "airalo.description",
              "Avoid expensive roaming fees and the hassle of swapping SIM cards. With Airalo, you can easily download an eSIM for your destination and start browsing, navigating, and sharing your journey online as soon as you land."
            )}
          </p>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-300">
            <p className="font-semibold text-lg">
              💡 {t("airalo.promoTitle", "Get €3 off your first eSIM!")}
            </p>
            <p>
              {t(
                "airalo.promoDescription",
                "Use referral code"
              )}{" "}
              <span className="font-mono font-semibold">GOOGLE4204</span>{" "}
              {t("airalo.promoInstruction", "at checkout or click the link below.")}
            </p>
          </div>
          <div className="text-center">
            <Link
              href="https://www.airalo.com/profile/referral"
              className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-full text-lg hover:bg-blue-700 transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("airalo.ctaButton", "Get Your Airalo eSIM")}
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            {t(
              "airalo.disclaimer",
              "Airalo is a trusted solution used by millions of travelers worldwide. Ensure your phone supports eSIM before purchasing."
            )}
          </p>
        </div>
      </div>
    </main>
  );
}
