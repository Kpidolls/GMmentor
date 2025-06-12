import React from 'react';
import Head from 'next/head';
import SearchPage from '../components/SearchPage';

const Search = () => {
  return (
    <>
      <Head>
        <link rel="canonical" href="https://googlementor.com/search" />
      </Head>
      <SearchPage />
    </>
  );
};

export default Search;