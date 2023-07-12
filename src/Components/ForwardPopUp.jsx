import React, { useEffect, useState } from 'react';
import Spinner from '../Spin-1s-200px.svg';
import { instance } from '../axios';
import { storage } from '../firebase';
import { ref } from 'firebase/storage';
import { FileIcon, defaultStyles } from 'react-file-icon';

import Cross from '../ph_x-bold.svg';
import ReactPlayer from 'react-player';
import { useGroupChatStore, useUserStore, useWorkSpaceStore } from '../Stores/MainStore';
import LinkHighlighter from './LinkHeilight';
import { addUserIdToMentions, removeBracketsAndIDs } from '../utils/mention';
export default function ForwardPopUp({ close, msg, time }) {
  const me = useUserStore(state => state.user);
  const workspace = useWorkSpaceStore(state => state.workspace);
  const groupChats = useGroupChatStore(state => state.chats);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [renderList, setRenderList] = useState([]);
  const [foceusd, setFoucsed] = useState(false);
  const [selected, setSilicted] = useState(null);
  useEffect(() => {
    let chat = [];
    groupChats.forEach(x => {
      if (x.groupChat.workspaceId === workspace.id) {
        chat.push(x);
      }
    });
    me.chatWorkSpaces.Friend.forEach(x => {
      if (x.workspaceId === workspace.id) {
        chat.push(x);
      }
    });
    setRenderList(chat);
  }, []);
  const accessToken = localStorage.getItem('token');
  async function copyFile(url, destinationPath) {
    try {
      const sourceRef = ref().child(url);
      const destinationRef = ref().child(destinationPath);

      await sourceRef.getDownloadURL().then(async downloadUrl => {
        await destinationRef.putString(downloadUrl, 'data_url');
      });

      // Retrieve the URL of the copied file
      const copiedFileUrl = await ref(destinationPath).getDownloadURL();
      console.log('File copied successfully. Copied file URL:', copiedFileUrl);

      return copiedFileUrl;
    } catch (error) {
      console.error('Error copying file:', error);
      throw error;
    }
  }
  const handleSendMsg = async e => {
    let url = '';
    setUploading(true);
    if (msg.type === 'IMG' || msg.type === 'VIDEO' || msg.type === 'FILE') {
      // url = await copyFile(msg.url, msg.content);
      url = msg.url;
    }
    if (msg.type === 'STICKER') {
      url = msg.url;
    }
    if (selected.groupChat) {
      let to = selected.groupChat.groupChatRef.map(x => {
        return x.user.user.id;
      });
      let value = addUserIdToMentions(selected.groupChat.groupChatRef, removeBracketsAndIDs(msg.content), 'G');
      await instance.post(
        '/msges/newgroupmsg',
        {
          content: value,
          type: msg.type,
          from: me.id,
          url: url,
          forwarded: true,
          to: to,
          chatId: selected.groupChat.id,
          myChatRef: selected.id
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
    } else {
      let friend = selected.friend.user.chatWorkSpaces.Friend.filter(x => {
        return x.workspaceId === workspace.id;
      });
      let x = removeBracketsAndIDs(msg.content);

      let value = addUserIdToMentions([selected.friend], removeBracketsAndIDs(msg.content), 'C');
      await instance.post(
        '/msges/newmsg',
        {
          content: value,
          type: msg.type,
          url: url,
          from: me.id,
          forwarded: true,
          to: selected.friend.user.id,
          chatId: selected.chatId,
          friendId: friend[0].id
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
    }

    setUploading(false);
  };
  return (
    <div className="w-full h-full flex flex-col  bg-[#37393F] rounded-[10px] text-white relative">
      <div className="ml-8 mt-8 text-[20px] font-[700] ">Forward this message</div>
      <img
        alt="X"
        src={Cross}
        className=" cursor-pointer absolute right-[5%] top-[8%] w-[20px] h-[20px]"
        onClick={() => {
          close();
        }}
      />
      {selected ? (
        selected.groupChat ? (
          <div className="ml-8 py-1 text-white bg-[#4D96DA] rounded-[3px] flex px-1 flex-wrap justify-start content-center mt-5  w-auto max-w-[200px] relative ">
            <i class="fa-solid fa-hashtag text-white text-[15px] mt-1 "></i>
            <div className="ml-2">{selected.groupChat.name}</div>
            <img
              alt="X"
              src={Cross}
              className="w-[16px] h-[16px] absolute right-[10%] cursor-pointer mt-1 "
              onClick={() => {
                setSilicted(null);
              }}
            />
          </div>
        ) : (
          <div className="ml-8 py-1 text-white bg-[#4D96DA] rounded-[3px] flex px-1 flex-wrap justify-start content-center mt-5  w-auto max-w-[200px] relative">
            <img
              alt={selected.friend.user.name}
              src={selected.friend.user.profilePic}
              className="w-[20px] h-[20px] mt-1"
            />
            <div className="ml-2">{selected.friend.user.name}</div>

            <img
              alt="X"
              src={Cross}
              className="w-[16px] h-[16px] absolute right-[10%] cursor-pointer mt-1 "
              onClick={() => {
                setSilicted(null);
              }}
            />
          </div>
        )
      ) : (
        <input
          className="w-[90%] ml-8 mt-8 bg-[#40434B] py-3 px-3 outline-none rounded-[5px]  "
          placeholder="Search for person, group or channel"
          autoFocus={false}
          onBlur={() => {
            setTimeout(() => {
              setFoucsed(false);
            }, 1000);
          }}
          onClick={() => {
            setFoucsed(true);
          }}
        />
      )}

      {foceusd && !selected ? (
        <div
          className={`w-[95%]  max-h-[${msg.type === 'MSG'
              ? '180px'
              : msg.type === 'IMG' || msg.type === 'VIDEO'
                ? '300px'
                : msg.type === 'FILE'
                  ? '200px'
                  : null
            }] sticky bg-[#585B66] ml-5 bottom-[1%] rounded-[5px] z-10 pb-4  overflow-scroll`}
        >
          {renderList.map(chats => {
            return chats.groupChat ? (
              <div
                className="flex py-2 mt-4 cursor-pointer  hover:bg-blue-500"
                onClick={() => {
                  setSilicted(chats);
                }}
              >
                <i class="fa-solid fa-hashtag text-white text-[15px] mt-1 ml-8"></i>
                <div className="font-[700] ml-3 mb-2 relative ">{chats.groupChat.name}</div>
              </div>
            ) : (
              <div
                className="flex  mt-4 relative cursor-default hover:bg-blue-500 py-2"
                onClick={() => {
                  setSilicted(chats);
                }}
              >
                <img alt="img" src={chats.friend.user.profilePic} className="w-[20px] h-[20px] rounded-[3px] ml-8" />
                <div className="font-[700] ml-3 mb-1 "> {chats.friend.user.name}</div>
              </div>
            );
          })}
        </div>
      ) : null}
      {!foceusd ? (
        <div className="w-[90%] ml-8 mt-5 flex">
          <div className="h-[50px] w-0 border-[2px] rounded-full border-[#868686] "></div>
          <img
            alt={msg.from.name}
            src={msg.from.profilePic}
            className="w-[40xp] ml-5 h-[40px] rounded-[5px] object-contain mt-1"
          />
          <div className="flex flex-col mt">
            <div className="flex ml-2 ">
              <div className=" font-[700] text-[18px]">{msg.from.name}</div>
              <div className="text-[#B4B4B4] text-[14px]  ml-2 mt-1">{time}</div>
            </div>
            {msg.type === 'MSG' ? (
              <div className="ml-2  ">
                <LinkHighlighter
                  text_={msg.content.length > 150 ? msg.content.slice(0, 150) + '...' : msg.content}
                  currentUser={me.id}
                />
              </div>
            ) : msg.type === 'IMG' || msg.type === 'STICKER' ? (
              <img alt={msg.content} src={msg.url} className="ml-2 h-[200px] w-[400px] object-fill  " />
            ) : msg.type === 'VIDEO' ? (
              <div className="relative bottom-[3%] ml-2">
                <ReactPlayer url={msg.url} controls width="360px" height="220px" />
              </div>
            ) : (
              <div className="flex ">
                <div className="w-[40px] h-[40px] ml-2 mt-1">
                  <FileIcon extension={msg.content.split('.')[1]} {...defaultStyles[msg.content.split('.')[1]]} />
                </div>
                <div className="flex flex-col ml-2 mt-1 ">
                  <div className="text-white font-[700] cursor-pointer">{msg.content}</div>
                  <div className="text-[#B4B4B4] mt-1">{msg.content.split('.')[1]?.toUpperCase()}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
      <button
        className="bg-[#4D96DA] w-[80px] py-2 absolute bottom-[5%] right-[5%] rounded-[5px] flex flex-wrap justify-center content-center "
        onClick={() => {
          handleSendMsg();
        }}
      >
        {uploading ? <img alt="Loading" src={Spinner} className="w-[30px] h-[30px]" /> : 'Forward'}
      </button>
    </div>
  );
}
