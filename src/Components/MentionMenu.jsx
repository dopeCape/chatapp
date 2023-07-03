import React from 'react';
export default function MentionMenu({ users, type }) {
  return (
    <div className="w-full h-full max-h-full overflow-scroll flex flex-col-reverse rounded-[10px] bg-[#515357] p-2  px-0 pt-3">
      {type === 'C' ? (
        <div className="w-full h-[40px] pl-8 flex hover:bg-[#4D96DA] content-center flex-wrap cursor-pointer">
          <img className="w-[25px] h-[25px] rounded-[5px]" alt="loading.." src={users.profilePic} />
          <div className="ml-2 text-white">{users.name}</div>
        </div>
      ) : (
        users.map(user => {
          return (
            <div className="w-full h-[40px] pl-8 flex">
              <img className="w-[25px] h-[25px]" alt="loading.." srcl={user.profilePic} />
              <div className="ml-2">{user.name}</div>
            </div>
          );
        })
      )}
    </div>
  );
}
