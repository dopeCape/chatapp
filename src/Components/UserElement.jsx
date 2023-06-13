import React, { useEffect, useState } from 'react';
import { AvatarGroup } from '@mui/material';
import { Avatar } from '@mui/material';
import { useChatStore, useSelectedStore, useUserStore, useWorkSpaceStore } from '../Stores/MainStore';
import { useSelectedChatStore } from '../Stores/MainStore';

export default function UserElement({
  user,

  type
}) {
  const updateProfile = useSelectedStore(state => state.updateSelectedState);
  const me = useUserStore(state => state.user);
  const chat = useChatStore(state => state.chats);
  const workspace = useWorkSpaceStore(state => state.workspace);

  const setChat = useSelectedChatStore(state => state.updateChatState);
  const [fchat, fsetChat] = useState(null);

  useEffect(() => {
    if (type === 'friend') {
      let typing = chat.filter(x => {
        return x.friend.id === user.id && x.chat.workspaceId === workspace.id;
      });
      fsetChat(typing[0]);
      console.log(typing[0].unRead);
    }
  }, [chat, me, user]);

  const handleSetProfile = () => {
    if (type === 'find') {
      setChat(user);
    } else {
      setChat(user);
      fsetChat({ ...fchat, unRead: 0 });
    }
  };
  const trunc = s => {
    if (s) {
      if (s.length > 20) {
        return s.substring(0, 20) + '...';
      } else {
        return s;
      }
    }
  };
  return type === 'group' ? (
    <div
      className={`w-full h-[80px] bg-white flex flex-wrap mb-8 relative   rounded-2xl left-[5%] shadow-md dark:bg-[#16171B] dark:shadow-black cursor-pointer hover:bg-[#4d96da] dark:hover:bg-[#4D96Da] transition-colors`}
      onClick={handleSetProfile}
    >
      <div className="mt-5 ml-4">
        <AvatarGroup total={user.user.length <= 3 ? user.user.length : 3} spacing="small">
          {user.user.map(x => {
            return <Avatar alt={x.user.name} src={x.user.profilePic} />;
          })}
        </AvatarGroup>
      </div>
      <div className="font-bold text-[18px] dark:text-white mt-3 ml-3">{user.name}</div>
    </div>
  ) : (
    <div
      className={`w-full h-[80px] bg-white flex flex-wrap relative   rounded-2xl left-[5%] shadow-md dark:bg-[#16171B] dark:shadow-black cursor-pointer hover:bg-[#4d96da] dark:hover:bg-[#4D96Da] transition-colors mt-8`}
      onClick={handleSetProfile}
    >
      <img
        alt={user.user.name}
        src={user.user.profilePic}
        className="rounded-full h-[70%] mt-3 ml-5 cursor-pointer "
        onClick={handleSetProfile}
      />
      <div className="flex flex-col flex-wrap ml-4 mt-3 cursor-pointer  " onClick={handleSetProfile}>
        <div className="font-bold text-[18px] dark:text-white mt-1">{user.user.name}</div>
        {fchat != null && fchat.chat !== undefined ? (
          <div className="dark:text-[#909090] dark:hover:text-white">
            {fchat?.chat.typing ? 'typing..' : trunc(fchat?.chat.msges.at(-1).content)}
          </div>
        ) : null}
      </div>
      {type === 'friend' && fchat != null ? (
        fchat.unRead > 0 ? (
          <div className="dark:text-white mt-4  rounded-full bg-blue-500 w-[30px] h-[30px] flex flex-wrap justify-center content-center absolute  right-[10%] bottom-[30%] ">
            {fchat?.unRead > 9 ? '9+' : fchat?.unRead}
          </div>
        ) : null
      ) : null}
    </div>
  );
}
