import React, { useState } from 'react';
import Spinner from '../Spin-1s-200px.svg';
import { instance } from '../axios';
import Cross from '../ph_x-bold.svg';
import { useWorkSpaceStore, useUserStore } from '../Stores/MainStore';
import { simpleSearch } from '../utils/helper';

export default function AddUsersToGroupPopup({ close, groupChat }) {
  const me = useUserStore(state => state.user);
  const [searchUsers, setSearchUsers] = useState([]);
  const [searBar, setSearBar] = useState('');
  const [selecrtedUsers, setSelecterdUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const workspace = useWorkSpaceStore(state => state.workspace);
  const accessToken = localStorage.getItem('token');
  const handleAddUser = async () => {
    try {
      if (selecrtedUsers.length > 0) {
        setLoading(true);
        await instance.post(
          '/gchat/add',
          {
            workspaceId: workspace.id,
            groupChatId: groupChat.groupChat.id,
            name: me.name,
            users: selecrtedUsers
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleSearch = query => {
    try {
      let users = workspace.chatWorkSpace.filter(x => {
        let found = groupChat.groupChat.groupChatRef.find(y => {
          return y.user.id === x.id;
        });
        if (found !== undefined) {
          return false;
        } else {
          return true;
        }
      });
      users = simpleSearch(users, query);
      setSearchUsers(users);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="w-full h-full bg-[#37393F] rounded-[10px] flex flex-col text-white">
      <img
        src={Cross}
        alt="X"
        className="absolute w-[20px] h-[20px] right-[5%] top-[10%] cursor-pointer"
        onClick={() => {
          close();
        }}
      />
      <div className="text-[20px] font-[700] mt-5 ml-8">Add people to {groupChat.groupChat.name}</div>
      <input
        className="ml-8 mt-5 bg-[#40434B] outline-none rounded-[5px] w-[90%] py-3 px-3 "
        value={searBar}
        onChange={e => {
          setSearBar(e.target.value);
          if (e.target.value === '') {
            setSearchUsers([]);
          } else {
            handleSearch(e.target.value);
          }
        }}
        placeholder="Search Users"
      />
      {searchUsers.length > 0 ? (
        <div className="relative w-[80%] max-h-[50%] bg-[#585B66] flex flex-col ml-12 rounded-[5px] py-2 overflow-scroll">
          {searchUsers.map(x => {
            return (
              <div
                className="flex cursor-pointer  mt-3 hover:bg-[#4D96DA] w-full py-2  flex-wrap content-center"
                onClick={() => {
                  let found = selecrtedUsers.find(user => user.user.name === x.user.name);
                  if (found === undefined) {
                    setSelecterdUsers([...selecrtedUsers, x]);
                  }
                  setSearchUsers([]);
                  setSearBar('');
                }}
              >
                <img alt="img" src={x.user.profilePic} className="w-[30px] h-[30px] mr-3 ml-8 " />
                <div className="text-white font-[700]">{x.user.name}</div>
              </div>
            );
          })}
        </div>
      ) : null}
      {searchUsers.length === 0 ? (
        <div class="flex flex-wrap ml-8 mt-8 w-[85%] max-h-[40%]  ">
          {selecrtedUsers.map((user, index) => {
            return (
              <div class="flex-shrink-0 flex-grow-0 bg-[#4D96DA] rounded-[5px] px-4 py-2 mb-2 mr-2 h-[40px] text-white flex flex-wrap justify-center content-center">
                <span class="text-white">{user.user.name}</span>
                <img
                  src={Cross}
                  alt="X"
                  className="h-[15px] ml-2  w-[20px] mt-1 cursor-pointer"
                  onClick={() => {
                    setSelecterdUsers([...selecrtedUsers.slice(0, index), ...selecrtedUsers.slice(index + 1)]);
                  }}
                />
              </div>
            );
          })}
        </div>
      ) : null}
      <button
        className="w-[100px] bg-[#4D96DA] py-2 outline-none absolute right-[5%] bottom-[10%] rounded-[5px] flex flex-wrap justify-center content-center disabled:bg-[#40434B]"
        onClick={() => {
          handleAddUser();
        }}
        disabled={selecrtedUsers.length === 0}
      >
        {loading ? <img alt="Loading.." src={Spinner} className="w-[25px] h-[25px]" /> : 'Add'}
      </button>
    </div>
  );
}
