import React, { useEffect, useRef, useState } from 'react';
import { instance } from '../axios';
import styled from '@emotion/styled';
import Popup from 'reactjs-popup';

import { useChatStore, useGroupChatStore, useUserStore, useWorkSpaceStore } from '../Stores/MainStore';
import DropDown from './DropDown';
import WorkSpaceMenu from './WorkspaceMenu';

export default function ChatSelector() {
  const [list, setList] = useState([]);
  const [back, setBack] = useState(false);
  let chatStore = useChatStore(state => state.chats);
  let groupStore = useGroupChatStore(state => state.chats);
  let me = useUserStore(state => state.user);
  let selectedWorkspace = useWorkSpaceStore(state => state.workspace);

  const [chat, setChat] = useState([]);
  const [group, setGroup] = useState([]);

  const [channel, setChannels] = useState([]);
  const [users, setUsers] = useState([]);
  useEffect(() => {
    let chat_ = [];
    let group_ = [];

    let channel_ = [];

    if (selectedWorkspace != null) {
      groupStore.forEach(x => {
        if (x.groupChat.workspaceId === selectedWorkspace.id) {
          if (x.groupChat.type === 'CHANNEL') {
            channel_.push(x);
          } else {
            group_.push(x);
          }
        }
      });
      chatStore.forEach(y => {
        if (y.chat.workspaceId === selectedWorkspace.id) {
          chat_.push(y.friend);
        }
      });

      setChat(chat_);
      setGroup(group_);
      setChannels(channel_);
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
  const [workspceOpen, setWorkSpaceOpen] = useState(false);
  const [groupError, setGroupError] = useState(null);
  const accessToken = localStorage.getItem('token');
  const [creating, setCreatin] = useState(false);
  const handleCreateGroup = async close => {
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
  const WorkspacePopup = styled(Popup)`
    &-overlay {
      background: rgba(0, 0, 0, 0.6);
    }
    &-content {
      border: none;
      height: 400px;
      padding: 0;
      width: 360px;
      border-radius: 10px;
      background: #616061;
    }
  `;
  return (
    <div className="w-full h-full flex  flex-col  bg-[#F9FBFC]  dark:bg-[#22252F]  ">
      {selectedWorkspace === null ? (
        <div className="w-full h-full flex flex-wrap justify-center content-center dark:text-white text-[24px]">
          Select a workspace
        </div>
      ) : (
        <div className="w-full h-full flex  flex-col  bg-[#2f3137]   ">
          <div className="   h-[9%] w-full flex    ml-1  ">
            <div
              className="text-[24px] text-[#F8F8F8] mt-3 ml-3 font-bold  cursor-pointer z-[100]  "
              onClick={() => {
                setWorkSpaceOpen(!workspceOpen);
              }}
            >
              {selectedWorkspace.name}
            </div>
            <i
              class="fa-solid fa-chevron-down mt-6 m-2 font-bold cursor-pointer text-[#F8F8F8] text-[14px] z-[100]"
              onClick={() => {
                setWorkSpaceOpen(!workspceOpen);
              }}
            ></i>
          </div>
          {workspceOpen ? (
            <div>
              <div className="w-[360px] h-[360px] absolute  z-[50] top-[8%]">
                <WorkSpaceMenu />
              </div>
              <div className="fixed bg-black w-screen h-screen top-0 left-0 bg-opacity-25"></div>
            </div>
          ) : null}
          <div className="w-full border-[1px] border-[#353B43] h-0 "></div>

          <div className="max-h-[33%] w-full ">
            <DropDown heading={'Channels'} list={channel} type={'channel'} />
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
