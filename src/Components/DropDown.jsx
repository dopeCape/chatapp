import React, { useEffect, useState } from 'react';

import { useSelectedChatStore } from '../Stores/MainStore';
import Useruser from './UserElement';
import NewChat from './NewChat';
import styled from '@emotion/styled';
import Popup from 'reactjs-popup';
export default function DropDown({ heading, list, type }) {
  const selectedChat = useSelectedChatStore(state => state.user);
  const setChat = useSelectedChatStore(state => state.updateChatState);
  const [open, setOpen] = useState(true);
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
  const AddChatPopup = styled(Popup)`
    &-content {
      border: none;
      height: 400px;
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
        <div className="max-h-[80%] w-full flex  flex-col   ">
          {fchat.map((element, i) => {
            return <Useruser user={element} />;
          })}
        </div>
      ) : null}
      {type === 'friend' ? (
        <AddChatPopup
          modal
          position="center"
          closeOnDocumentClick={false}
          trigger={
            <div className="flex ml-5 mt-3 ">
              <button className="rounded-[5px] bg-[#85858526] h-[20px] w-[20px] ml-4 pt-1  flex flex-wrap content-center justify-center  ">
                <i class="fa-solid fa-plus text-white text-[12px]"></i>
              </button>
              <div className="text-white ml-2 cursor-pointer ">Add teammates</div>
            </div>
          }
        >
          {close => <NewChat close={close} />}
        </AddChatPopup>
      ) : null}
    </div>
  );
}
