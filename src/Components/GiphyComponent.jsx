import axios, { Axios } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { instance } from '../axios';
import { search } from '../utils/helper';

import { useChannel } from '@ably-labs/react-hooks';
export default function GiphyComponen({ user, me, chatId, reply, setReply }) {
  const [sti, setSti] = useState([]);

  const [server_channel, _] = useChannel('server', () => { });
  useEffect(() => {
    const feter = async () => {
      let res = await axios.get(
        `https://api.giphy.com/v1/stickers/trending?api_key=${process.env.REACT_APP_STICKER_KEY}=15`
      );
      console.log(res.data.data);

      setSti(res.data.data);
    };
    feter();
  }, []);
  const accessToken = localStorage.getItem('token');
  const searchRef = useRef();
  const handleSearch = e => {
    if (searchRef.current.value !== '') {
      fetchSearch(searchRef.current.value);
    }
  };
  const handleSendSticker = async url => {
    let isReply = reply ? true : false;
    let replyedTo = reply ? reply.id : null;
    if (user.groupChat) {
      let to = user.groupChat.groupChatRef.map(x => {
        return x.user.user.id;
      });
      await instance.post(
        '/msges/newgroupmsg',
        {
          content: 'sticker',
          url: url,
          type: 'STICKER',
          from: me.id,
          to: to,
          chatId: chatId,
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
      await instance.post(
        '/msges/newmsg',
        {
          content: 'sticker',
          url: url,
          type: 'STICKER',
          from: me.id,
          to: user.user.id,
          friendId: user.user.chatWorkSpaces.Friend[0].id,
          chatId: chatId,
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
    setReply(null);
  };
  const fetchSearch = async query => {
    try {
      let res = await axios.get(
        `https://api.giphy.com/v1/stickers/search?api_key=${process.env.REACT_APP_STICKER_KEY}&q=${query}&limit=15`
      );
      console.log(res.data.data);

      setSti(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-2 bg-[#585B66] dark:text-white w-[90%] rounded-lg mb-3  ">
        <input
          className="bg-transparent outline-none"
          placeholder="find stickers"
          ref={searchRef}
          onChange={handleSearch}
        />
      </div>
      <div className="w-full  gap-3 h-full grid grid-flow-row-dense grid-cols-3 auto-rows-max    max-h-full overflow-scroll border-white  bg-[#585B66]">
        {sti.map(x => {
          return (
            <div
              className="w-full h-full bg-[#585B66] cursor-pointer"
              onClick={() => {
                handleSendSticker(x.images.fixed_width.url);
              }}
            >
              {' '}
              <img src={x.images.fixed_height_small.url} alt="samosa" className="w-full h-full" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
