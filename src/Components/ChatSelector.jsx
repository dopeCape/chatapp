import React, { useEffect, useRef, useState } from 'react';
import { instance } from '../axios';
import UserElement from './UserElement';
import { Checkbox } from '@mui/material';

import Loadingbar from '../Ellipsis-1.3s-200px(1).svg';
import { useChatStore, useGroupChatStore, useUserStore, useWorkSpaceStore } from '../Stores/MainStore';
import Popup from 'reactjs-popup';
import { search } from '../utils/helper.js';
import DropDown from './DropDown';

export default function ChatSelector() {
  const [list, setList] = useState([]);

  const [back, setBack] = useState(false);

  let me = useUserStore(state => state.user);
  let chatStore = useChatStore(state => state.chats);

  let groupStore = useGroupChatStore(state => state.chats);
  let selectedWorkspace = useWorkSpaceStore(state => state.workspace);

  const [chat, setChat] = useState([]);
  const [group, setGroup] = useState([]);
  const [users, setUsers] = useState([]);
  useEffect(() => {
    let chat_ = [];
    let group_ = [];

    if (selectedWorkspace != null) {
      groupStore.forEach(x => {
        if (x.groupChat.workspaceId === selectedWorkspace.id) {
          group_.push(x);
        }
      });
      chatStore.forEach(y => {
        if (y.chat.workspaceId === selectedWorkspace.id) {
          chat_.push(y.friend);
        }
      });

      setChat(chat_);
      setGroup(group_);
      console.log(group_);
    }
  }, [me, groupStore, chatStore, selectedWorkspace]);

  const searhRef = useRef();

  useEffect(() => {
    setBack(false);

    setList([]);
    if (searhRef.current?.value) {
      searhRef.current.value = '';
    }
  }, [selectedWorkspace]);

  const [selectedCheckboxes, setSelectedCheckboxes] = useState([
    { id: me.chatWorkSpaces.id, user: { id: me.id, name: me.name } }
  ]);

  let friendRef = useRef();
  const groupNameRef = useRef('');
  const [groupError, setGroupError] = useState(null);
  const accessToken = localStorage.getItem('token');
  const [creating, setCreatin] = useState(false);
  const handleCreateGroup = async close => {
    console.log(selectedCheckboxes, groupNameRef.current.value);
    if (groupNameRef.current.value === '') {
      setGroupError('name cannot be empty');
    } else {
      if (groupNameRef.current.value === 'general') {
        setGroupError('name cannot be general');
      } else {
        setCreatin(true);
        await instance.post(
          '/gchat/create',
          {
            workspaceId: selectedWorkspace.id,
            users: selectedCheckboxes,
            user: { id: me.id, name: me.name },
            name: groupNameRef.current.value
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );

        setCreatin(false);
        close();
      }
    }
  };
  return (
    <div className="w-full h-full flex  flex-col  bg-[#F9FBFC]  dark:bg-[#22252F]  ">
      {selectedWorkspace === null ? (
        <div className="w-full h-full flex flex-wrap justify-center content-center dark:text-white text-[24px]">
          Select a workspace
        </div>
      ) : (
        <div className="w-full h-full flex  flex-col  bg-[#2f3137]  ">
          <div className=" border-b-[2px] border-[#353b43] h-[9%] w-full flex ">
            <div className="text-[24px] text-[#F8F8F8] mt-3 ml-3 font-bold ">{selectedWorkspace.name}</div>
            <i class="fa-solid fa-chevron-down mt-6 m-2 font-bold cursor-pointer text-[#F8F8F8] text-[14px]"></i>
          </div>
          <div className="max-h-[33%] w-full ">
            <DropDown heading={'Channels'} list={group} type={'group'} />
          </div>
          <div className="max-h-[33%] w-full ">
            <DropDown heading={'Groups'} list={group} type={'group'} />
          </div>
          <div className="max-h-[33%] w-full">
            <DropDown heading={'Direct message'} list={chat} type={'friend'} />
          </div>
        </div>
      )}
    </div>
  );
}
