import React, { useEffect, useRef, useState } from 'react';
import Popup from 'reactjs-popup';
import { useUserStore } from '../Stores/MainStore';
import { useChannel } from '@ably-labs/react-hooks';

import ReactPlayer from 'react-player';
import { getStorage, ref } from 'firebase/storage';

import axios from 'axios';
import { instance } from '../axios';

export default function MsgElement({ msg, chatId, from, to, type }) {
  const me = useUserStore(state => state.user);
  const [hovering, setHovering] = useState(false);
  const [editng, setEditin] = useState(false);
  const [value, setValue] = useState(msg.content);
  useEffect(() => {
    setValue(msg.content);
  }, [msg]);
  const editRef = useRef();
  const handleEditChang = e => {
    setValue(e.target.value);
  };

  const [server_channel, _] = useChannel('server', () => { });
  let accessToken = localStorage.getItem('token');
  const handleDelete = async close => {
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
      close();
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
    <div
      className={`flex flex-wrap w-full ${msg.type === 'CMD' ? 'justify-center' : msg.from.id === me.id ? 'justify-end' : ''
        } `}
    >
      {msg.type === 'CMD' ? (
        <div className="p-2 relative  left-[3%] mt-5 text-[18px]  rounded-tl-none rounded-xl pl-3 pr-3 dark:text-white">
          {msg.content}
        </div>
      ) : msg.from.id === me.id ? (
        <div
          className="flex justify-end w-full "
          onMouseEnter={() => {
            setHovering(true);
          }}
          onMouseLeave={() => {
            setHovering(false);
          }}
        >
          {msg.type === 'IMG' ? (
            <div className="max-w-[320px] max-h-[230px] mr-6 mt-5 relative overflow-scroll">
              <img alt="loading.." src={msg.url} className="object-contain" />
            </div>
          ) : msg.type === 'VIDEO' ? (
            <div className="w-[320px] h-[230px] mr-6 mt-5">
              <ReactPlayer url={msg.url} width="440" height="230" controls />
            </div>
          ) : msg.type === 'FILE' ? (
            <div>
              <div className="bg-[#4D96DA] p-4   text-[18px] rounded-xl pl-3 pr-3 rounded-tr-none  relative mr-6 mt-5  dark:text-white">
                <div
                  className="w-[95%] text-[16px] px-4 bg-white text-black rounded-md cursor-pointer "
                  onClick={() => {
                    window.location.href = msg.url;
                  }}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          ) : editng ? (
            <div className="bg-[#4D96DA] p-2   text-[18px] rounded-xl pl-3 pr-3 rounded-tr-none  relative mr-6 mt-5  dark:text-white flex ">
              <input
                ref={editRef}
                className="bg-[#4D96DA] outline-none rounded-xl rounded-tr-none text-white  "
                value={value}
                onChange={handleEditChang}
                onKeyDown={handleEdit}
              />
              <div className="text-red-500 text-[18px] cursor-pointer font-extrabold" onClick={() => setEditin(false)}>
                x
              </div>
            </div>
          ) : (
            <div className="bg-[#4D96DA] p-2   text-[18px] rounded-xl pl-3 pr-3 rounded-tr-none  relative mr-6 mt-5  dark:text-white flex   max-w-[45%]">
              {msg.content}
            </div>
          )}

          <Popup
            trigger={
              <i
                className="fa-solid fa-ellipsis-vertical dark:text-white relative right-4 mt-5 text-[18px] cursor-pointer      "
                style={{ visibility: `${!hovering ? 'hidden' : 'visible'}` }}
              ></i>
            }
            position="left top"
            on="click"
            closeOnDocumentClick
            mouseLeaveDelay={300}
            mouseEnterDelay={0}
            contentStyle={{
              padding: '0px',
              border: 'none',
              width: '60px',
              height: '20px',
              marginBottom: '80px'
            }}
            arrow={false}
          >
            {close => (
              <div className="w-[60px] h-[30px] flex flex-col">
                {msg.type === 'MSG' ? (
                  <div
                    className=" bg-[#8F8F8F] text-white rounded-t-md text-center cursor-pointer"
                    onClick={() => {
                      setEditin(true);
                      setTimeout(() => {
                        editRef.current.focus();
                        close();
                      }, 300);
                    }}
                  >
                    Edit
                  </div>
                ) : null}

                <div
                  className="text-[#868686] bg-[#D8D8D8] rounded-bl-md text-center cursor-pointer"
                  onClick={() => {
                    handleDelete(close);
                  }}
                >
                  Delete
                </div>
              </div>
            )}
          </Popup>
        </div>
      ) : msg.type === 'IMG' ? (
        <div className="max-w-[320px] overflow-scroll max-h-[230px] ml-6 mt-6">
          <img alt="loading.." src={msg.url} className="object-contain" />
        </div>
      ) : msg.type === 'VIDEO' ? (
        <div className="w-[320px] h-[230px] ml-6 mt-6">
          <ReactPlayer url={msg.url} width="640" height="360" controls />
        </div>
      ) : msg.type === 'FILE' ? (
        <div>
          <div className="bg-[#E9EFF4] p-4   text-[18px] rounded-xl pl-3 pr-3 rounded-tl-none  relative ml-6 mt-5  dark:text-white">
            <div
              className="w-[95%] text-[16px] px-4 bg-[#4D96DA] text-black rounded-md cursor-pointer "
              onClick={() => {
                window.location.href = msg.url;
              }}
            >
              {msg.content}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#E9EFF4] p-2 relative  left-[3%] mt-5 text-[18px]  rounded-tl-none rounded-xl pl-3 pr-3 max-w-[45%] ">
          {msg.content}
        </div>
      )}
    </div>
  );
}
