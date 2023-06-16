/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import EmojiPicker from 'emoji-picker-react';
import './Styles/loadingBar.css';

import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

// Create a single supabase client for interacting with your database

import React, { useEffect, useRef, useState } from 'react';
import { AvatarGroup } from '@mui/material';
import { Avatar } from '@mui/material';

import { useChannel } from '@ably-labs/react-hooks';

import MsgElement from './MsgElement';
import {
  useChatStore,
  useGroupChatStore,
  useSelectedChatStore,
  useSelectedStore,
  useUserStore,
  useWorkSpaceStore
} from '../Stores/MainStore';
import GiphyComponen from './GiphyComponent';

export default function ChatSection() {
  const [sticker, setSticker] = useState(false);
  const [chat, setChat] = useState([]);
  const [uploding, setUploding] = useState(false);
  const [chatId, setChatid] = useState(null);
  const [type, setType] = useState('MSG');
  const [timeOut, addTimeout] = useState(null);

  const [file, setFile] = useState();
  const fileRef = useRef();
  const [emoji, setEmoji] = useState(false);

  let me = useUserStore(state => state.user);
  let user = useSelectedChatStore(state => state.user);
  let chat_ = useChatStore(state => state.chats);
  const setTyping = useChatStore(state => state.setTyping);
  let group_ = useGroupChatStore(state => state.chats);
  let workspace = useWorkSpaceStore(state => state.workspace);
  const setRead = useChatStore(state => state.setUnReadToZero);
  const setReadGroup = useGroupChatStore(state => state.setUnReadToZero);
  const setSelected = useSelectedStore(state => state.updateSelectedState);
  const screollRef = useRef();
  const chatRef = useRef();

  const changeChat = () => {
    if (user && user.groupChat !== undefined) {
      let y = [];
      let w;
      if (user) {
        group_.forEach(x => {
          if (x.groupChat.id === user.groupChat.id) {
            y = x.groupChat.msges;
            setChatid(x.groupChat.id);
            w = x;
          }
        });
      }
      setChat(y);
      handleRead(w, 'group');
    } else {
      let y = [];
      let w;
      if (user !== null) {
        chat_.forEach(x => {
          if (x.friend.user.id === user.user.id && x.chat.workspaceId === workspace.id) {
            y = x.chat.msges;
            w = x;
            setChatid(x.chatId);
          }
        });
        setChat(y);
        handleRead(w, 'friend');
      }
    }
  };
  const handleRead = (chat, type) => {
    try {
      if (chat.unRead > 0) {
        console.log(chat);
        if (type === 'group') {
          let chatRefId = chat.id;
          server_channel.publish('unread-group-chat', { id: chatRefId });
          setReadGroup(chatRefId);
        } else {
          let id = chat.id;
          server_channel.publish('unread-chat', { id });
          setRead(id);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const setProfile = () => {
    setSelected(user);
  };
  useEffect(() => {
    changeChat();
  }, [user, chat_, group_]);
  let userChannelId = 'x';
  let meId = 'y';
  if (user != null) {
    if (user.groupChat) {
      userChannelId = 'x';
    } else {
      userChannelId = user.user.id;
    }
  }

  const [chatUserChannel, __] = useChannel(userChannelId, () => { });
  const [userChaneel, ___] = useChannel(me.id, () => { });

  useEffect(() => {
    userChaneel.subscribe('typing', data => {
      console.log(data.data);
      setTyping(data.data.chatId, data.data.typing);
      if (timeOut != null) {
        clearTimeout(timeOut);
      }
      let timeOutId = setTimeout(() => {
        setTyping(data.data.chatId, false);
      }, 2000);

      addTimeout(timeOutId);
    });
    return () => {
      userChaneel.unsubscribe('typing');
    };
  }, []);

  const handleInputChange = e => {
    try {
      e.target.style.height = 'auto';

      e.target.style.height = e.scrollHeight + 'px';

      if (chatRef.current.value !== '') {
        chatUserChannel.publish('typing', { typing: true, chatId: chatId });
      } else {
        chatUserChannel.publish('typing', { typing: false, chatId: chatId });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileChange = async e => {
    try {
      if (e.target.files) {
        if (e.target.files[0].size < 10000000) {
          setFile(e.target.files[0]);
          const file = e.target.files[0];

          const fileExt = file.name;

          const type = file.type;

          const storage = getStorage();
          const storageRef = ref(storage, 'files/' + fileExt);

          let url;
          let file_type;
          console.log(type);

          if (type === 'video/mp4') {
            console.log(file);

            file_type = 'VIDEO';
          } else if (type === 'image/gif' || type === 'image/jpeg' || type === 'image/png' || type == 'image/webp') {
            file_type = 'IMG';
          } else {
            file_type = 'FILE';
          }
          setUploding(true);

          uploadBytes(storageRef, file).then(snapshot => {
            getDownloadURL(snapshot.ref).then(ur => {
              setUploding(false);
              url = ur;
              if (user.groupChat) {
                let to = user.groupChat.groupChatRef.map(x => {
                  return x.user.user.id;
                });

                server_channel.publish('new-msg-group', {
                  content: fileExt,
                  url: url,
                  type: file_type,
                  from: me.id,
                  to: to,
                  chatId: chatId,
                  myChatRef: user.id
                });
              } else {
                let friend = user.user.chatWorkSpaces.Friend.filter(x => {
                  return x.workspaceId === workspace.id;
                });

                server_channel.publish('new-msg', {
                  content: fileExt,
                  url: url,
                  type: file_type,
                  from: me.id,
                  to: user.user.id,
                  chatId: chatId,
                  friendId: friend[0].id
                });
              }
            });
          });
        } else {
          alert('file size should be less than 10mb');
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const scrollRef = useRef();

  const [server_channel, _] = useChannel('server', () => { });

  const handleSendMsg = async () => {
    if (chatRef.current.value !== '') {
      if (chat.length === 0) {
        server_channel.publish('new-chat', {
          user1: {
            id: me.chatWorkSpaces.id,
            user: {
              id: me.id
            }
          },
          user2: {
            id: user.id,
            user: {
              id: user.user.id
            }
          },
          workspace: workspace.id,
          content: chatRef.current.value,
          type: type
        });

        chatRef.current.value = '';
      } else {
        if (user.groupChat) {
          let to = user.groupChat.groupChatRef.map(x => {
            return x.user.user.id;
          });
          server_channel.publish('new-msg-group', {
            content: chatRef.current.value,
            type: type,
            from: me.id,
            to: to,
            chatId: chatId,
            myChatRef: user.id
          });
        } else {
          let friend = user.user.chatWorkSpaces.Friend.filter(x => {
            return x.workspaceId === workspace.id;
          });

          server_channel.publish('new-msg', {
            content: chatRef.current.value,
            type: type,
            from: me.id,
            to: user.user.id,
            chatId: chatId,
            friendId: friend[0].id
          });
        }
        chatRef.current.value = '';
      }
    }
  };

  return user === undefined || user === null ? (
    <div className="w-full h-full bg-white dark:bg-[#2c2c2c] dark:text-white text-[26px] font-bold flex flex-wrap justify-center content-center">
      Select a friend to start a conversation
    </div>
  ) : (
    <div className="w-full h-full flex flex-col bg-white dark:bg-[#2c2c2c]">
      {user.groupChat !== undefined ? (
        <div className="w-[100%] h-[10%] shadow-lg  flex    bg-white dark:bg-[#2c2c2c] dark:shadow-sm border-bl-md">
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
          <div className="text-[24px] font-bold ml-5 mt-4 dark:text-white cursor-pointer" onClick={setProfile}>
            {user.groupChat.name}
          </div>
        </div>
      ) : (
        <div className="w-[100%] h-[10%] shadow-lg  flex    bg-white dark:bg-[#16171B] dark:shadow-sm rounded-bl-3xl">
          <img src={user.user.profilePic} alt={'Loading...'} className="rounded-full h-[70%] mt-3 m-4 " />
          <div className="text-[24px] font-bold ml-5 mt-4 dark:text-white cursor-pointer" onClick={setProfile}>
            {user.user.name}
          </div>
        </div>
      )}

      <div className="w-full h-[80%] max-h-[80%] flex flex-col overflow-scroll ">
        {chat.map((msg, index) => {
          return (
            <div className=" " key={index}>
              <MsgElement
                msg={msg}
                chatId={chatId}
                from={me.id}
                type={user.groupChat ? 'group' : 'user'}
                to={
                  user.groupChat
                    ? user.groupChat.groupChatRef.map(x => {
                      return x.user.user.id;
                    })
                    : user.user.id
                }
              />
            </div>
          );
        })}
      </div>

      {/* {chat.length > 0 ? <div ref={scrollRef}></div> : null} */}
      {emoji ? (
        <div
          className="absolute

          right-[10%]
          top-[50%] ,
          "
        >
          <EmojiPicker
            width={300}
            height={300}
            theme="dark"
            searchDisabled
            onEmojiClick={emoji => {
              chatRef.current.value = chatRef.current.value + emoji.emoji;
            }}
          />{' '}
        </div>
      ) : null}
      {uploding ? (
        <div className="w-[17%] flex flex-col shadow-2xl border-[1px] border-white rounded-md h-[23%] absolute right-[25%] top-[68%] dark:bg-black_i_like bg-white">
          <div className="text-[#4D96DA] font-bold text-[24px] text-center m-3">Processing</div>
          <div className="lds-ring relative left-[33%]">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className="text-[12px] dark:text-[#AEAEAE] ml-5 mb-3">Please wait while we upload your file</div>
        </div>
      ) : null}
      <div className="p-3 bg-[#EFEFEF]  rounded-xl w-[80%] ml-16 dark:bg-[#22252F] flex justify-end mt-5">
        <input
          ref={chatRef}
          type="text"
          className="bg-[#EFEFEF]  outline-none border-none w-[80%] max-w-[80%] dark:bg-[#22252F] dark:text-white  resize-none overflow-hidden min-h-[50%] "
          onChange={handleInputChange}
        />
        <i
          class="fa-regular fa-face-smile dark:text-white text-[22px] cursor-pointer mr-3"
          onClick={() => {
            setEmoji(!emoji);
            if (sticker) {
              setSticker(false);
            }
          }}
        ></i>
        <i
          class="fa-solid fa-link dark:text-white text-[22px]  cursor-pointer mr-3"
          onClick={() => {
            fileRef.current.click();
          }}
        ></i>
        <input className="hidden" type="file" ref={fileRef} onChange={handleFileChange} />

        <i
          className="fa-solid fa-note-sticky dark:text-white text-[22px]  cursor-pointer mr-3 "
          onClick={() => {
            setSticker(!sticker);
            if (emoji) {
              setEmoji(false);
            }
          }}
        ></i>

        <i class="fa-solid fa-paper-plane dark:text-white text-[22px]  cursor-pointer" onClick={handleSendMsg}></i>
        {sticker ? (
          <div className="absolute w-[30%] h-[30%]  top-[60%]">
            <GiphyComponen user={user} me={me} chatId={chatId} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
