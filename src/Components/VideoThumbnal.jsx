import React from 'react';
import VideoThumbnail from 'react-video-thumbnail';

const Thumbnail = ({ videoUrl, width = 50, height = 50 }) => {
  return <VideoThumbnail videoUrl={videoUrl} cors={true} width={width} height={height} />;
};

export default Thumbnail;
