import React, { useEffect, useState } from 'react';
import Cross from '../ph_x-bold.svg';
import SeachFileElement from './SeacrhFileElement';
import SeachMsgElement from './SeachMsgElement';
import { fileSeacrh } from '../utils/helper';
import { findMentionedMessages } from '../utils/mention';
import { useUserStore } from '../Stores/MainStore';
export default function SeacrchMsgesPopup({ msges, query, close, setMsgFocus }) {
  const me = useUserStore(state => state.user);
  function containsURL(message) {
    const urlRegex = /(?:(?:https?:\/\/)|(?:www\.))\S+/gi;
    return urlRegex.test(message);
  }
  const [toRender, setToRender] = useState([]);
  const [filter, setFilter] = useState('F');
  useEffect(() => {
    let msges_ = [];
    msges.forEach(x => {
      if (filter === 'F') {
        if (x.type === 'VIDEO' || x.type === 'IMG' || x.type === 'STICKER' || x.type === 'FILE') {
          msges_.push(x);
        }
      } else if (filter === 'M' || filter === 'L' || filter === 'ML') {
        if (x.type === 'MSG') {
          if (filter === 'M') {
            msges_.push(x);
          } else if (filter === 'L') {
            if (containsURL(x.content)) {
              msges_.push(x);
            }
          } else if (filter === 'ML') {
            let x = findMentionedMessages(msges, me.id);
            msges_ = x;
          }
        }
      }
    });
    if (query.length === 0) {
      setToRender(msges_);
    } else {
      console.log(msges_);
      let sorted_files = fileSeacrh(msges_, query);
      sorted_files = sorted_files.map(x => {
        return x.item;
      });
      setToRender(sorted_files);
    }
  }, [msges, filter, query]);
  return (
    <div className="w-full h-full bg-[#40434B] rounded-[10px] text-white flex flex-col">
      <div className="ml-8 mt-5 font-[700] text-[18px]">I’m looking for...</div>
      <img
        className="w-[20px] h-[20px] absolute right-[5%] top-[5%] cursor-pointer"
        alt="X"
        src={Cross}
        onClick={() => {
          close(false);
        }}
      />
      <div className="flex ml-8 mt-5 text-sm">
        <button
          className="px-4 py-2 bg-transparent border-[1px] border-[#4D96DA] rounded-[5px] flex flex-wrap justify-center content-center outline-none"
          onClick={() => {
            setFilter('M');
          }}
          style={{ background: `${filter === 'M' ? '#4D96DA' : 'transparent'}` }}
        >
          Messages
        </button>
        <button
          className="px-4 py-2 bg-transparent border-[1px] border-[#4D96DA] rounded-[5px] flex flex-wrap justify-center content-center outline-none text-sm ml-2"
          onClick={() => {
            setFilter('ML');
          }}
          style={{ background: `${filter === 'ML' ? '#4D96DA' : 'transparent'}` }}
        >
          Mentions
        </button>

        <button
          className="px-4 py-2 bg-transparent border-[1px] border-[#4D96DA] ml-3 rounded-[5px] flex flex-wrap justify-center outline-none "
          onClick={() => {
            setFilter('L');
          }}
          style={{ background: `${filter === 'L' ? '#4D96DA' : 'transparent'}` }}
        >
          Links
        </button>
        <button
          className="px-4 py-2 bg-transparent border-[1px] border-[#4D96DA] ml-3 rounded-[5px] flex outline-none"
          style={{ background: `${filter === 'F' ? '#4D96DA' : 'transparent'}` }}
          onClick={() => {
            setFilter('F');
          }}
        >
          Files
        </button>
      </div>
      <div className="w-[85%] ml-8 h-0 border-[1px] border-[#585B66] mt-5"></div>
      <div className=" max-h-[280px] mt-5 overflow-y-scroll max-w-[90%] overflow-x-hidden">
        {toRender.map(msg => {
          return filter === 'F' ? (
            <div className="ml-8">
              <SeachFileElement msg={msg} />
            </div>
          ) : filter === 'M' || filter === 'L' || filter === 'ML' ? (
            <div
              className="ml-8 mt-3 cursor-pointer"
              onClick={() => {
                setMsgFocus(msg.id);
              }}
            >
              <SeachMsgElement msg={msg} />
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
}
