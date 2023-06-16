import React, { useEffect, useState } from 'react';
import { AvatarGroup } from '@mui/material';
import { Avatar } from '@mui/material';
import {
  useChatStore,
  useGroupChatStore,
  useSelectedStore,
  useUserStore,
  useWorkSpaceStore
} from '../Stores/MainStore';
import { useSelectedChatStore } from '../Stores/MainStore';

export default function UserElement({
  user,

  type
}) {
  const updateProfile = useSelectedStore(state => state.updateSelectedState);
  const me = useUserStore(state => state.user);
  const chat = useChatStore(state => state.chats);
  const workspace = useWorkSpaceStore(state => state.workspace);
  const groupChat = useGroupChatStore(state => state.chats);

  const setChat = useSelectedChatStore(state => state.updateChatState);
  const [fchat, fsetChat] = useState(null);

  useEffect(() => {
    if (type === 'friend') {
      let typing = chat.filter(x => {
        return x.friend.id === user.id && x.chat.workspaceId === workspace.id;
      });
      fsetChat(typing[0]);
    } else if (type === 'group') {
      let typing = groupChat.filter(x => {
        return x.id === user.id && x.groupChat.workspaceId === workspace.id;
      });
      console.log(typing);
      fsetChat(typing[0]);
    }
  }, [chat, me, user]);

  const handleSetProfile = () => {
    if (type === 'find') {
      setChat(user);
    } else if (type === 'group') {
      setChat(user);
      fsetChat({ ...fchat, unRead: 0 });
    } else {
      setChat(user);
      fsetChat({ ...fchat, unRead: 0 });
    }
  };
  const trunc = (s, w) => {
    if (s) {
      if (s.length > w) {
        return s.substring(0, w) + '...';
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
        <AvatarGroup
          total={user.groupChat.groupChatRef.length <= 3 ? user.groupChat.groupChatRef.length : 3}
          spacing="small"
        >
          {user.groupChat.groupChatRef.map(x => {
            return <Avatar alt={x.user.user.name} src={x.user.user.profilePic} />;
          })}
        </AvatarGroup>
      </div>
      <div
        className="flex flex-col  ml-4 mt-2 cursor-pointer justify-start  content-start max-w-[40%] w-[40%] max-h-[80%] h-[80%]   "
        onClick={handleSetProfile}
      >
        <div className="font-bold text-9 dark:text-white mt-3 ml-2">{trunc(user.groupChat.name, 12)}</div>

        {fchat !== null ? (
          <div className="font-bold text-[14px] dark:text-[#909090]  mt-1 ml-2">
            {trunc(fchat.groupChat.msges.at(-1).content, 10)}
          </div>
        ) : null}
      </div>
      {fchat !== null ? (
        fchat.unRead > 0 ? (
          <div className="dark:text-white   rounded-full rounded-t-lg rounded-br-lg bg-blue-500 w-[30px] h-[30px] flex flex-wrap justify-around content-start absolute  right-[0%] top-[0%] ">
            {fchat.unRead > 9 ? '9+' : fchat.unRead}
          </div>
        ) : null
      ) : null}
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
            {fchat?.chat.typing ? 'typing..' : trunc(fchat?.chat.msges.at(-1).content, 18)}
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
