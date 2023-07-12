import React, { useState } from 'react';
import Spinner from '../Spin-1s-200px.svg';

import { instance } from '../axios';

import { useSelectedChatStore, useSelectedStore, useUserStore } from '../Stores/MainStore';
export default function DeleteUserPopup({ close, user, groupChat }) {
  const [removing, setRemoving] = useState(false);
  const groupChatREf = useSelectedChatStore(state => state.user);
  const me = useUserStore(state => state.user);
  const accessToken = localStorage.getItem('token');
  const handleRemove = async () => {
    let msgs = `${me.name} removed ${user.user.user.name}`;

    console.log(groupChatREf);
    let groupChatRefId = groupChatREf.groupChat.groupChatRef.filter(x => {
      return x.user.id === user.user.id;
    });
    try {
      setRemoving(true);
      await instance.post(
        '/gchat/remove',
        {
          userid: user.id,
          msg: msgs,
          userxid: user.user.user.id,
          groupId: groupChat.groupChat.id,
          groupChatRefId: groupChatRefId[0].id,
          name: user.user.user.name,
          groupName: groupChat.groupChat.name
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      setRemoving(true);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="w-full h-full bg-[#37393F] relative rounded-[10px]">
      <div className="font-[700] text-center text-white relative top-[10%] ">Remove {user.user.user.name}?</div>
      <div className="text-[14px] text-center  relative top-[15%] text-[#B4B4B4]">
        {user.user.user.name} will no longer be a member of marketing
      </div>
      <button
        className="absolute w-[100px] py-2 bg-transparent border-[1px] border-[#4D96DA] rounded-[5px] bottom-[10%] right-[55%] text-white"
        onClick={() => {
          close();
        }}
      >
        Cancel
      </button>

      <button
        className="absolute w-[100px] py-2   bg-[#DA4D4D] rounded-[5px] bottom-[10%] right-[20%] text-white flex flex-wrap justify-center content-center border-[1px] border-transparent"
        onClick={() => {
          handleRemove();
        }}
      >
        {removing ? <img className="w-[25px] h-[25px] " alt="loading.." src={Spinner} /> : 'Remove'}
      </button>
    </div>
  );
}
