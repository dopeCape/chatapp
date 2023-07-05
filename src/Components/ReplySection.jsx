import React, { useEffect, useState } from 'react';

import FloatingVideoPlayer from './FloatingVideoPlayer';

import ReactPlayer from 'react-player';
import Cross from '../ph_x-bold.svg';

import Replay from '../solar_reply-linear.svg';
import { useUserStore } from '../Stores/MainStore';
import LinkHighlighter from './LinkHeilight';
import { FileIcon, defaultStyles } from 'react-file-icon';

export default function ReplaySection({ msg, replySetter }) {
  const [time, setTime] = useState('');
  const [imgOpen, setImgOpen] = useState(false);
  const me = useUserStore(state => state.user);
  useEffect(() => {
    let currentDate = new Date(msg.createdAt);
    let hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const amOrPm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12;
    const formattedTime = `${hours}:${minutes} ${amOrPm}`;
    setTime(formattedTime);
  }, []);
  return (
    <div className="w-full h-full text-white flex flex-col relative">
      <div className="flex ml-5">
        <img src={Replay} className="w-[20px] h-[20px] mr-2" alt="Loading.." />
        <div>replying to </div>
        <div className="font-[700]  ml-1">{msg.from.id === me.id ? 'Yourself' : msg.from.name}</div>
        <div className="text-[#B4B4B4] ml-2 text-[12px] relative top-[1%] ">{time}</div>
      </div>
      <div className="ml-5 mt-2">
        {msg.type === 'MSG' ? (
          <div>
            <LinkHighlighter text_={msg.content} />
          </div>
        ) : msg.type === 'IMG' || msg.type === 'STICKER' ? (
          <img className="w-[120px] h-[120px] " alt="Loading..." src={msg.url} />
        ) : msg.type === 'VIDEO' ? (
          <div className="relative bottom-3 w-[300px] h-[200px] ">
            <div
              className="cursor-pointer"
              onClick={() => {
                setImgOpen(true);
              }}
            >
              <ReactPlayer url={msg.url} controls width="300px" height="200px" />
            </div>

            {imgOpen ? <FloatingVideoPlayer videoUrl={msg.url} close={setImgOpen} /> : null}
          </div>
        ) : msg.type === 'FILE' ? (
          <div className="w-[250px] h-[60px] rounded-[10px] flex border-[1px] border-[#616061] flex-wrap justify-start content-center  pl-3">
            <div className=" w-[30px]">
              <FileIcon extension={msg.content.split('.')[1]} {...defaultStyles[msg.content.split('.')[1]]} />
            </div>
            <div className="flex flex-col  ml-3 ">
              <div className="text-white font-[700] text-[14px] cursor-pointer">{msg.content}</div>
              <div className="text-[#B4B4B4]">{msg.content.split('.')[1]?.toUpperCase()}</div>
            </div>
          </div>
        ) : null}
      </div>
      <img
        className="absolute  top-[5%] w-[18px] h-[18px] right-[2%] cursor-pointer"
        alt="X"
        src={Cross}
        onClick={() => {
          replySetter(null);
        }}
      />
    </div>
  );
}
