import React, { useState } from 'react';

import Spinner from '../Spin-1s-200px.svg';
import { FileIcon, defaultStyles } from 'react-file-icon';

import ReactPlayer from 'react-player';

export default function DeleteMsgPopup({ msg, close, time, deleteFunc }) {
  const [deleting, setDeleting] = useState(false);
  return (
    <div className="w-full h-full rounded-[5px] flex flex-col text-white bg-[#37393F]">
      <div className="font-[700] ml-8 mt-8 text-[20px]">Delete message</div>
      <div className="text-[16px] ml-8 mt-4">Are you sure you want to delete this message? This cannot be undone</div>
      <div
        className={`w-[90%]  h-[${msg.type === 'MSG' ? '100px' : msg.type === 'IMG' ? '250px' : msg.type === 'FILE' ? '150px' : null
          }] border-[1px] border-[#585B66] ml-8 mt-5 rounded-[5px] flex `}
      >
        <img src={msg.from.profilePic} alt={msg.from.name} className={`w-[35px] h-[35px] mt-4 ml-3 rounded-[5px] `} />
        <div className="flex flex-col  ml-3 mt-4 ">
          <div className="flex ">
            <div className="font-[700]">{msg.from.name}</div>
            <div className="ml-1  text-[#B4B4B4] ">{time}</div>
          </div>
          {msg.type === 'MSG' ? (
            <div className="mt-1 ">{msg.content.length > 50 ? msg.content.slice(0, 50) + '...' : msg.content}</div>
          ) : msg.type === 'IMG' || msg.type === 'STICKER' ? (
            <img alt={msg.content} src={msg.url} className="w-[200px] h-[200px]" />
          ) : msg.type === 'VIDEO' ? (
            <div className="relative bottom-[5%]">
              <ReactPlayer url={msg.url} controls width="300px" height="200px" />
            </div>
          ) : msg.type === 'FILE' ? (
            <div className="w-[300px] h-[100px] flex rounded-[5px] border-[1px] border-[#585B66] justify-start  flex-wrap content-center">
              <div className="w-[50px] h-[50px] ml-5">
                <FileIcon extension={msg.content.split('.')[1]} {...defaultStyles[msg.content.split('.')[1]]} />
              </div>
              <div className="flex flex-col ml-3 mt-2  ">
                <div className="text-white font-[700] cursor-pointer">{msg.content}</div>
                <div className="text-[#B4B4B4]">{msg.content.split('.')[1]?.toUpperCase()}</div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <button
        className="border-[1px] bg-transparent border-[#4D96DA] absolute bottom-[10%] right-[25%] w-[80px] py-2 outline-none rounded-[5px] "
        onClick={() => {
          close();
        }}
      >
        Cancel
      </button>
      <button
        className=" bg-[#DA4D4D]  absolute bottom-[10%] right-[8%] w-[80px] py-2 outline-none  rounded-[5px] flex flex-wrap justify-center content-center border-[1px] border-transparent"
        onClick={async () => {
          setDeleting(true);
          await deleteFunc();

          setDeleting(false);
          close();
        }}
      >
        {deleting ? <img alt="loading.." src={Spinner} className="  h-[25px] w-[25px]" /> : 'Delete'}
      </button>
    </div>
  );
}
