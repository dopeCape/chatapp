import React, { useEffect, useState } from 'react';

import { useSelectedChatStore } from '../Stores/MainStore';
import Useruser from './UserElement';
import NewChat from './NewChat';
import styled from '@emotion/styled';
import Popup from 'reactjs-popup';
import NewGroup from './NewGroup';
export default function DropDown({ heading, list, type }) {
  const selectedChat = useSelectedChatStore(state => state.user);
  const setChat = useSelectedChatStore(state => state.updateChatState);
  const [open, setOpen] = useState(true);
  const [addFriendOpen, setAddFriendOpen] = useState(false);

  const [createGroupOpen, setCreateGroupOpen] = useState(false);

  const [createChannelOpen, setCreateChannelOpen] = useState(false);

  const [create, setCreate] = useState(false);
  const [fchat, fsetChat] = useState(list);
  const handleSetProfile = (user, index) => {
    setChat(user);
    fchat.forEach((x, i) => {
      if (i === index) {
        // x.unRead = 0;
      }
    });
    fsetChat(fchat);
  };
  useEffect(() => {
    fsetChat(list);
  }, [list]);
  const CreateChannelPopup = styled(Popup)`
    &-content {
      border: none;
      height: 350px;
      padding: 0;
      width: 600px;
      border-radius: 10px;
    }
  `;

  const AddChatPopup = styled(Popup)`
    &-content {
      border: none;
      height: 300px;
      padding: 0;
      width: 600px;
      border-radius: 10px;
    }
  `;

  return (
    <div className="w-full h-full    mt-5 select-none">
      <div
        className="flex w-full cursor-pointer"
        onClick={() => {
          setOpen(!open);
        }}
      >
        {open ? (
          <i class="fa-solid fa-caret-up text-white mr-2 ml-5  relative top-1  "></i>
        ) : (
          <i class="fa-solid fa-sort-down text-white mr-2 ml-5  "></i>
        )}
        <div className="text-[15px]  text-[#fbfbfb] mb-1">{heading}</div>
      </div>
      {open ? (
        <div className="max-h-[80%] w-full flex  flex-col overflow-scroll   ">
          {fchat.map((element, i) => {
            return <Useruser user={element} />;
          })}
        </div>
      ) : null}
      {type === 'friend' ? (
        <div
          className="flex ml-4  "
          onClick={() => {
            setAddFriendOpen(true);
          }}
        >
          <button className="rounded-[5px] bg-[#85858526] h-[20px] w-[20px] ml-4 pt-1  flex flex-wrap content-center justify-center  ">
            <i class="fa-solid fa-plus text-white text-[12px]"></i>
          </button>
          <div className="text-white ml-2 cursor-pointer ">Add teammates</div>
        </div>
      ) : type === 'channel' ? (
        <div
          className="flex ml-4  "
          onClick={() => {
            setCreateChannelOpen(true);
          }}
        >
          <button className="rounded-[5px] bg-[#85858526] h-[20px] w-[20px] ml-4 pt-1  flex flex-wrap content-center justify-center  ">
            <i class="fa-solid fa-plus text-white text-[12px]"></i>
          </button>
          <div className="text-white ml-2 cursor-pointer ">Add Channel</div>
        </div>
      ) : type === 'group' ? (
        <div
          className="flex ml-4  "
          onClick={() => {
            setCreateGroupOpen(true);
          }}
        >
          <button className="rounded-[5px] bg-[#85858526] h-[20px] w-[20px] ml-4 pt-1  flex flex-wrap content-center justify-center  ">
            <i class="fa-solid fa-plus text-white text-[12px]"></i>
          </button>
          <div className="text-white ml-2 cursor-pointer ">Add Group</div>
        </div>
      ) : null}
      <CreateChannelPopup
        open={createChannelOpen}
        onClose={() => {
          setCreateChannelOpen(false);
        }}
        modal
        position="center"
        closeOnDocumentClick={false}
      >
        {close => <NewGroup close={close} type={'Channel'} />}
      </CreateChannelPopup>

      <CreateChannelPopup
        open={createGroupOpen}
        onClose={() => {
          setCreateGroupOpen(false);
        }}
        modal
        position="center"
        closeOnDocumentClick={false}
      >
        {close => <NewGroup close={close} type={'Group'} />}
      </CreateChannelPopup>
      <AddChatPopup
        modal
        position="center"
        open={addFriendOpen}
        onClose={() => {
          setAddFriendOpen(false);
        }}
        closeOnDocumentClick={false}
      >
        {close => <NewChat close={close} />}
      </AddChatPopup>
    </div>
  );
}
