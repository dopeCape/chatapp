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
  const [file, setFile] = useState();
  const fileRef = useRef();
  const [emoji, setEmoji] = useState(false);

  let me = useUserStore(state => state.user);
  let user = useSelectedChatStore(state => state.user);
  let chat_ = useChatStore(state => state.chats);
  let group_ = useGroupChatStore(state => state.chats);
  let workspace = useWorkSpaceStore(state => state.workspace);
  const setSelected = useSelectedStore(state => state.updateSelectedState);
  const screollRef = useRef();
  const chatRef = useRef();
  //
  // const [my_channel, ably] = useChannel(me.userId, (x) => { });
  // function array_move(arr, old_index, new_index) {
  //   if (new_index >= arr.length) {
  //     var k = new_index - arr.length + 1;
  //     while (k--) {
  //       arr.push(undefined);
  //     }
  //   }
  //   arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  //   return arr; // for testing
  // }
  //

  //
  // my_channel.subscribe("delete-msg", (data) => {
  //   msges.forEach((x) => {
  //     if (x.chatId === data.data.chatId) {
  //       x.msges = data.data.msges;
  //     }
  //   });
  //   msgSetter(msges);
  //
  //   changeChat();
  //
  //   screollRef.current?.scrollIntoView({
  //     behavior: "smooth",
  //   });
  // });
  const changeChat = () => {
    if (user !== null && user.name) {
      let y = [];
      if (user !== null) {
        group_.forEach(x => {
          if (x.id === user.id) {
            y = x.msges;

            setChatid(x.id);
          }
        });
      }
      setChat(y);
      // scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'start' });
    } else {
      let y = [];
      if (user !== null) {
        chat_.forEach(x => {
          if (x.friend.user.id === user.user.id && x.chat.workspaceId === workspace.id) {
            y = x.chat.msges;
            setChatid(x.chatId);
          }
        });
        setChat(y);
        // scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'start' });
      }
    }
  };
  const setProfile = () => {
    setSelected(user);
  };
  useEffect(() => {
    changeChat();
  }, [user, chat_, group_]);
  //
  const handleFileChange = async e => {
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
            if (user.name) {
              server_channel.publish('new-msg-group', {
                content: fileExt,
                url: url,
                type: file_type,
                from: me.id,
                to: user.user,
                chatId: chatId
              });
            } else {
              server_channel.publish('new-msg', {
                content: fileExt,
                url: url,
                type: file_type,
                from: me.id,
                to: user.user.id,
                chatId: chatId
              });
            }
          });
        });
      } else {
        alert('file size should be less than 10mb');
      }
    }
  };
  const scrollRef = useRef();

  const [server_channel, _] = useChannel('server', () => { });
  // const handleDeleteMsg = async (e) => {
  //   try {
  //     server_channel.publish("delete-msg", {
  //       chatId: user.chatId,
  //       msgId: e.currentTarget.getAttribute("data-value"),
  //       to: user.userId,
  //     });
  //     let new_chat = chat.filter((x) => {
  //       return x.msgId !== e.currentTarget.getAttribute("data-value");
  //     });
  //     msges.forEach((x) => {
  //       if (x.chatId === user.chatId) {
  //         x.msges = new_chat;
  //       }
  //     });
  //     msgSetter(msges);
  //
  //     changeChat();
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  const handleSendMsg = async () => {
    if (chatRef.current.value !== '') {
      if (chat.length === 0) {
        server_channel.publish('new-chat', {
          user1: {
            id: me.chatWorkSpaces.id,
            user: {
              id: me.chatWorkSpaces.user.id
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
        console.log(user);
        if (user.name) {
          server_channel.publish('new-msg-group', {
            content: chatRef.current.value,
            type: type,
            from: me.id,
            to: user.user,
            chatId: chatId
          });
        } else {
          server_channel.publish('new-msg', {
            content: chatRef.current.value,
            type: type,
            from: me.id,
            to: user.user.id,
            chatId: chatId
          });
        }
        chatRef.current.value = '';
      }
    }
  };

  // useEffect(() => {
  //   const x = async () => {
  //     if (user.pending === "accepted") {
  //       let msges = await instance.get(`/msges/${user.chatId}`, {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //         },
  //       });
  //       let nemsges = msges.data.msges.msges;
  //
  //       setChat(nemsges);
  //     }
  //   };
  //   x();
  // }, []);

  return user === undefined || user === null ? (
    <div className="w-full h-full bg-white dark:bg-[#2c2c2c] dark:text-white text-[26px] font-bold flex flex-wrap justify-center content-center">
      Select a friend to start a conversation
    </div>
  ) : (
    <div className="w-full h-full flex flex-col bg-white dark:bg-[#2c2c2c]">
      {user.name !== undefined ? (
        <div className="w-[100%] h-[10%] shadow-lg  flex    bg-white dark:bg-[#2c2c2c] dark:shadow-sm border-bl-md">
          <div className="mt-5 ml-4">
            <AvatarGroup total={user.user.length <= 3 ? user.user.length : 3} spacing="small">
              {user.user.map(x => {
                return <Avatar alt={x.user.name} src={x.user.profilePic} />;
              })}
            </AvatarGroup>
          </div>
          <div className="text-[24px] font-bold ml-5 mt-4 dark:text-white cursor-pointer" onClick={setProfile}>
            {user.name}
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
        {chat.map(msg => {
          return (
            <div className=" ">
              <MsgElement
                msg={msg}
                chatId={chatId}
                from={me.id}
                type={user.name ? 'group' : 'user'}
                to={user.name ? user.user : user.user.id}
              />
            </div>
          );
        })}
        <div ref={scrollRef}></div>
      </div>
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
        <div className="w-[17%] flex flex-col shadow-2xl border-[1px] border-white rounded-md h-[23%] absolute right-[10%] top-[68%] dark:bg-black_i_like bg-white">
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
          className="bg-[#EFEFEF]  outline-none border-none w-[80%] dark:bg-[#22252F] dark:text-white  "
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
