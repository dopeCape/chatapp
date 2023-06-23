import React, { useEffect, useRef, useState } from 'react';
import Popup from 'reactjs-popup';
import ImgsViewer from 'react-images-viewer';
import { FileIcon, defaultStyles } from 'react-file-icon';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import Edit from '../Group.svg';

import Forward from '../forward.svg';
import Download from '../download.svg';
import { useUserStore } from '../Stores/MainStore';
import { useChannel } from '@ably-labs/react-hooks';

import ReactPlayer from 'react-player';
import Delete from '../Vector(1).svg';

import { getStorage, ref } from 'firebase/storage';

import axios from 'axios';
import { instance } from '../axios';

export default function MsgElement({ msg, chatId, from, to, type, clicked }) {
  const me = useUserStore(state => state.user);
  const [hovering, setHovering] = useState(false);
  const [editng, setEditin] = useState(false);
  const [time, setTime] = useState();
  const [imgOpen, setImgOpen] = useState(false);

  const [value, setValue] = useState(msg.content);
  useEffect(() => {
    setValue(msg.content);
  }, [msg]);
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
    fetch(url, { method: 'get', mode: 'no-cors', referrerPolicy: 'no-referrer' })
      .then(res => res.blob())
      .then(res => {
        const aElement = document.createElement('a');
        aElement.setAttribute('download', filename);
        const href = URL.createObjectURL(res);
        aElement.href = href;
        aElement.setAttribute('target', '_blank');
        aElement.click();
        URL.revokeObjectURL(href);
      });
  }
  const editRef = useRef();
  const handleEditChang = e => {
    setValue(e.target.value);
  };
  const [hidden, setHidden] = useState(true);

  const [server_channel, _] = useChannel('server', () => { });
  let accessToken = localStorage.getItem('token');
  const handleDelete = async () => {
    try {
      if (msg.type !== 'MSG' && msg.type !== 'CMD') {
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
    try {
      if (e.keyCode === 13 && value !== '') {
        if (type === 'group') {
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
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={`flex flex-wrap w-full ${msg.type === 'CMD' ? 'justify-center' : 'justify-start'} relative mt-8 `}>
      {clicked ? (
        <div className="z-10 absolute w-[150px] h-[130px] bg-[#585B66] right-[2%] rounded-[5px] flex flex-col ">
          <div className="flex  mt-4 ml-6">
            <img alt="Forward" src={Forward} />
            <div className="text-white font-[400] ml-3 ">Forward</div>
          </div>

          <div className="flex  mt-4 ml-6">
            <img alt="Edit" src={Edit} />
            <div className="text-white font-[400] ml-3 ">Edit</div>
          </div>

          <div className="flex  mt-4 ml-6">
            <img alt="Delete" src={Delete} />
            <div className="text-[#DA4D4D] font-[400] ml-3 ">Delete</div>
          </div>
        </div>
      ) : null}
      {msg.type === 'CMD' ? (
        <div className="p-2 relative  left-[3%]  text-[14px]   pl-3 pr-3 text-white ">{msg.content}</div>
      ) : (
        <div className="w-full flex ">
          <img alt="pic" src={msg.from.profilePic} className="w-[40px] h-[40px] rounded-[3px] object-contain" />
          <div className=" ml-2 flex flex-col w-full">
            <div className="flex ">
              <div className="text-[16px] font-[700] text-white">{msg.from.id === me.id ? 'Me' : msg.from.name}</div>
              <div className="text-[13px] font-[400] text-[#B4B4B4] ml-1 ">{time}</div>
            </div>
            {msg.type === 'MSG' ? (
              <div className="max-w-[70%] text-[15px] text-white font-400">{msg.content}</div>
            ) : msg.type === 'IMG' ? (
              <div className="flex flex-col relative h-[180px] w-[250px]  ">
                <img
                  alt={msg.content}
                  src={msg.url}
                  className="h-[180px] w-[250px] object-cover "
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

                <ReactPlayer url={msg.url} controls width="300px" height="200px" />
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
  );
}
