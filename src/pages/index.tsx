
//  import Link from 'next/link';
import About from '../components/About'; 
import AboutUs from '../components/AboutUs';
import Analytics from '../components/Analytics';
import Canvas from '../components/Canvas';
import EsimProduct from '../components/EsimProduct';
import Features from '../components/Features';
import Header from '../components/Header';
import LazyShow from '../components/LazyShow';
import MainHero from '../components/MainHero';
import MainHeroImage from '../components/MainHeroImage';
import Mybusiness from '../components/Mybusiness';
import Product from '../components/Product';
import TravelInsurance from '../components/TravelInsurance'; 
import QASection from '../components/QASection'; 

const App = () => {
  return (
    <div className={`bg-background grid gap-y-16 overflow-hidden`}>
      <div className={`relative bg-background`}>
        <div className="max-w-7xl mx-auto">
          <div
            className={`relative z-10 pb-8 bg-background sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32`}
          >
            <Header />
            <MainHero />
          </div>
        </div>
        <MainHeroImage />
      </div>
      <Canvas />
      <LazyShow>
        <>
          <Product />
          <Canvas />
        </>
      </LazyShow>
      <LazyShow>
        <>
          <Features />
          <Mybusiness />
          <Canvas />
        </>
      </LazyShow>
      <EsimProduct />
      <LazyShow>
        <TravelInsurance />
      </LazyShow>
      <AboutUs />      
      <QASection /> 
      <LazyShow>
        <>
          <Canvas />
          <About />
        </>
      </LazyShow>
      <Analytics />
    </div>
  );
};

export default App;
