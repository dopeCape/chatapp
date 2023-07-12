import React, { useState } from 'react';

import Spinner from '../Spin-1s-200px.svg';

import { instance } from '../axios';
import Close from '../ph_x-bold.svg';
import { useWorkSpaceStore, useUserStore } from '../Stores/MainStore';
import { simpleSearch } from '../utils/helper';
export default function NewGroup({ close, type }) {
  const worksapce = useWorkSpaceStore(state => state.workspace);

  const me = useUserStore(state => state.user);
  const [screen, setScreen] = useState(1);
  const [selecrtedUsers, setSelecterdUsers] = useState([
    { id: me.chatWorkSpaces.id, user: { id: me.id, name: me.name, profilePic: me.profilePic } }
  ]);
  const [search, setSearch] = useState('');
  const [searchList, setSearchList] = useState([]);
  const [name, setName] = useState('');
  const [chelcked, setChelcked] = useState('PUBLIC');
  const [creating, setCreatin] = useState(false);
  const accessToken = localStorage.getItem('token');
  const handleCreateGroup = async () => {
    setCreatin(true);
    let t = type === 'Group' ? 'GROUP' : 'CHANNEL';
    let n = type === 'Group' ? 'GROUP' : name;
    await instance.post(
      '/gchat/create',
      {
        workspaceId: worksapce.id,
        users: selecrtedUsers,
        user: { id: me.id, name: me.name },
        name: n,
        type: t,
        visiblity: chelcked
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    setCreatin(false);
    close();
  };

  const handleSearch = query => {
    try {
      let res = simpleSearch(worksapce.chatWorkSpace, query);
      res = res.filter(x => {
        let y = selecrtedUsers.find(z => {
          return z.id === x.id;
        });
        if (y) {
          return false;
        } else {
          return true;
        }
      });
      console.log(res);
      setSearchList(res);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="w-full h-full flex-col flex bg-[#37393F]  text-white rounded-[10px] relative">
      <div className="ml-8 mt-8 text-[20px] font-[700] ">Create a {type}</div>
      {screen === 2 ? <div className="ml-8 text-[#B4B4B4]">#{name}</div> : null}
      <img
        alt="close"
        src={Close}
        onClick={() => {
          close();
        }}
        className="w-[18px] h-[18px] absolute right-[5%] top-[12%] cursor-pointer"
      />
      {screen === 1 && type !== 'Group' ? (
        <div>
          <div className="test-[18px] font-[700] ml-8 mt-5">Name</div>
          <div className="mt-3 ml-8 text-red-400">Name Of channel cannot be General</div>
          <div className="flex w-[90%] bg-[#585B66] relative rounded-[5px] ml-8 ">
            <i class="fa-solid fa-hashtag text-white relative top-[39%] left-[5%] text-[13px] mt-5 "></i>
            <input
              className=" w-[100%]  p-4  rounded-[5px] ml-8 outline-none bg-transparent pl-1"
              placeholder="example: userflow-agency"
              value={name}
              onChange={e => {
                setName(e.target.value);
              }}
            />
          </div>
          <div className="text-[14px] font-light text-[#B4B4B4] ml-8 mt-3  w-[90%]">
            Channels are where conversations happen around a topic. Use a name that is easy to find and understand.
          </div>
        </div>
      ) : screen === 2 && type !== 'Group' ? (
        <div>
          <div className="font-[700] ml-8 mt-8 text-[18px]">Visibility</div>
          <div className="flex  mt-5 ml-8">
            <input
              id="default-radio-1"
              type="radio"
              value=""
              onChange={() => {
                setChelcked('PUBLIC');
              }}
              checked={chelcked === 'PUBLIC' ? true : false}
              name="default-radio"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mt-1"
            />
            <div className="ml-2">
              Public - anyone in <span className="font-[700]">{name}</span>
            </div>
          </div>
          <div className="flex mt-5 ml-8 ">
            <input
              id="default-radio-1"
              type="radio"
              value=""
              onChange={() => {
                setChelcked('PRIVATE');
              }}
              checked={chelcked === 'PRIVATE' ? true : false}
              name="default-radio"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mt-1"
            />
            <div className="ml-2">
              Private - Just memebers of <span className="font-[700]">{name}</span>
            </div>
          </div>
        </div>
      ) : null}
      {type !== 'Group' ? <div className="absolute ml-8 bottom-[10%]">Step {screen} of 3</div> : null}
      <button
        className="absolute bg-[#4D96DA] px-8   py-2 rounded-[5px] bottom-[10%] right-[5%] disabled:bg-blue-300 disabled:cursor-not-allowed flex flex-wrap justify-center content-center w-[100px]"
        disabled={type !== 'Group' ? name.length === 0 || name?.toLowerCase() === 'general' : false}
        onClick={() => {
          if (screen === 1) {
            if (name.length > 0 && name.toLowerCase() !== 'general') {
              setScreen(2);
            }
          }
          if (screen === 2) {
            setScreen(3);
          }
          if (screen === 3 || type === 'Group') {
            if (!creating) {
              handleCreateGroup();
            }
          }
        }}
      >
        {creating ? (
          <img alt="Loading" src={Spinner} className="h-[25px] w-[25px]" />
        ) : screen === 3 || type === 'Group' ? (
          'Create'
        ) : (
          'Next'
        )}
      </button>
      {screen === 2 ? (
        <button
          className="absolute bg-transparent border-[#4D96DA] border-[1px] px-8   py-2 rounded-[5px] bottom-[10%] right-[25%]"
          onClick={() => {
            if (name.length > 0) {
              setChelcked('PUBLIC');
              setScreen(1);
            }
          }}
        >
          Back
        </button>
      ) : screen === 3 || type === 'Group' ? (
        <div>
          <input
            className="w-[90%] py-3 ml-8 mt-5 px-2 outline-none bg-[#40434B] text-white rounded-[5px]"
            placeholder="Search of users in worksapce"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              if (e.target.value.length === 0) {
                setSearchList([]);
              } else {
                handleSearch(e.target.value);
              }
            }}
          />
          {searchList.length > 0 ? (
            <div className="w-[95%] ml-4 max-h-[300px] flex flex-col bg-[#585B66] py-3 rounded-[5px]">
              {searchList.map(user => {
                return (
                  <div
                    className="flex  pl-5 cursor-pointer hover:bg-blue-500 py-2"
                    onClick={() => {
                      setSelecterdUsers([
                        ...selecrtedUsers,
                        {
                          id: user.id,
                          user: { id: user.user.id, name: user.user.name, profilePic: user.user.profilePic }
                        }
                      ]);
                      setSearchList([]);
                    }}
                  >
                    <img className="w-[40px] h-[40px] " alt={user.user.name} src={user.user.profilePic} />
                    <div className="ml-3 font-[700]">{user.user.name}</div>
                  </div>
                );
              })}
            </div>
          ) : null}
          <div class="flex flex-wrap ml-8 mt-8 w-[85%] max-h-[40%]  ">
            {selecrtedUsers.map((user, index) => {
              return user.user.id !== me.id ? (
                <div class="flex-shrink-0 flex-grow-0 bg-[#4D96DA] rounded-[5px] px-4 py-2 mb-2 mr-2 h-[40px] text-white flex flex-wrap justify-center content-center">
                  <span class="text-white">{user.user.name}</span>
                  <img
                    src={Close}
                    alt="X"
                    className="h-[15px] ml-2  w-[20px] mt-1 cursor-pointer"
                    onClick={() => {
                      setSelecterdUsers([...selecrtedUsers.slice(0, index), ...selecrtedUsers.slice(index + 1)]);
                    }}
                  />
                </div>
              ) : null;
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
