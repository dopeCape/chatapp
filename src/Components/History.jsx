import React, { useEffect, useState } from 'react';
import { useHistoryStore } from '../Stores/MainStore';
import GroupSym from '../Frame 98.svg';

export default function History({ workspaceId }) {
  const [histroy, setHistory] = useState([]);
  let histroys = useHistoryStore(state => state.historys);
  useEffect(() => {
    if (histroy) {
      histroys.forEach(x => {
        if (x.workspaceId === workspaceId) {
          setHistory(x.entrys);
        }
      });
    }
  }, [workspaceId]);
  return (
    <div className="w-full h-full  max-h-full overflow-y-scroll flex flex-col bg-[#37393F] text-white rounded-[10px]">
      <div className="ml-8 mt-8 text-white ">Recent</div>
      <div className="mt-5 max-h-[75%]  overflow-y-scroll overflow-x-hidden  ">
        {histroy.map(entry => {
          return (
            <div className="ml-8  flex mb-6">
              {entry.type === 'CHANNEL' ? (
                <div className="flex mb">
                  <i class="fa-solid  fa-hashtag text-white text-[13px] mt-1 "></i>

                  <div className=" ml-2 font-[700]">{entry.content}</div>
                </div>
              ) : (
                <div className="flex">
                  <img className=" h-[18px]  relative right-[3%]" alt={entry.type} src={GroupSym} />

                  <div className="  font-[700] ml-1 ">{entry.content}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
