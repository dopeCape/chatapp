import React, { useState } from 'react';
import Close from '../ph_x-bold.svg';
import { useChatStore, useSelectedChatStore, useUserStore, useWorkSpaceStore } from '../Stores/MainStore';
import { simpleSearch } from '../utils/helper';

export default function NewChat({ close }) {
  let me = useUserStore(state => state.user);
  const [users, setUsers] = useState([]);
  const [seUser, setSeUser] = useState(null);
  const selectedWorkspace = useWorkSpaceStore(state => state.workspace);
  const setSelectedChat = useSelectedChatStore(state => state.updateChatState);
  const chatStore = useChatStore(state => state.chats);

  const searchUsers = e => {
    try {
      if (e.target.value !== '') {
        let FriendsInWorkspace = [];
        chatStore.forEach(y => {
          if (y.chat.workspaceId === selectedWorkspace.id) {
            FriendsInWorkspace.push(y.friend);
          }
        });
        FriendsInWorkspace.push(me.chatWorkSpaces);
        let notFriends = [];
        selectedWorkspace.chatWorkSpace.forEach(user => {
          let foundUser = FriendsInWorkspace.find(x => x.id === user.id);
          if (!foundUser) {
            notFriends.push(user);
          }
        });
        let x = searchUsernames(e.target.value, notFriends);
        setUsers(x);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const setChat = user => {
    try {
      setSeUser(user);
      setUsers([]);
    } catch (error) {
      console.log(error);
    }
  };
  const createChat = () => {
    try {
      setSelectedChat(seUser);
    } catch (error) {
      console.log(error);
    }
  };
  function searchUsernames(query, usernames) {
    const lowerQuery = query.toLowerCase();
    return usernames.filter(username => username.user.name.toLowerCase().includes(lowerQuery));
  }

  return (
    <div className="w-full h-full rounded-[10px] bg-[#37393F] flex flex-col relative ">
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
      {seUser ? (
        <div className="flex p-2 bg-[#4D96DA]  max-w-[40%] rounded-[5px] ml-8  relative">
          <img alt={seUser.user.name} src={seUser.user.profilePic} className="w-[25px] h-[25px] rounded-[2px]" />
          <div className="font-[700] text-white ml-2">{seUser.user.name}</div>
          <img
            src={Close}
            alt="close"
            className="absolute right-[10%] top-[30%] cursor-pointer"
            onClick={() => {
              setSeUser(null);
            }}
          />
        </div>
      ) : (
        <input
          type="text"
          className="bg-[#585B66] outline-none p-4 rounded-[5px] w-[85%] ml-10 mt-3 text-white"
          onChange={searchUsers}
          placeholder="Search for person name"
        />
      )}
      {users.length != 0 ? (
        <div className="w-[90%] max-h-[140px]  ml-6 mt-1 sticky   bg-[#585B66] rounded-[5px] overflow-scroll z-10">
          {users.map(x => {
            return (
              <div className="w-full flex mt-5  z-10 ">
                <img
                  alt={x.user.name}
                  src={x.user.profilePic}
                  className="w-[30px] h-[30px] rounded-[2px] ml-10  cursor-pointer "
                  onClick={() => {
                    setChat(x);
                  }}
                />
                <div
                  className="font-[700] text-[white] ml-3 text-[20px] cursor-pointer "
                  onClick={() => {
                    setChat(x);
                  }}
                >
                  {x.user.name}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <button
        className="bg-[#4D96DA] px-6 py-1 rounded-[5px] w-[80px] mt-8 absolute right-[8%] bottom-[10%] text-white font-[700] z-[1]"
        onClick={createChat}
      >
        Chat
      </button>
    </div>
  );
}
