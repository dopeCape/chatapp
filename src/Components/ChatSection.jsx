/* eslint-disable react-hooks/rules-of-hooks */

/* eslint-disable no-unused-vars */
import styled from '@emotion/styled';
import Popup from 'reactjs-popup';

import EmojiPicker from 'emoji-picker-react';
import './Styles/loadingBar.css';
import Search from '../search.svg';
import Upload from '../heroicons_document-arrow-up.svg';

import { getDownloadURL, getStorage, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';

// Create a single supabase client for interacting with your database

import React, { useEffect, useRef, useState } from 'react';
import { useChannel } from '@ably-labs/react-hooks';
import GroupLogo from '../Frame 98.svg';

import MsgElement from './MsgElement';
import PaperClip from '../paperclip.svg';
import Sticker from '../file.svg';

import {
  useChatStore,
  useGroupChatStore,
  useSelectedChatStore,
  useSelectedStore,
  useUserStore,
  useWorkSpaceStore
} from '../Stores/MainStore';
import MentionMenu from './MentionMenu';
import GiphyComponen from './GiphyComponent';
import Smile from '../smile.svg';
import Phote from '../heroicons_photo.svg';

import { instance } from '../axios';
import GroupManagePopup from './GroupManagePopup';
import SeacrchMsgesPopup from './SearchMsgesPopup';
import LinkHighlighter from './LinkHeilight';

export default function ChatSection() {
  const [sticker, setSticker] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 });
  const [chat, setChat] = useState([]);
  const [seachOpen, setSeachOpen] = useState(false);
  const [innerInputValue, setInnerInputValue] = useState('');
  const [serach, setSeach] = useState('');
  const [mentionOpen, setMentionOpen] = useState(false);

  const [uploding, setUploding] = useState(false);
  const [msgIndex, setMsgIndex] = useState(null);

  const [uplodingPer, setUplodingPer] = useState(0);
  const [chatId, setChatid] = useState(null);
  const [type, setType] = useState('MSG');
  const [timeOut, addTimeout] = useState(null);
  const [fileUpload, setFileUplaod] = useState(false);
  const [msgFocus, setMsgFoucs] = useState(null);

  const [file, setFile] = useState();
  const fileRef = useRef();
  const [emoji, setEmoji] = useState(false);
  const chatContainerRef = useRef(null);

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
  const [placeHolder, setPlaceHolder] = useState();
  const groupName = arr => {
    let name = 'Me';
    let count = 0;
    arr.forEach((element, index) => {
      if (count < 2) {
        if (element.user.user.id !== me.id) {
          name = name + ',' + element.user.user.name;
          count = count + 1;
        }
        if (arr.length > 1 && count === 1) {
        }
      }
    });
    if (arr.length > 2) {
      name = name + '+' + (arr.length - 2);
    }
    return name;
  };

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
    setMsgIndex(null);
  };
  const handleRead = async (chat, type) => {
    try {
      console.log(chat);
      if (chat.unRead > 0) {
        if (type === 'group') {
          let chatRefId = chat.id;
          await instance.post(
            '/gchat/unread',
            {
              id: chatRefId
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          );
          // server_channel.publish('unread-group-chat', { id: chatRefId });
          setReadGroup(chatRefId);
        } else {
          let id = chat.id;
          await instance.post(
            '/user/handleread',
            {
              id: id
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          );
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
    if (user) {
      setPlaceHolder();
    }
    changeChat();
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 10);
  }, [user, chat_, group_]);
  useEffect(() => {
    if (msgFocus) {
      const itemElement = chatContainerRef.current.querySelector(`[data-id="${msgFocus}"]`);
      if (itemElement) {
        itemElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setMsgIndex(msgFocus);
      }
    }
    setMsgFoucs(null);
  }, [msgFocus]);
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
    // userChaneel.subscribe('typing', data => {
    //   setTyping(data.data.chatId, data.data.typing);
    //   if (timeOut != null) {
    //     clearTimeout(timeOut);
    //   }
    //   let timeOutId = setTimeout(() => {
    //     setTyping(data.data.chatId, false);
    //   }, 2000);
    //
    //   addTimeout(timeOutId);
    // });
    // return () => {
    //   userChaneel.unsubscribe('typing');
    // };
  }, []);

  const adjustInputHeight = () => {
    chatRef.current.style.height = 'auto';
    chatRef.current.style.height = `${chatRef.current.scrollHeight}px`;
  };

  const SearchPopuu = styled(Popup)`
    &-content {
      border: none;
      height: 350px;
      padding: 0;
      width: 410px;
      border-radius: 10px;
    }
  `;
  const handleInputChange = event => {
    adjustInputHeight();
    let parts = chatRef.current.value.split(' ');
    if (parts.at(-1).slice(0, 1) === '@') {
      setMentionOpen(true);
    } else {
      setMentionOpen(false);
    }
    const { selectionStart } = event.target;
    const { top, left } = getPositionAtCursor(selectionStart);
    setMenuPosition({ top, left });
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

          if (type === 'video/mp4') {
            file_type = 'VIDEO';
          } else if (type === 'image/gif' || type === 'image/jpeg' || type === 'image/png' || type == 'image/webp') {
            file_type = 'IMG';
          } else {
            file_type = 'FILE';
          }
          setUploding(true);

          const uploadTask = uploadBytesResumable(storageRef, file);
          // Listen for state changes, errors, and completion of the upload.
          uploadTask.on(
            'state_changed',
            snapshot => {
              // Observe state change events such as progress, pause, and resume
              // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUplodingPer(Math.trunc(progress));
              switch (snapshot.state) {
                case 'paused':
                  console.log('Upload is paused');
                  break;
                case 'running':
                  console.log('Upload is running');
                  break;
              }
            },
            error => {
              // Handle unsuccessful uploads
            },
            () => {
              // Handle successful uploads on complete
              // For instance, get the download URL: https://firebasestorage.googleapis.com/...
              getDownloadURL(uploadTask.snapshot.ref).then(async ur => {
                setUploding(false);
                url = ur;
                if (user.groupChat) {
                  let to = user.groupChat.groupChatRef.map(x => {
                    return x.user.user.id;
                  });
                  await instance.post(
                    '/msges/newgroupmsg',
                    {
                      content: fileExt,
                      url: url,
                      type: file_type,
                      from: me.id,
                      to: to,
                      chatId: chatId,
                      myChatRef: user.id
                    },
                    {
                      headers: {
                        Authorization: `Bearer ${accessToken}`
                      }
                    }
                  );
                } else {
                  if (chat.length === 0) {
                    await instance.post(
                      '/user/newchat',
                      {
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
                        content: fileExt,
                        url: url,
                        type: file_type
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${accessToken}`
                        }
                      }
                    );
                  } else {
                    let friend = user.user.chatWorkSpaces.Friend.filter(x => {
                      return x.workspaceId === workspace.id;
                    });

                    await instance.post(
                      '/msges/newmsg',
                      {
                        content: fileExt,
                        url: url,
                        type: file_type,
                        from: me.id,
                        to: user.user.id,
                        chatId: chatId,
                        friendId: friend[0].id
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${accessToken}`
                        }
                      }
                    );
                  }
                }
              });
            }
          );
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
  let accessToken = localStorage.getItem('token');

  const getPositionAtCursor = position => {
    const textarea = chatRef.current;
    const { offsetTop, offsetLeft, offsetHeight, offsetWidth } = textarea;
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight, 10);

    const rows = Math.floor(offsetHeight / lineHeight);
    const cols = Math.floor(offsetWidth / textarea.cols);

    // Calculate caret position
    const { top: scrollTop, left: scrollLeft } = textarea;
    const scrollOffsetX = textarea.scrollLeft;
    const scrollOffsetY = textarea.scrollTop;
    let posx = position - cols * (rows - 1);
    if (posx < 0) {
      posx = posx * -1;
    }

    const caretX = offsetLeft + posx * (textarea.clientWidth / cols);
    console.log(caretX, posx, rows);

    const caretY = offsetTop + lineHeight * Math.floor(position / cols) - scrollOffsetY;

    // Calculate menu position
    const menuTop = caretY + lineHeight;
    const menuLeft = caretX;

    return { top: menuTop, left: menuLeft };
  };

  const handleSendMsg = async e => {
    if (chatRef.current.value.trim() !== '' && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (chat.length === 0) {
        await instance.post(
          '/user/newchat',
          {
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
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );

        chatRef.current.value = '';

        setPlaceHolder(`Message ${user.groupChat ? '#' + user.groupChat.name : user.user.name}`);
      } else {
        if (user.groupChat) {
          let to = user.groupChat.groupChatRef.map(x => {
            return x.user.user.id;
          });
          await instance.post(
            '/msges/newgroupmsg',
            {
              content: chatRef.current.value,
              type: type,
              from: me.id,
              to: to,
              chatId: chatId,
              myChatRef: user.id
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          );
        } else {
          let friend = user.user.chatWorkSpaces.Friend.filter(x => {
            return x.workspaceId === workspace.id;
          });
          await instance.post(
            '/msges/newmsg',
            {
              content: chatRef.current.value,
              type: type,
              from: me.id,
              to: user.user.id,
              chatId: chatId,
              friendId: friend[0].id
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          );
        }
      }

      chatRef.current.value = '';
      setPlaceHolder(`Message ${user.groupChat ? '#' + user.groupChat.name : user.user.name}`);
      adjustInputHeight();
    } else if (e.shiftKey && e.key === 'Enter') {
    }
  };
  const ManageGroupPopup = styled(Popup)`
    &-content {
      border: none;
      height: 650px;
      padding: 0;
      width: 600px;
      border-radius: 10px;
    }
  `;

  return user === undefined || user === null ? (
    <div className="w-full h-full bg-white dark:bg-[#2c2c2c] dark:text-white text-[26px] font-bold flex flex-wrap justify-center content-center">
      Select a friend to start a conversation
    </div>
  ) : (
    <div className="w-full h-full flex flex-col bg-[#37393F] ">
      {user.groupChat !== undefined ? (
        <div className="w-[100%] h-[9%]   flex    bg-[#2F3137] border-[2px] border-none border-b-[#353B43] relative">
          <ManageGroupPopup
            modal
            position="center"
            closeOnDocumentClick={false}
            trigger={
              <div className="flex flex-wrap justify-center content-center   pr-2  hover:bg-[#4e5055] h-[50px] mt-3 rounded-[5px] pt-0  cursor-pointer">
                {user.groupChat.type === 'CHANNEL' ? (
                  <>
                    <i className="fa-solid fa-hashtag text-white  mt-2 ml-2 mr-1"></i>

                    <div className="text-[20px] font-[700]   text-white">{user.groupChat.name}</div>
                  </>
                ) : (
                  <>
                    <img
                      src={GroupLogo}
                      alt={'Loading...'}
                      className="rounded-[2px] h-[30px] w-[30px]  ml-2 mr-1    "
                    />

                    <div className="text-[20px] font-[700]   text-white">{groupName(user.groupChat.groupChatRef)}</div>
                  </>
                )}
                <i class="fa-solid fa-chevron-down  ml-1 text-[14px] font-bold cursor-pointer text-[#F8F8F8] mt-2"></i>
              </div>
            }
          >
            {close => <GroupManagePopup close={close} groupChat={user} type={'G'} />}
          </ManageGroupPopup>
          <div className="h-[60%] w-[15%] bg-[#696D78] rounded-[10px] absolute right-[3%] top-[20%] flex p-3">
            <img alt="" src={Search} className="mr-3" />
            <input
              placeholder="Search..."
              className="bg-transparent outline-none text-white  w-[70%]"
              value={serach}
              onChange={e => {
                setSeach(e.target.value);
              }}
              onClick={() => {
                setSeachOpen(true);
              }}
            />
          </div>
        </div>
      ) : (
        <div className="w-[100%] h-[9%]   flex    bg-[#2F3137] border-[2px] border-none border-b-[#353B43] relative">
          <ManageGroupPopup
            modal
            position="center"
            closeOnDocumentClick={false}
            trigger={
              <div className="flex  py-1 px-3 hover:bg-[#4e5055]  flex-wrap justify-center content-center h-[80%] mt-2 rounded-[10px] cursor-pointer">
                <img src={user.user.profilePic} alt={'Loading...'} className="rounded-[2px] h-[45px] w-[45px]   " />
                <div className="text-[20px] font-[700] ml-2    text-white">{user.user.name}</div>
              </div>
            }
          >
            {close => <GroupManagePopup close={close} type={'C'} useR={user} chat={chat} />}
          </ManageGroupPopup>

          <div className="h-[60%] w-[15%] bg-[#696D78] rounded-[10px] absolute right-[3%] top-[20%] flex p-3">
            <img alt="" src={Search} className="mr-3" value={serach} />
            <input
              placeholder="Search..."
              className="bg-transparent outline-none text-white  w-[70%]"
              onClick={() => {
                setSeachOpen(true);
              }}
              onChange={e => {
                setSeach(e.target.value);
              }}
            />
          </div>
        </div>
      )}
      {seachOpen ? (
        <div className="absolute right-[2%] top-[8%] w-[410px] h-[450px] z-50">
          <SeacrchMsgesPopup msges={chat} query={serach} close={setSeachOpen} setMsgFocus={setMsgFoucs} />
        </div>
      ) : null}

      <div className="w-full h-[80%] max-h-[80%] flex flex-col    overflow-y-scroll   " ref={chatContainerRef}>
        {' '}
        {chat.map((msg, index) => {
          let pDate = new Date(msg.createdAt);
          pDate.setHours(0, 0, 0, 0);
          let today = new Date().setHours(0, 0, 0, 0);
          let date;
          if (pDate < today) {
            date = `${pDate.getDate()} ${pDate.toLocaleString('default', { month: 'short' })}`;
          } else {
            date = 'today';
          }
          return pDate < today ? (
            <div style={{ marginTop: `${index === 0 ? 'auto' : null}` }} key={msg.id} tabIndex={0} data-id={msg.id}>
              {index === 0 || new Date(chat.at(index - 1).createdAt).setHours(0, 0, 0, 0) < pDate ? (
                <div className="flex">
                  <div className="w-[48%] left-[2%]  border-[1px] h-0 relative top-3 border-[#515357]"></div>

                  <div className="text-[#fbfbfb] ml-3 mr-5 text-center  w-[140px] ">{date}</div>

                  <div className="w-[45%] right-[3%]  border-[1px] h-0  relative top-3 border-[#515357]"></div>
                </div>
              ) : null}
              <div
                key={msg.id}
                tabIndex={0}
                data-id={msg.id}
                className=" "
                onMouseEnter={() => {
                  setMsgIndex(msg.id);
                }}
                onMouseLeave={() => {
                  setMsgIndex(null);
                }}
              >
                <MsgElement
                  msg={msg}
                  chatId={chatId}
                  from={me.id}
                  clicked={msgIndex === msg.id}
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
            </div>
          ) : (
            <div style={{ marginTop: `${index === 0 ? 'auto' : null}` }} key={msg.id} tabIndex={0} data-id={msg.id}>
              {index === 0 || new Date(chat.at(index - 1).createdAt).setHours(0, 0, 0, 0) < pDate ? (
                <div className="flex">
                  <div className="w-[48%] left-[2%]  border-[1px] h-0 relative top-3 border-[#515357]"></div>

                  <div className="text-[#fbfbfb] ml-3 mr-5 text-center w-[140px]   ">Today</div>

                  <div className="w-[45%] right-[3%]  border-[1px] h-0  relative top-3 border-[#515357]"></div>
                </div>
              ) : null}
              <div
                key={msg.id}
                tabIndex={0}
                data-id={msg.id}
                className="   "
                onMouseEnter={() => {
                  setMsgIndex(msg.id);
                }}
                onMouseLeave={() => {
                  setMsgIndex(null);
                }}
              >
                <MsgElement
                  msg={msg}
                  chatId={chatId}
                  clicked={msgIndex === msg.id}
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
        <div className="bg-[#585B66] rounded-[5px] w-[300px]  h-[130px] absolute top-[72%] right-[8%] text-white flex-col">
          <div className="ml-5 mt-4 text-[20px] font-[700]">Uploading</div>
          <div className="flex w-full ">
            <div className="w-[70%] h-[25px] bg-black rounded-[5px] mt-5 ml-5">
              <div
                className="h-full  bg-gradient-to-r from-[#FFFFFF] via-[#1E6BFF] to-[#181683]  rounded-[5px]"
                style={{ width: `${uplodingPer}%` }}
              ></div>
            </div>
            <div className="mt-5 ml-3 ">{uplodingPer}%</div>
          </div>
        </div>
      ) : null}
      {mentionOpen ? (
        <div
          className="w-[400px] max-h-[250px]  absolute "
          style={{
            position: 'absolute',
            top: menuPosition.top,
            left: menuPosition.left
          }}
        >
          <MentionMenu users={user.user} type={'C'} />
        </div>
      ) : null}
      <div className="p-4  pl-5 bg-[#40444A] rounded-[10px] w-[95%] ml-6 mt-2  max-h-[30%]  flex justify-end    h-auto   ">
        <textarea
          ref={chatRef}
          className="bg-[#40444A]  outline-none border-none w-[90%] max-w-[90%]  text-white h-[20px]   max-h-[200px]   flex-grow  overflow-y-scroll "
          onInput={handleInputChange}
          placeholder={`Message ${user.groupChat ? '#' + user.groupChat.name : user.user.name}`}
          onKeyDown={handleSendMsg}
          tabIndex={0}
        >
          {innerInputValue}
        </textarea>
        <img
          alt="Link"
          src={PaperClip}
          class="text-white text-[22px] w-[30px] h-[30px]  cursor-pointer mr-3"
          onClick={() => {
            setEmoji(false);
            setSticker(false);
            setFileUplaod(!fileUpload);
          }}
        ></img>
        {fileUpload ? (
          <div className="absolute w-[230px] h-[150px] flex flex-col bg-[#585B66] top-[69%] right-[8%] text-white rounded-[5px]">
            <div className="mt-5 ml-4 font-[700]">Upload from computer</div>
            <div className="flex  ">
              <img alt="Document" src={Upload} className="w-[30px] h-[30px] mr-3 mb-5 ml-4 mt-4 cursor-pointer" />
              <div
                className="mt-4 cursor-pointer "
                onClick={() => {
                  fileRef.current.click();
                  setFileUplaod(false);
                }}
              >
                Upload document
              </div>
            </div>
            <div className="flex ">
              <img alt="Document" src={Phote} className="w-[30px] h-[30px] mr-3 ml-4 cursor-pointer" />
              <div
                className="cursor-pointer"
                onClick={() => {
                  fileRef.current.click();
                  setFileUplaod(false);
                }}
              >
                Upload photo or video
              </div>
            </div>
          </div>
        ) : null}

        <input className="hidden" type="file" ref={fileRef} onChange={handleFileChange} />
        <img
          src={Smile}
          alt="Emoji"
          class=" dark:text-white text-[22px] cursor-pointer mr-3 w-[30px] h-[30px]"
          onClick={() => {
            setSticker(false);
            setFileUplaod(false);
            setEmoji(!emoji);
          }}
        ></img>
        <img
          src={Sticker}
          alt="Sticker"
          className="text-white text-[22px]  cursor-pointer mr-3 w-[30px] h-[30px] "
          onClick={() => {
            setFileUplaod(false);
            setEmoji(false);
            setSticker(!sticker);
          }}
        ></img>
        {sticker ? (
          <div className="absolute w-[300px] h-[250px]  top-[57%]">
            <GiphyComponen user={user} me={me} chatId={chatId} type={chat.length === 0 ? 'new' : null} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
