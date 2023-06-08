import React from 'react';

const ImageLoader = ({ src }) => {
  const handleImageLoad = event => {
    event.target.classList.add('loaded');
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        className="loading-bar"
        style={{
          width: '100%',
          height: '4px',
          backgroundColor: 'gray',
          position: 'absolute',
          top: 0,
          left: 0,
          transition: 'width 0.3s ease-in-out'
        }}
      ></div>
      <img
        src={src}
        alt="Loaded "
        className="loaded-image"
        style={{
          opacity: 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
        onLoad={handleImageLoad}
      />
    </div>
  );
};

export default ImageLoader;
