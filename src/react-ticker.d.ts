declare module 'react-ticker' {
  import React from 'react';

  interface TickerProps {
    speed?: number;
    children: () => React.ReactNode;
  }

  const Ticker: React.FC<TickerProps>;
  export default Ticker;
}