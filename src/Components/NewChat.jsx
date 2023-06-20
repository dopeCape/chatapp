import React, { useState } from 'react';
import Close from '../ph_x-bold.svg';
import { useUserStore } from '../Stores/MainStore';

export default function NewChat({ close }) {
  let me = useUserStore(state => state.user);
  const [users, setUsers] = useState([]);
  const searchUsers = () => {
    try {
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full h-full rounded-[10px] bg-[#37393F] flex flex-col relative">
      <div className="text-white text-[24px] font-[700] mt-8 ml-10">Direct message</div>
      <div className="text-white ml-10 mt-6 font-[700] text-[18px]">To:</div>
      <img
        alt="close"
        src={Close}
        className=" absolute h-[22px]  w-[22px] right-[8%] top-[11%] cursor-pointer "
        onClick={() => {
          close();
        }}
      />
      <input
        type="text"
        className="bg-[#585B66] outline-none p-4 rounded-[5px] w-[85%] ml-10 mt-3 text-white"
        placeholder="Search for person name"
      />
      <div className="absolute"></div>

      <div className="text-white ml-10 mt-3 font-[700] text-[18px]">Message:</div>
      <input
        type="text"
        className="bg-[#585B66] outline-none p-4 rounded-[5px] w-[85%] ml-10 mt-3 text-white"
        placeholder="Type your message"
      />
      <button className="bg-[#4D96DA] px-6 py-1 rounded-[5px] w-[80px] mt-8 absolute right-[8%] bottom-[10%] text-white font-[700]">
        Send
      </button>
    </div>
  );
}
