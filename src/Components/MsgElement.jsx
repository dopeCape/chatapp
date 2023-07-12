import React, { createRef, useEffect, useRef, useState } from 'react';

import { saveAs } from 'file-saver';
import LinkHighlighter from './LinkHeilight';
import ImgsViewer from 'react-images-viewer';
import { FileIcon, defaultStyles } from 'react-file-icon';
import Popup from 'reactjs-popup';
import styled from '@emotion/styled';
import EmojiPicker from 'emoji-picker-react';
import Cross from '../ph_x-bold.svg';
import Smile from '../smile.svg';
import Edit from '../Group.svg';
import Replay from '../solar_reply-linear.svg';
import Forward from '../solar_forward-linear.svg';
import Download from '../download.svg';
import { useSelectedChatStore, useUserStore } from '../Stores/MainStore';
import { useChannel } from '@ably-labs/react-hooks';
import ReactPlayer from 'react-player';
import Delete from '../delete.svg';
import axios from 'axios';
import { instance } from '../axios';
import DeleteMsgPopup from './DeleteMsgPopup';
import ForwardPopUp from './ForwardPopUp';
import FloatingVideoPlayer from './FloatingVideoPlayer';
import ReplyPopupC from './ReplyPopup';
import { addUserIdToMentions } from '../utils/mention';
import { getDownloadURL, ref, getStorage } from 'firebase/storage';

