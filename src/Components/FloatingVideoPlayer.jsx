import React from 'react';
import ReactPlayer from 'react-player';
import Cross from '../ph_x-bold.svg';

const FloatingVideoPlayer = ({ videoUrl, close }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-[60%] bg-black z-[100]">
      <div className="relative w-[36.3%] h-[40%] bg-white shadow-md rounded-lg">
        <img
          src={Cross}
          alt="X"
          className="fixed right-[32%] top-[26%] w-[30px] h-[30px] cursor-pointer "
          onClick={() => {
            close(false);
          }}
        />

        <div className="relative w-full h-full">
          <ReactPlayer url={videoUrl} controls width="100%" height="100%" />
        </div>
      </div>
    </div>
  );
};

export default FloatingVideoPlayer;
