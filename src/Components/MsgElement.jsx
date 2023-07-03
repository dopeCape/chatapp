import React, { useEffect, useRef, useState } from 'react';
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
import { useUserStore } from '../Stores/MainStore';
import { useChannel } from '@ably-labs/react-hooks';
import ReactPlayer from 'react-player';
import Delete from '../delete.svg';
import axios from 'axios';
import { instance } from '../axios';
import DeleteMsgPopup from './DeleteMsgPopup';
import ForwardPopUp from './ForwardPopUp';
import FloatingVideoPlayer from './FloatingVideoPlayer';
import ReplyPopupC from './ReplyPopup';

export default function MsgElement({ msg, chatId, from, to, type, clicked }) {
  const me = useUserStore(state => state.user);
  const chatRef = useRef();
  const [editng, setEditin] = useState(false);
  const [editedValue, setEditedValue] = useState(msg.content);
  const [time, setTime] = useState();
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

  function downloadFile(url, filename) {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(blobUrl);
      })
      .catch(error => {
        console.error('Error:', error);
      });
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
      if (e.keyCode === 13 && value !== '' && !e.shiftKey) {
        if (msg.type === 'group') {
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
      } else if (value.length === 0 && e.keyCode === 13) {
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
  const ReplyPopup = styled(Popup)`
    &-content {
      border: none;
      height: ${props => props.height};
      padding: 0;
      width: 600px;
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
    <div className="relative   mt-8 ">
      {clicked && msg.type !== 'CMD' && msg.from.id === me.id && msg.type === 'MSG' ? (
        <div className="z-10 w-[150px] h-[40px] bg-[#585B66] rounded-[5px] flex left-[87.7%]  absolute flex-wrap justify-evenly content-center ">
          <ForwardPopup
            position={'center center'}
            closeOnDocumentClick={false}
            modal
            closeOnEscape={false}
            height="330px"
            trigger={
              <div className="flex  h-full  w-[33%] justify-evenly  content-center flex-wrap  hover:bg-[#B4B4B4] rounded-[5px] cursor-pointer">
                <img alt="Forward" src={Forward} className="w-[25px] h-[25px] cursor-pointer  " />
              </div>
            }
          >
            {close => <ForwardPopUp close={close} msg={msg} time={time} />}
          </ForwardPopup>

          <div className="flex  h-full   w-[33%] flex-wrap justify-evenly  content-center hover:bg-[#B4B4B4] rounded-[5px] cursor-pointer">
            <img
              alt="Edit"
              src={Edit}
              className="w-[16px] h-[16px] cursor-pointer"
              onClick={() => {
                setEditin(true);
              }}
            />
          </div>
          <DeletePopup
            height="330px"
            position={'center center'}
            closeOnDocumentClick={false}
            modal
            closeOnEscape={false}
            trigger={
              <div className="flex   h-full  w-[33%] justify-evenly  content-center flex-wrap hover:bg-[#B4B4B4] rounded-[5px] cursor-pointer">
                <img alt="Delete" src={Delete} className="w-[16px] h-[16px] " />
              </div>
            }
          >
            {close => <DeleteMsgPopup msg={msg} close={close} time={time} deleteFunc={handleDelete} />}
          </DeletePopup>
        </div>
      ) : clicked && msg.type !== 'CMD' && msg.from.id === me.id ? (
        <div className="z-10 w-[100px] h-[40px] bg-[#585B66] rounded-[5px] flex  left-[91.8%]  absolute flex-wrap justify-evenly content-center">
          <ForwardPopup
            position={'center center'}
            closeOnDocumentClick={false}
            modal
            closeOnEscape={false}
            height={`${msg.type === 'FILE' ? '350px' : '550px'}`}
            trigger={
              <div className="flex  h-full  w-[50%] justify-evenly  content-center flex-wrap  hover:bg-[#B4B4B4] rounded-[5px] cursor-pointer">
                <img alt="Forward" src={Forward} className="w-[25px] h-[25px] cursor-pointer  " />
              </div>
            }
          >
            {close => <ForwardPopUp close={close} msg={msg} time={time} />}
          </ForwardPopup>

          <DeletePopup
            height={`${msg.type === 'FILE' ? '380px' : '480px'}`}
            position={'center center'}
            closeOnDocumentClick={false}
            modal
            closeOnEscape={false}
            trigger={
              <div className="flex   h-full  w-[50%] justify-evenly  content-center flex-wrap hover:bg-[#B4B4B4] rounded-[5px] cursor-pointer">
                <img alt="Delete" src={Delete} className="w-[16px] h-[16px] " />
              </div>
            }
          >
            {close => <DeleteMsgPopup msg={msg} close={close} time={time} deleteFunc={handleDelete} />}
          </DeletePopup>
        </div>
      ) : clicked && msg.type !== 'CMD' ? (
        <div className="z-10 w-[100px] h-[40px] bg-[#585B66] rounded-[5px] flex  left-[91.8%]  absolute flex-wrap justify-evenly content-center">
          <ForwardPopup
            position={'center center'}
            closeOnDocumentClick={false}
            modal
            closeOnEscape={false}
            height={`${msg.type === 'MSG'
                ? '330px'
                : msg.type === 'VIDEO' || msg.type === 'IMG'
                  ? '550px'
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
          <ReplyPopup
            position={'center center'}
            closeOnDocumentClick={false}
            modal
            height={msg.type === 'MSG' ? '350px' : msg.type === 'FILE' ? '400px' : '600px'}
            closeOnEscape={false}
            trigger={
              <div className="flex  h-full  w-[50%] justify-evenly  content-center flex-wrap  hover:bg-[#B4B4B4] rounded-[5px] cursor-pointer">
                <img alt="Replay" src={Replay} className="w-[25px] h-[25px] cursor-pointer  " />
              </div>
            }
          >
            {close => <ReplyPopupC close={close} msg={msg} />}
          </ReplyPopup>
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
              </div>
              {msg.type === 'MSG' ? (
                editng && msg.from.id === me.id ? (
                  <div className=" flex bg-[#40434B] relative">
                    <textarea
                      className="outline-none w-[75%] max-w-[75%]  bg-[#40434B] text-white   rounded-[5px] px-1 py-3 resize-none  "
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
                      onKeyDown={handleEdit}
                      value={editedValue}
                    />
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
                    <img
                      src={Smile}
                      alt="Emoji"
                      class=" dark:text-white text-[22px] cursor-pointer  w-[20px] h-[20px] absolute bottom-[5%] left-[75%]"
                      onClick={() => {
                        setEmoji(!emoji);
                      }}
                    ></img>
                    <img
                      src={Cross}
                      alt="Close"
                      class=" dark:text-white text-[22px] cursor-pointer ml-5 w-[20px] h-[20px] absolute bottom-[5%] left-[76%]"
                      onClick={() => {
                        setEmoji(false);
                        setEditin(false);
                      }}
                    ></img>
                  </div>
                ) : (
                  <div className="max-w-[70%] text-[15px] text-white font-400 " style={{ whiteSpace: 'pre-line' }}>
                    <LinkHighlighter text={msg.content} />
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
