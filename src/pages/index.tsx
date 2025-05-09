
//  import Link from 'next/link';
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
import MyTicker from '../components/Ticker';
import Store from '../components/Store';
import BackToTop from '../components/BackToTop';
import IslandList from '../components/IslandList';
import CategoryCards from '../components/CategoryCards';
import '../i18n';

const App = () => {
  return (
    <div className={`bg-background grid gap-y-8 overflow-hidden`}>
      <div className="relative z-50">
        <MyTicker />
      </div>
      <div className={`relative bg-background`}>
        <div className="max-w-full mx-auto">
          <div
            className={`relative z-10 pb-8 bg-background sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32`}>
            <Header />
            <MainHero />
            <CategoryCards />
          </div>
        </div>
            </div>
      <Canvas />
      <LazyShow>
        <>
          <Product />
          <IslandList />
          <Canvas />
        </>
      </LazyShow>
      <LazyShow>
        <>
          <Store />
          <Canvas />
        </>
      </LazyShow>
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
