import React, { useEffect, useState } from 'react';
import { userSeach } from '../utils/helper';
export default function MentionMenu({ users, setMention, inputRef, type = 'C', query }) {
  const [user_, setUsers] = useState([]);
  useEffect(() => {
    let temp_users;
    if (type === 'G') {
      temp_users = users.map(x => {
        return x.user.user;
      });
      temp_users.push({ name: 'all', id: '1234565' });
      console.log(query);
      temp_users = userSeach(temp_users, query).map(i => {
        return i.item;
      });
      setUsers(temp_users);
    } else {
      setUsers(users);
    }
  }, [users, query]);
  return (
    <div className="w-full h-full max-h-full overflow-scroll flex flex-col-reverse rounded-[10px] bg-[#515357] p-2  px-0 pt-3">
      {type === 'C' ? (
        <div
          className="w-full h-[40px] pl-8 flex hover:bg-[#4D96DA] content-center flex-wrap cursor-pointer"
          onClick={() => {
            if (inputRef.current !== undefined) {
              let temp = inputRef.current?.value;
              temp = temp.split(' ').slice(0, -1).join(' ');
              inputRef.current.value = temp + ` @${users.name} `;
            }
            inputRef.current.focus();
            setMention(false);
          }}
        >
          <img className="w-[25px] h-[25px] rounded-[5px]" alt="loading.." src={users.profilePic} />
          <div className="ml-2 text-white">{users.name}</div>
        </div>
      ) : (
        user_.map(user => {
          return (
            <div
              className="w-full h-[40px] pl-8 flex hover:bg-[#4D96DA] content-center flex-wrap cursor-pointer text-white"
              onClick={() => {
                if (inputRef.current !== undefined) {
                  let temp = inputRef.current?.value;
                  temp = temp.split(' ').slice(0, -1).join(' ');
                  inputRef.current.value = temp + ` @${user.name} `;
                }
                inputRef.current.focus();
                setMention(false);
              }}
            >
              {user.name === 'all' ? '@' : <img className="w-[25px] h-[25px]" alt="loading.." src={user.profilePic} />}
              <div className="ml-2">{user.name}</div>
            </div>
          );
        })
      )}
    </div>
  );
}