export default function MsgElement({ msg, chatId, from, to, type, clicked, replySetter, msgFocus }) {
  let user = useSelectedChatStore(state => state.user);

  const me = useUserStore(state => state.user);
  const chatRef = useRef();
  const [editng, setEditin] = useState(false);
  const [editedValue, setEditedValue] = useState(() => {
    const regex = /\[(.*?)\]/g;
    return msg.content.replace(regex, '');
  });
  const [time, setTime] = useState();
  const [deleteMsgOpen, setDeleteMsgOpen] = useState(false);
  const [editMsgOpen, setEditMsgOpen] = useState(false);
  const [imgOpen, setImgOpen] = useState(false);
  const [emoji, setEmoji] = useState(false);
  const [value, setValue] = useState(msg.content);

  useEffect(() => {
    let currentDate = new Date(msg.createdAt);
    let hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const amOrPm = hours >= 12 ? 'PM' : 'AM';
    // Convert to 12-hour format
    hours = hours % 12 || 12;
    const formattedTime = `${hours}:${minutes} ${amOrPm}`;
    setTime(formattedTime);
  }, []);

  async function downloadFile(url, filename) {
    saveAs(url, filename);
  }

  function getContentHeight(content) {
    //to get the height of the editing text area
    const span = document.createElement('span');
    span.style.visibility = 'hidden';
    span.style.whiteSpace = 'pre-wrap';
    span.innerText = content;

    document.body.appendChild(span);
    const height = span.getBoundingClientRect().height;
    document.body.removeChild(span);

    return height;
  }
  const handleEditChang = e => {
    setValue(e.target.value);
  };
  const [hidden, setHidden] = useState(true);

  const [server_channel, _] = useChannel('server', () => { });
  let accessToken = localStorage.getItem('token');
  const handleDelete = async () => {
    try {
      if (msg.type === 'VIDEO' || msg.type === 'IMG' || msg.type === 'FILE') {
        await axios.delete(msg.url);
      }
      if (type === 'group') {
        await instance.post(
          '/msges/deletemsggroup',
          {
            msgId: msg.id,
            chatId: chatId,
            from,
            to
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
      } else {
        await instance.post(
          '/msges/deletemsg',
          {
            msgId: msg.id,
            chatId: chatId,
            from,
            to
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleEdit = async e => {
    let value = editedValue;
    try {
      if (value !== '') {
        if (user.groupChat) {
          console.log('asdf');
          value = addUserIdToMentions(user.groupChat.groupChatRef, value, 'G');
          await instance.post(
            '/msges/editmsggroup',
            {
              from,
              to,
              msgId: msg.id,
              chatId,
              content: value
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          );

          setEditin(false);
        } else {
          value = addUserIdToMentions([user], value, 'C');
          await instance.post(
            '/msges/editmsg',
            {
              from,
              to,
              msgId: msg.id,
              chatId,
              content: value
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          );

          setEditin(false);
        }
      } else if (value.length === 0) {
        await handleDelete();
      }
    } catch (error) {
      console.log(error);
    }
  };
  function findUrls(text) {
    const urlRegex = /(?:(?:https?:\/\/)|(?:www\.))\S+/gi;
    const urls = [];
    let match;

    while ((match = urlRegex.exec(text)) !== null) {
      const url = match[0];
      const startIndex = match.index;
      const endIndex = urlRegex.lastIndex - 1;
      urls.push({ url, startIndex, endIndex });
    }

    return urls;
  }
  const DeletePopup = styled(Popup)`
    &-content {
      border: none;
      height: ${props => props.height};
      padding: 0;
      width: 550px;
      border-radius: 10px;
    }
  `;

  const ForwardPopup = styled(Popup)`
    &-content {
      border: none;
      height: ${props => props.height};
      padding: 0;
      width: 600px;
      border-radius: 10px;
    }
  `;

  return (
    <div className="relative mt-8 ">
      {msg.isReply ? (
        !msg.reptedTO ? (
          <div className="  text-white flex">
            <img src={Replay} className="w-[20px] h-[20px] ml-6 mr-1" alt="Loading.." />
            <div>replyed message was deleted</div>
          </div>
        ) : (
          <div className="flex">
            <img src={Replay} className="w-[20px] h-[20px] ml-6 mr-1" alt="Loading.." />
            <div className="text-white">replyed to:</div>
            <div
              className="text-[#4D96DA] cursor-pointer ml-1"
              onClick={() => {
                msgFocus(msg.reptedTO.id);
              }}
            >
              {msg.reptedTO.from.name}
            </div>
          </div>
        )
      ) : null}
      {clicked && msg.type !== 'CMD' && msg.from.id === me.id && msg.type === 'MSG' ? (
        <div className="z-10 w-[200px] h-[40px] bg-[#585B66] rounded-[5px] flex left-[82.5%]  absolute flex-wrap justify-evenly content-center ">
          <div
            className="flex  h-full  w-[25%] justify-evenly  content-center flex-wrap  hover:bg-[#B4B4B4] rounded-[5px] cursor-pointer"
            onClick={() => {
              replySetter(msg);
            }}
          >
            <img alt="Replay" src={Replay} className="w-[25px] h-[25px] cursor-pointer  " />
          </div>
          <div
            className="flex  h-full  w-[25%] justify-evenly  content-center flex-wrap  hover:bg-[#B4B4B4] rounded-[5px] cursor-pointer"
            onClick={() => {
              setEditMsgOpen(true);
            }}
          >
            <img alt="Forward" src={Forward} className="w-[25px] h-[25px] cursor-pointer  " />
          </div>
          {!msg.isReply ? (
            <ForwardPopup
              open={editMsgOpen}
              onClose={() => {
                setEditMsgOpen(false);
              }}
              position={'center center'}
              closeOnDocumentClick={false}
              modal
              closeOnEscape={false}
              height="330px"
            >
              {close => <ForwardPopUp close={close} msg={msg} time={time} />}
            </ForwardPopup>
          ) : null}

          <div className="flex  h-full   w-[25%] flex-wrap justify-evenly  content-center hover:bg-[#B4B4B4] rounded-[5px] cursor-pointer">
            <img
              alt="Edit"
              src={Edit}
              className="w-[16px] h-[16px] cursor-pointer"
              onClick={() => {
                setEditin(true);
              }}
            />
          </div>
          <div
            className="flex   h-full  w-[25%] justify-evenly  content-center flex-wrap hover:bg-[#B4B4B4] rounded-[5px] cursor-pointer"
            onClick={() => {
              setDeleteMsgOpen(true);
            }}
          >
            <img alt="Delete" src={Delete} className="w-[16px] h-[16px] " />
          </div>

          <DeletePopup
            height="330px"
            open={deleteMsgOpen}
            onClose={() => {
              setDeleteMsgOpen(false);
            }}
            position={'center center'}
            closeOnDocumentClick={false}
            modal
            closeOnEscape={false}
          >
            {close => <DeleteMsgPopup msg={msg} close={close} time={time} deleteFunc={handleDelete} />}
          </DeletePopup>
        </div>
      ) : clicked && msg.type !== 'CMD' && msg.from.id === me.id ? (
        <div className="z-10 w-[150px] h-[40px] bg-[#585B66] rounded-[5px] flex  left-[86%]  absolute flex-wrap justify-evenly content-center">
          <div
            className="flex  h-full  w-[33%] justify-evenly  content-center flex-wrap  hover:bg-[#B4B4B4] rounded-[5px] cursor-pointer"
            onClick={() => {
              replySetter(msg);
            }}
          >
            <img alt="Replay" src={Replay} className="w-[25px] h-[25px] cursor-pointer  " />
          </div>
          <div
            className="flex  h-full  w-[33%] justify-evenly  content-center flex-wrap  hover:bg-[#B4B4B4] rounded-[5px] cursor-pointer"
            onClick={() => {
              setEditMsgOpen(true);
            }}
          >
            <img alt="Forward" src={Forward} className="w-[25px] h-[25px] cursor-pointer  " />
          </div>
          {!msg.isReply ? (
            <ForwardPopup
              position={'center center'}
              closeOnDocumentClick={false}
              open={editMsgOpen}
              onClose={() => {
                setEditMsgOpen(false);
              }}
              modal
              closeOnEscape={false}
              height={`${msg.type === 'FILE' ? '350px' : '500px'}`}
            >
              {close => <ForwardPopUp close={close} msg={msg} time={time} />}
            </ForwardPopup>
          ) : null}
          <div
            className="flex   h-full  w-[33%] justify-evenly  content-center flex-wrap hover:bg-[#B4B4B4] rounded-[5px] cursor-pointer"
            onClick={() => {
              setDeleteMsgOpen(true);
            }}
          >
            <img alt="Delete" src={Delete} className="w-[16px] h-[16px] " />
          </div>

          <DeletePopup
            height={`${msg.type === 'FILE' ? '380px' : '480px'}`}
            position={'center center'}
            open={deleteMsgOpen}
            onClose={() => {
              setDeleteMsgOpen(false);
            }}
            closeOnDocumentClick={false}
            modal
            closeOnEscape={false}
          >
            {close => <DeleteMsgPopup msg={msg} close={close} time={time} deleteFunc={handleDelete} />}
          </DeletePopup>
        </div>
      ) : clicked && msg.type !== 'CMD' ? (
        <div className="z-10 w-[100px] h-[40px] bg-[#585B66] rounded-[5px] flex  left-[90%]  absolute flex-wrap justify-evenly content-center">
          {!msg.isReply ? (
            <ForwardPopup
              position={'center center'}
              closeOnDocumentClick={false}
              modal
              closeOnEscape={false}
              height={`${msg.type === 'MSG'
                  ? '330px'
                  : msg.type === 'VIDEO' || msg.type === 'IMG'
                    ? '500px'
                    : msg.type === 'FILE'
                      ? '350px'
                      : null
                }`}
              trigger={
                <div className="flex  h-full  w-[50%] justify-evenly  content-center flex-wrap  hover:bg-[#B4B4B4] rounded-[5px] cursor-pointer">
                  <img alt="Forward" src={Forward} className="w-[25px] h-[25px] cursor-pointer  " />
                </div>
              }
            >
              {close => <ForwardPopUp close={close} msg={msg} time={time} />}
            </ForwardPopup>
          ) : null}
          <div
            className="flex  h-full  w-[50%] justify-evenly  content-center flex-wrap  hover:bg-[#B4B4B4] rounded-[5px] cursor-pointer"
            onClick={() => {
              replySetter(msg);
            }}
          >
            <img alt="Replay" src={Replay} className="w-[25px] h-[25px] cursor-pointer  " />
          </div>
        </div>
      ) : null}

      <div
        className={`flex flex-wrap w-full ${msg.type === 'CMD' ? 'justify-center' : 'justify-start'} relative  `}
        style={{ background: `${clicked && msg.type !== 'CMD' ? '#585B66' : 'transparent'}` }}
      >
        {msg.type === 'CMD' ? (
          <div className="p-2 relative    text-[14px]     text-white ">{msg.content}</div>
        ) : (
          <div className="w-full flex ml-6 mt-2 ">
            <img alt="pic" src={msg.from.profilePic} className="w-[40px] h-[40px] rounded-[3px] object-contain" />
            <div className=" ml-2 flex flex-col w-full">
              <div className="flex ">
                <div className="text-[16px] font-[700] text-white">{msg.from.id === me.id ? 'Me' : msg.from.name}</div>
                <div className="text-[13px] font-[400] text-[#B4B4B4] ml-1 ">{time}</div>
                {msg.forwarded ? <div className="text-[#B4B4B4] text-[13px] ml-1">(forwarded)</div> : null}
              </div>
              {msg.type === 'MSG' ? (
                editng && msg.from.id === me.id ? (
                  <div className=" flex bg-[#2B2D35] relative px-5 pt-4 flex-col">
                    <div className="flex flex-col w-[100%] bg-[#40444A] rounded-[10px] pl-2">
                      <textarea
                        className="outline-none w-[100%] max-w-[75%]  bg-[#40444A] text-white   rounded-[5px] px-1 py-3 resize-none  "
                        ref={chatRef}
                        style={{
                          height: `${getContentHeight(msg.content) + 50}px `,
                          maxHeight: `${getContentHeight(msg.content) + 200}px`
                        }}
                        onChange={e => {
                          chatRef.current.style.height = 'auto';
                          chatRef.current.style.height = `${chatRef.current.scrollHeight}px`;
                          setEditedValue(e.target.value);
                        }}
                        value={editedValue}
                      // value={editedValue}
                      />
                      <img
                        src={Smile}
                        alt="Emoji"
                        class=" dark:text-white text-[22px] cursor-pointer  w-[20px] h-[20px] ml-2 mb-2 "
                        onClick={() => {
                          setEmoji(!emoji);
                        }}
                      ></img>
                    </div>
                    <div className="flex  mt-8 mb-3 relative left-[82%] w-[220px]">
                      <button
                        class=" dark:text-white  cursor-pointer   h-[40px]  border-[1px] rounded-[5px] w-[100px] py-1 border-[#4D96DA] "
                        onClick={() => {
                          setEmoji(false);
                          setEditin(false);
                        }}
                      >
                        Cancle
                      </button>
                      <button
                        className=" border-none outline-none h-[40px] w-[100px] py-1 bg-[#4D96DA] text-white rounded-[5px]  ml-5 "
                        onClick={handleEdit}
                      >
                        Save
                      </button>
                    </div>
                    {emoji && clicked ? (
                      <div
                        className="absolute right-[14%] bottom-[20%]
          "
                      >
                        <EmojiPicker
                          width={300}
                          height={300}
                          theme="dark"
                          searchDisabled
                          onEmojiClick={emoji => {
                            setEditedValue(editedValue + emoji.emoji);
                          }}
                        />{' '}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div
                    className="max-w-[80%] text-[15px] overflow-hidden text-white font-400 "
                    style={{ whiteSpace: 'pre-line' }}
                  >
                    <LinkHighlighter text_={msg.content} currentUser={me.id} />
                  </div>
                )
              ) : msg.type === 'IMG' || msg.type === 'STICKER' ? (
                <div className="flex flex-col relative h-[180px] w-[250px]  ">
                  <img
                    alt={msg.content}
                    src={msg.url}
                    className="h-[180px] w-[250px] object-cover cursor-pointer "
                    onMouseEnter={() => {
                      setHidden(false);
                    }}
                    onMouseLeave={() => {
                      setHidden(true);
                    }}
                    onClick={() => {
                      setImgOpen(true);
                    }}
                  />
                  <ImgsViewer
                    imgs={[{ src: msg.url }]}
                    isOpen={imgOpen}
                    onClose={() => {
                      setImgOpen(false);
                    }}
                  />

                  <div
                    className=" flex w-[60px] h-[30px] absolute bg-[#585B66] z-10 right-[5%] rounded-[4px] mt-2  "
                    style={{ display: `${hidden ? 'none' : 'flex'}` }}
                    onMouseEnter={() => {
                      setHidden(false);
                    }}
                  >
                    <img
                      alt="download"
                      src={Download}
                      className="w-[18px] h-[18x] ml-2 mt-0 cursor-pointer"
                      onClick={() => {
                        downloadFile(msg.url, msg.content);
                      }}
                    />

                    <img alt="forward" src={Forward} className="w-[18px] h-[18px] ml-2 mt-1 cursor-auto" />
                  </div>
                  <div className="text-[12px] text-white mt-2  ">{msg.content}</div>
                </div>
              ) : msg.type === 'VIDEO' ? (
                <div
                  className="relative bottom-3 w-[300px] h-[200px] "
                  onMouseEnter={() => {
                    setHidden(false);
                  }}
                  onMouseLeave={() => {
                    setHidden(true);
                  }}
                >
                  <div
                    className=" flex w-[60px] h-[30px] absolute bg-[#585B66] z-10 right-[5%] rounded-[4px] mt-6  "
                    style={{ display: `${hidden ? 'none' : 'flex'}` }}
                    onMouseEnter={() => {
                      setHidden(false);
                    }}
                  >
                    <img
                      alt="download"
                      src={Download}
                      className="w-[18px] h-[18x] ml-2 mt-0 cursor-pointer"
                      onClick={() => {
                        downloadFile(msg.url, msg.content);
                      }}
                    />
                    <img alt="forward" src={Forward} className="w-[18px] h-[18px] ml-2 mt-1 cursor-auto" />
                  </div>
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      setImgOpen(true);
                    }}
                  >
                    <ReactPlayer url={msg.url} controls width="300px" height="200px" />
                  </div>

                  {imgOpen ? <FloatingVideoPlayer videoUrl={msg.url} close={setImgOpen} /> : null}
                </div>
              ) : msg.type === 'FILE' ? (
                <div
                  className="border-[1px] rounded-[10px] border-[#585B66] w-[300px] h-[70px] flex  bg-transparent text-white relative"
                  onMouseEnter={() => {
                    setHidden(false);
                  }}
                  onMouseLeave={() => {
                    setHidden(true);
                  }}
                >
                  <div
                    className=" flex w-[60px] h-[30px] absolute bg-[#585B66] z-10 right-[5%] rounded-[4px] mt-6  "
                    style={{ display: `${hidden ? 'none' : 'flex'}` }}
                    onMouseEnter={() => {
                      setHidden(false);
                    }}
                  >
                    <img
                      alt="download"
                      src={Download}
                      className="w-[18px] h-[18x] ml-2 mt-0 cursor-pointer"
                      onClick={() => {
                        downloadFile(msg.url, msg.content);
                      }}
                    />
                    <img alt="forward" src={Forward} className="w-[18px] h-[18px] ml-2 mt-1 cursor-auto" />
                  </div>
                  <div
                    className="w-[45px] h-[45px] ml-3 mt-2 cursor-pointer"
                    onClick={() => {
                      setImgOpen(true);
                    }}
                  >
                    <FileIcon extension={msg.content.split('.')[1]} {...defaultStyles[msg.content.split('.')[1]]} />
                  </div>
                  <div className="flex flex-col ml-3 mt-2  ">
                    <div
                      className="text-white font-[700] cursor-pointer"
                      onClick={() => {
                        setImgOpen(true);
                      }}
                    >
                      {msg.content}
                    </div>
                    <div className="text-[#B4B4B4]">{msg.content.split('.')[1]?.toUpperCase()}</div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
