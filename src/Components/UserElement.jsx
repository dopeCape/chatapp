import React, { useEffect, useState } from 'react';
import GroupSym from '../Frame 98.svg';
import {
  useChatStore,
  useGroupChatStore,
  useSelectedStore,
  useUserStore,
  useWorkSpaceStore
} from '../Stores/MainStore';
import { useSelectedChatStore } from '../Stores/MainStore';

export default function Useruser({
  user,

  type
}) {
  const updateProfile = useSelectedStore(state => state.updateSelectedState);
  const me = useUserStore(state => state.user);
  const chat = useChatStore(state => state.chats);
  const workspace = useWorkSpaceStore(state => state.workspace);
  const groupChat = useGroupChatStore(state => state.chats);
  const selectedChat = useSelectedChatStore(state => state.user);

  const setChat = useSelectedChatStore(state => state.updateChatState);
  const [fchat, fsetChat] = useState(null);

  const groupName = arr => {
    let name = 'Me';
    let count = 1;
    arr.forEach((element, index) => {
      if (count < 2) {
        if (element.user.user.id !== me.id) {
          name = name + ', ' + element.user.user.name;
          count = count + 1;
        }
        if (arr.length > 2 && count === 1) {
        }
      }
    });
    if (arr.length > 2) {
      name = name + ' +' + (arr.length - 2);
    }
    return name;
  };

  useEffect(() => {
    if (!user.groupChat) {
      let typing = chat.filter(x => {
        return x.friend.id === user.id && x.chat.workspaceId === workspace.id;
      });
      fsetChat(typing[0]);
    } else {
      let typing = groupChat.filter(x => {
        return x.id === user.id && x.groupChat.workspaceId === workspace.id;
      });
      fsetChat(typing[0]);
    }
  }, [chat, me, user, groupChat]);

  const handleSetProfile = () => {
    setChat(user);
    fsetChat({ ...fchat, unRead: 0 });
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
  return fchat ? (
    <div
      className="flex  relative pt-3 pb-2 "
      style={{
        background: `${selectedChat && (selectedChat.id === fchat.id || (fchat.friend && selectedChat.id === fchat.friend.id))
            ? '#4D96DA'
            : 'transparent'
          }`
      }}
      onClick={() => {
        handleSetProfile(user);
      }}
    >
      <div className="ml-9">
        {fchat.groupChat ? (
          fchat.groupChat.type === 'CHANNEL' ? (
            <i class="fa-solid fa-hashtag text-white"></i>
          ) : (
            <img alt="Gr" src={GroupSym} className="w-[20px] h-[20px]" />
          )
        ) : (
          <img alt={''} src={fchat.friend.user.profilePic} className="w-[20px] h-[20px] object-fit rounded-[2px]" />
        )}
      </div>

      <div className=" cursor-pointer  ml-2 text-[#fbfbfb] relative text-[16px]">
        {fchat.groupChat ? (
          <div className="relative bottom-1" style={{ fontWeight: `${fchat.unRead > 0 ? '900' : '400'}` }}>
            {fchat.groupChat.type === 'CHANNEL' ? (
              fchat.groupChat.name
            ) : (
              <div>{groupName(fchat.groupChat.groupChatRef)}</div>
            )}
          </div>
        ) : (
          <div className="relative bottom-1" style={{ fontWeight: `${fchat.unRead > 0 ? '900' : '400'}` }}>
            {fchat.friend.user.name}
          </div>
        )}
      </div>
      {fchat.unRead > 0 ? (
        fchat.unRead < 9 ? (
          <div className="w-[30px] h-[20px] bg-[#DA4D4D] text-white rounded-[14px]  flex flex-wrap justify-center content-center   absolute right-[20%]">
            {fchat.unRead}
          </div>
        ) : (
          <div className="w-[30px] h-[20px] bg-[#DA4D4D] text-white rounded-[14px]  flex flex-wrap justify-center content-center   absolute right-[20%]">
            9+
          </div>
        )
      ) : null}
    </div>
  ) : null;
}
