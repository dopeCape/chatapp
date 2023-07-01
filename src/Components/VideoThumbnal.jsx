import React from 'react';
import VideoThumbnail from 'react-video-thumbnail';

const Thumbnail = ({ videoUrl }) => {
  return (
    <div className="w-[50px] h-[50px] rounded-[5px] ">
      <VideoThumbnail videoUrl={videoUrl} cors={true} width={50} height={50} />
    </div>
  );
};

export default Thumbnail;
