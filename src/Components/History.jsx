import React, { useEffect, useState } from 'react';
import { useHistoryStore } from '../Stores/MainStore';

export default function History({ workspaceId }) {
  const [histroy, setHistory] = useState([]);
  let histroys = useHistoryStore(state => state.historys);
  useEffect(() => {
    if (histroy) {
      // histroys.forEach(x => {
      //   if (x.workspaceId === workspaceId) {
      //     setHistory(x.entrys);
      //   }
      //});
    }
  }, [workspaceId]);
  return (
    <div className="w-full h-full  max-h-full overflow-y-scroll flex flex-col bg-[#37393F] text-white">
      <div className="ml-8 mt-8 text-white font-[700]">Recent</div>
      {histroy.map(entry => {
        return <div>{entry.content}</div>;
      })}
    </div>
  );
}
