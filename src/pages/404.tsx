import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

const NotFoundPage = () => {
  const { t } = useTranslation();
  const title = t('notFound.title', 'We could not find that page');
  const description = t('notFound.description', 'The address may have changed or may not exist. Search for a place or return to the homepage.');

  return (
    <>
      <Head>
        <title>{`${title} | Googlementor`}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="noindex, follow" />
      </Head>
      <section className="flex min-h-[65vh] items-center px-5 py-16">
        <div className="mx-auto w-full max-w-2xl">
          <p className="mb-3 text-sm font-semibold text-teal-800">Googlementor</p>
          <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">{title}</h1>
          <p className="mb-8 max-w-xl text-base leading-7 text-gray-600">{description}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="rounded-md bg-teal-800 px-5 py-3 font-semibold text-white hover:bg-teal-900">
              {t('notFound.home', 'Go to homepage')}
            </Link>
            <Link href="/search" className="rounded-md border border-gray-300 px-5 py-3 font-semibold text-gray-800 hover:bg-gray-100">
              {t('notFound.search', 'Search places')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default NotFoundPage;