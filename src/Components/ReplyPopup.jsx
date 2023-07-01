import React from 'react';
import Cross from '../ph_x-bold.svg';

export default function ReplyPopupC({ close, msg }) {
  return (
    <div className="w-full h-full flex flex-col relative  bg-[#37393F] text-white rounded-[10px]">
      <img
        src={Cross}
        alt="X"
        className="absolute w-[20px] h-[20px] right-[5%] top-[5%] cursor-pointer"
        onClick={() => {
          close();
        }}
      />
      <div className="ml-8 font-[700] mt-5">Replying to {msg.from.name}</div>
    </div>
  );
}
