import React from 'react';
import About from './About';
import PerformanceMonitor from './PerformanceMonitor';

const Layout = ({ children }: { children: React.ReactNode }) => (
  <>
    {children}
    <About />
    <PerformanceMonitor />
  </>
);

export default Layout;