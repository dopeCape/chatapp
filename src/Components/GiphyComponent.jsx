import axios, { Axios } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { search } from '../utils/helper';
import { instance } from '../axios';

import { useWorkSpaceStore } from '../Stores/MainStore';
import { useChannel } from '@ably-labs/react-hooks';
export default function GiphyComponen({ user, me, chatId, type }) {
  const [sti, setSti] = useState([]);
  const workspace = useWorkSpaceStore(state => state.workspace);

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
  let accessToken = localStorage.getItem('token');
  const searchRef = useRef();
  const handleSearch = e => {
    if (searchRef.current.value !== '') {
      fetchSearch(searchRef.current.value);
    }
  };
  const handleSendSticker = async url => {
    if (user.name) {
      await instance.post(
        '/msges/newgroupmsg',
        {
          content: 'sticker',
          url: url,
          type: 'IMG',
          from: me.id,
          to: user.user,
          chatId: chatId
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
    } else {
      if (type === 'new') {
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
            content: 'sticker',
            url: url,
            type: 'IMG'
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
            type: 'IMG',
            from: me.id,
            to: user.user.id,
            chatId: chatId
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
      }
    }
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
      <div className="p-2 bg-[#121316] dark:text-white w-[90%] rounded-lg mb-3  ">
        <input
          className="bg-transparent outline-none"
          placeholder="find stickers"
          ref={searchRef}
          onChange={handleSearch}
        />
      </div>
      <div className="w-full  gap-3 h-full grid grid-flow-row-dense grid-cols-3 auto-rows-max    max-h-full overflow-scroll border-white border-[1px]">
        {sti.map(x => {
          return (
            <div
              className="w-full h-full bg-red-300 cursor-pointer"
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

  
    
      
        
        
          
        
      
        
        
      
