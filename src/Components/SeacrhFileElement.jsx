import React, { useState } from 'react';

import ImgsViewer from 'react-images-viewer';
import VideoThumbnail from './VideoThumbnal';

import { useUserStore } from '../Stores/MainStore';

import { FileIcon, defaultStyles } from 'react-file-icon';
import FloatingVideoPlayer from './FloatingVideoPlayer';
const getDateFromDateTime = d => {
  let date = new Date(d);
  let month = date.toLocaleString('default', { month: 'short' });

  let dateN = date.getDate();
  let year = date.getFullYear();
  return `${month} ${dateN}, ${year}`;
};
export default function SeachFileElement({ msg }) {
  const [imgOpen, setImgOpen] = useState(false);
  let me = useUserStore(state => state.user);
  return (
    <div className="flex mt-5 relative ">
      {msg.type === 'IMG' || msg.type === 'STICKER' ? (
        <div>
          <img
            src={msg.url}
            alt="loading.."
            className="w-[50px] h-[50px] rounded-[5px] cursor-pointer"
            onClick={() => {
              setImgOpen(true);
            }}
          />
          <ImgsViewer
            imgs={[{ src: msg.url }]}
            isOpen={imgOpen}
            onClose={() => {
              setImgOpen(false);
            }}
          />
        </div>
      ) : msg.type === 'VIDEO' ? (
        <div className="cursor-pointer max-w-[50px] max-h-[50px] overflow-hidden ">
          <div
            className="cursor-pointer w-[50px] h-[50px] overflow-hidden"
            onClick={() => {
              setImgOpen(true);
            }}
          >
            <VideoThumbnail videoUrl={msg.url} />
          </div>

          {imgOpen ? <FloatingVideoPlayer videoUrl={msg.url} close={setImgOpen} /> : null}
        </div>
      ) : msg.type === 'FILE' ? (
        <div className="">
          <div className="w-[35px] h-[35px] cursor-pointer ">
            <FileIcon extension={msg.content.split('.')[1]} {...defaultStyles[msg.content.split('.')[1]]} />
          </div>
        </div>
      ) : null}
      <div
        className="flex flex-col cursor-pointer"
        onClick={() => {
          setImgOpen(true);
        }}
      >
        <div className="text-white ml-2 font-[700]">{msg.content}</div>
        <div className="ml-2 text-[#B4B4B4]">{`Shared by ${msg.from.id === me.id ? 'me' : msg.from.name
          } on ${getDateFromDateTime(msg.createdAt)}`}</div>
      </div>
    </div>
  );
}
