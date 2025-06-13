import React from 'react';
import About from './About';

const Layout = ({ children }: { children: React.ReactNode }) => (
  <>
    {children}
    <About />
  </>
);

export default Layout;