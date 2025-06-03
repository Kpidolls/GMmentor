// import Link from 'next/link';
import React from 'react';
import About from '../components/About'; 
import AboutUs from '../components/AboutUs';
import Analytics from '../components/Analytics';
import BrevoForm from '../components/BrevoForm';
import Canvas from '../components/Canvas';
import Header from '../components/Header';
import LazyShow from '../components/LazyShow';
import MainHero from '../components/MainHero';
import Product from '../components/Product';
import QASection from '../components/QASection';
import BackToTop from '../components/BackToTop';
import IslandList from '../components/IslandList';
import CategoryCards from '../components/CategoryCards';
import ProductShowcase from '../components/ProductShowcase';
import '../i18n';
// import { t } from 'i18next';


const App = () => {
  return (
    <div className="bg-background grid">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background">
        <Header />
      </div>
      <div className="relative bg-background overflow-hidden">
        <div className="max-w-full mx-auto">
          <div
            className="relative z-10 pb-8 bg-background sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32"
          >
            <MainHero />
            <CategoryCards />
          </div>
        </div>
      </div>
      <>
        <IslandList />
        <Canvas />
        <ProductShowcase />
        <Canvas />
        <Product />
        <Canvas />
      </>
      <AboutUs />
      <QASection />
      <BrevoForm />
      <LazyShow>
        <>
          <Canvas />
          <About />
        </>
      </LazyShow>
      <Analytics />
      <BackToTop />
    </div>
  );
};

export default App;
