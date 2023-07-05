import React from 'react';
import { useUserStore } from '../Stores/MainStore';
import LinkHighlighter from './LinkHeilight';
function HighlightedText({ text, start, end }) {
  const highlightedPart = text.slice(start, end);

  return (
    <span>
      {text.slice(0, start)}
      <mark>{highlightedPart}</mark>
      {text.slice(end)}
    </span>
  );
}

export default function SeachMsgElement({ msg }) {
  const me = useUserStore(state => state.user);
  return (
    <div className="flex text-white ">
      <img alt="loading.." src={msg.from.profilePic} className="w-[50px] h-[50px] rounded-[5px]" />
      <div className="flex flex-col ml-2 max-w-[280px] ">
        <div className="font-[700]  relative bottom-1">{msg.from.id === me.id ? 'Me' : msg.from.name}</div>
        <LinkHighlighter text_={msg.content} currentUser={me.id} />
      </div>
    </div>
  );
}
