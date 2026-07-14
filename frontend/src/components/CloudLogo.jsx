import React from 'react';

const CloudLogo = ({ width = 40, height = 40, color = "#007BFF" }) => {
  return (
    <div style={{ fontSize: `${width}px`, display: 'inline-block' }}>
      ☁️
    </div>
  );
};

export default CloudLogo;