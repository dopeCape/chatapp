import styled from '@emotion/styled';
import Popup from 'reactjs-popup';
import EmojiPicker from 'emoji-picker-react';
import { userSeach } from '../utils/helper.js';
import './Styles/loadingBar.css';
import Search from '../search.svg';
import Upload from '../heroicons_document-arrow-up.svg';
import { getDownloadURL, getStorage, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';
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
import ReplaySection from './ReplySection';
import { properties } from '../utils/props';
import { addUserIdToMentions } from '../utils/mention';
import FileUplaodConfirmPopup from './FileUploadConfirmPopup.jsx';

export default function ChatSection() {
  const [sticker, setSticker] = useState(false);
  const [managePopupOpen, setManagePopu] = useState(false);
  const [uplodedUrl, setUplodedUrl] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0, height: 0 });
  const [chat, setChat] = useState([]);
  const [query, setQuery] = useState('');
  const [refId, setRefId] = useState(null);
  const [seachOpen, setSeachOpen] = useState(false);
  const [serach, setSeach] = useState('');
  const [mentionOpen, setMentionOpen] = useState(false);
  const [reply, setReply] = useState(null);
  const [manageGroupOpen, setManageGroupOpen] = useState(false);
  const [uploding, setUploding] = useState(false);
  const [msgIndex, setMsgIndex] = useState(null);
  const [uplodingPer, setUplodingPer] = useState(0);
  const [chatId, setChatid] = useState(null);
  const [type, setType] = useState('MSG');
  const [fileUpload, setFileUplaod] = useState(false);
  const [msgFocus, setMsgFoucs] = useState(null);
  const [file, setFile] = useState();
  const fileRef = useRef();
  const [friendId, setFriendId] = useState(null);
  const [emoji, setEmoji] = useState(false);
  const chatContainerRef = useRef(null);
  let me = useUserStore(state => state.user);
  let user = useSelectedChatStore(state => state.user);
  let chat_ = useChatStore(state => state.chats);
  let group_ = useGroupChatStore(state => state.chats);
  let workspace = useWorkSpaceStore(state => state.workspace);
  const setRead = useChatStore(state => state.setUnReadToZero);
  const setReadGroup = useGroupChatStore(state => state.setUnReadToZero);
  const setSelected = useSelectedStore(state => state.updateSelectedState);
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
  useEffect(() => {
    setReply(null);
    if (chatRef.current) {
      chatRef.current.value = '';
    }
  }, [user]);

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
            setRefId(x.id);
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
            setFriendId(x.id);
            setRefId(x.id);
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
      let query = chatRef.current.value.split(' ').at(-1).split('').slice(1).join('');
      setQuery(query);
      if (user.groupChat) {
        console.log(user);
        let temp_users = user.groupChat.groupChatRef.map(x => {
          return x.user.user;
        });

        temp_users.push({ name: 'all', id: '1234565' });
        temp_users = userSeach(temp_users, query).map(i => {
          return i.item;
        });
        if (temp_users.length > 0) {
          setMentionOpen(true);
        } else {
          setMentionOpen(false);
        }
      } else {
        setMentionOpen(true);
      }
    } else {
      setMentionOpen(false);
    }
    const { selectionStart } = event.target;
    const { top, left, height } = getCaretCoordinates(chatRef.current, selectionStart);
    setMenuPosition({ left, top, height });
  };

  const handleUploadFile = async (url, filename, filetype) => {
    try {
      let isReply = reply ? true : false;
      let replyedTo = reply ? reply.id : null;
      if (user.groupChat) {
        let to = user.groupChat.groupChatRef.map(x => {
          return x.user.user.id;
        });
        await instance.post(
          '/msges/newgroupmsg',
          {
            content: filename,
            url: url,
            type: filetype,
            from: me.id,
            to: to,
            chatId: chatId,
            myChatRef: user.id,
            isReply,
            replyedTo
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
              content: filename,
              url: url,
              type: filetype
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
              content: filename,
              url: url,
              type: filetype,
              from: me.id,
              to: user.user.id,
              chatId: chatId,
              isReply,
              replyedTo,
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
      setReply(null);
    } catch (error) {
      console.log(error);
    }
  };
  const handleFileChange = async file => {
    try {
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
            setUplodedUrl(ur);
            setUploding(false);
          });
        }
      );
    } catch (error) {
      console.log(error);
    }
  };
  const scrollRef = useRef();

  const [server_channel, _] = useChannel('server', () => { });
  let accessToken = localStorage.getItem('token');

  const isFirefox = typeof window !== 'undefined' && window['mozInnerScreenX'] != null;

  function getCaretCoordinates(element, position) {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const style = div.style;
    const computed = getComputedStyle(element);
    style.whiteSpace = 'pre-wrap';
    style.wordWrap = 'break-word';
    style.position = 'absolute';
    style.visibility = 'hidden';
    properties.forEach(prop => {
      style[prop] = computed[prop];
    });
    if (isFirefox) {
      if (element.scrollHeight > parseInt(computed.height)) style.overflowY = 'scroll';
    } else {
      style.overflow = 'hidden';
    }
    div.textContent = element.value.substring(0, position);
    const span = document.createElement('span');
    span.textContent = element.value.substring(position) || '.';
    div.appendChild(span);
    const coordinates = {
      top: span.offsetTop + parseInt(computed['borderTopWidth']),
      left: span.offsetLeft + parseInt(computed['borderLeftWidth']) + element.offsetLeft,
      height: span.offsetHeight
    };
    div.remove();
    console.log(coordinates);
    return coordinates;
  }
  const handleSendMsg = async e => {
    if (chatRef.current.value.trim() !== '' && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (chat.length === 0) {
        let msgToSend = addUserIdToMentions([user], chatRef.current.value, 'C');
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
            content: msgToSend,
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
        let isReply = reply ? true : false;
        let replyedTo = reply ? reply.id : null;
        if (user.groupChat) {
          let to = user.groupChat.groupChatRef.map(x => {
            return x.user.user.id;
          });
          let msgToSend = addUserIdToMentions(user.groupChat.groupChatRef, chatRef.current.value, 'G');
          await instance.post(
            '/msges/newgroupmsg',
            {
              content: msgToSend,
              type: type,
              from: me.id,
              to: to,
              chatId: chatId,
              myChatRef: user.id,
              isReply,
              replyedTo
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

          let msgToSend = addUserIdToMentions([user], chatRef.current.value);
          await instance.post(
            '/msges/newmsg',
            {
              content: msgToSend,
              type: type,
              from: me.id,
              to: user.user.id,
              chatId: chatId,
              friendId: friend[0].id,
              isReply,
              replyedTo
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
      setReply(null);
      setMentionOpen(false);
      setQuery('');
      setPlaceHolder(`Message ${user.groupChat ? '#' + user.groupChat.name : user.user.name}`);
      adjustInputHeight();
    } else if (e.shiftKey && e.key === 'Enter') {
    }
  };
  const FileUPloadPopup = styled(Popup)`
    &-content {
      border: none;
      height: 450px;
      padding: 0;
      width: 300px;
      border-radius: 10px;
    }
  `;

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
          <div
            className="flex flex-wrap justify-center content-center   pr-2  hover:bg-[#4e5055] h-[50px] mt-3 rounded-[5px] pt-0  cursor-pointer"
            onClick={() => {
              setManagePopu(true);
            }}
          >
            {user.groupChat.type === 'CHANNEL' ? (
              <>
                <i className="fa-solid fa-hashtag text-white  mt-2 ml-2 mr-1"></i>

                <div className="text-[20px] font-[700]   text-white">{user.groupChat.name}</div>
              </>
            ) : (
              <>
                <img src={GroupLogo} alt={'Loading...'} className="rounded-[2px] h-[30px] w-[30px]  ml-2 mr-1    " />

                <div className="text-[20px] font-[700]   text-white">{groupName(user.groupChat.groupChatRef)}</div>
              </>
            )}
            <i class="fa-solid fa-chevron-down  ml-1 text-[14px] font-bold cursor-pointer text-[#F8F8F8] mt-2"></i>
          </div>
          <ManageGroupPopup
            modal
            position="center"
            closeOnDocumentClick={false}
            onClose={() => {
              setManagePopu(false);
            }}
            open={managePopupOpen}
          >
            {close => <GroupManagePopup close={close} groupChat={user} type={'G'} id={refId} chatId={chatId} />}
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
            open={managePopupOpen}
            onClose={() => {
              setManagePopu(false);
            }}
            position="center"
            closeOnDocumentClick={false}
          >
            {close => (
              <GroupManagePopup
                close={close}
                type={'C'}
                useR={user}
                chat={chat}
                id={refId}
                chatId={chatId}
                friendId={friendId}
              />
            )}
          </ManageGroupPopup>
          <div
            className="flex  py-1 px-3 hover:bg-[#4e5055]  flex-wrap justify-center content-center h-[80%] mt-2 rounded-[10px] cursor-pointer"
            onClick={() => {
              setManagePopu(true);
            }}
          >
            <img src={user.user.profilePic} alt={'Loading...'} className="rounded-[2px] h-[45px] w-[45px]   " />
            <div className="text-[20px] font-[700] ml-2    text-white">{user.user.name}</div>
          </div>

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
                  msgFocus={setMsgFoucs}
                  from={me.id}
                  clicked={msgIndex === msg.id}
                  type={user.groupChat ? 'group' : 'user'}
                  replySetter={setReply}
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
                  replySetter={setReply}
                  from={me.id}
                  msgFocus={setMsgFoucs}
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
        // bottom-[10%]  left-[32.25%]
        <div
          className="w-[400px] max-h-[250px]  absolute   "
          style={{
            top: `${680 + menuPosition.top - menuPosition.height}px`,
            left: `${menuPosition.left}px`
          }}
        >
          <MentionMenu
            users={user.groupChat ? user.groupChat.groupChatRef : user.user}
            query={query}
            type={user.groupChat ? 'G' : 'C'}
            setMention={setMentionOpen}
            inputRef={chatRef}
          />
        </div>
      ) : null}
      {reply ? (
        <div className="w-[95%] ml-6 mt-5 rounded-[5px] border-[#616061] border-[1px] border-b-[0px] rounded-b-[0px] py-2  ">
          <ReplaySection msg={reply} replySetter={setReply} sendMsg={handleSendMsg} />
        </div>
      ) : null}
      <div className="p-4  pl-5 bg-[#40444A] rounded-[10px] w-[95%] ml-6   max-h-[30%]  flex justify-end mb-3     mt-4 ">
        <textarea
          ref={chatRef}
          className="bg-[#40444A]  outline-none border-none w-[90%] max-w-[90%]  text-white h-[20px]   max-h-[200px]   flex-grow  overflow-y-scroll  "
          rows="1"
          onInput={handleInputChange}
          placeholder={`Message ${user.groupChat ? '#' + user.groupChat.name : user.user.name}`}
          value={chatRef.current?.value}
          onKeyDown={handleSendMsg}
          tabIndex={0}
        ></textarea>
        <img
          alt="Link"
          src={PaperClip}
          class="text-white text-[22px] w-[25px] h-[25px]  cursor-pointer mr-3"
          onClick={() => {
            setEmoji(false);
            setSticker(false);
            setFileUplaod(true);
          }}
        ></img>
        {fileUpload ? (
          <>
            <div className="fixed w-screen h-screen bg-black bg-opacity-40 top-0 left-0 "></div>
            <div className="w-[450px] h-[300px] absolute  bottom-[10%] z-[50]">
              <FileUplaodConfirmPopup
                fileFunc={handleFileChange}
                uploadFunc={handleUploadFile}
                perSetter={setUplodingPer}
                per={uplodingPer}
                close={setFileUplaod}
                uplodedUrl={uplodedUrl}
                setUplodedUrl={setUplodedUrl}
              />
            </div>
          </>
        ) : null}

        <input className="hidden" type="file" ref={fileRef} onChange={handleFileChange} />
        <img
          src={Smile}
          alt="Emoji"
          class=" dark:text-white text-[22px] cursor-pointer mr-3 w-[25px] h-[25px]"
          onClick={() => {
            setSticker(false);
            setFileUplaod(false);
            setEmoji(!emoji);
          }}
        ></img>
        <img
          src={Sticker}
          alt="Sticker"
          className="text-white text-[22px]  cursor-pointer mr-3 w-[25px] h-[25px] "
          onClick={() => {
            setFileUplaod(false);
            setEmoji(false);
            setSticker(!sticker);
          }}
        ></img>
        {sticker ? (
          <div className="absolute w-[300px] h-[250px]  top-[57%]">
            <GiphyComponen
              user={user}
              me={me}
              chatId={chatId}
              type={chat.length === 0 ? 'new' : null}
              reply={reply}
              setReply={setReply}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
