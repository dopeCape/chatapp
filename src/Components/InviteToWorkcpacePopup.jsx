import React, { useEffect, useRef, useState } from 'react';
import Close from '../ph_x-bold.svg';
import { instance } from '../axios';
import { useUserStore, useWorkSpaceStore } from '../Stores/MainStore';
import { isValidEmail } from '../utils/helper';

export default function InviteToWorkcpace({ close }) {
  const me = useUserStore(state => state.user);
  const [searchUsers, setSearchUsers] = useState([]);
  const [selecrtedUsers, setSelecterdUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const accessToken = localStorage.getItem('token');
  const workspace = useWorkSpaceStore(state => state.workspace);
  const [error, setError] = useState(null);

  const [searchBar, setSearBar] = useState('');
  const haneleSend = async () => {
    try {
      if (selecrtedUsers.length > 0) {
        let workspaceId = workspace.id;
        let emailIntes = selecrtedUsers.filter(x => {
          return x.type === 'email';
        });
        let usersA = selecrtedUsers.filter(x => {
          return x.type !== 'email';
        });
        setLoading(true);
        if (usersA.length > 0) {
          await instance.post(
            '/user/invite',
            {
              users: usersA,
              id: workspaceId
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          );
        }

        if (emailIntes.length > 0) {
          await instance.post(
            '/user/sendbinites',
            {
              id: workspaceId,
              invites: emailIntes
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          );
        }
        setLoading(false);
        setTimeout(() => {
          close();
        }, 800);
      } else {
        setError('*select users to add');
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleSearch = async value => {
    try {
      if (value !== '') {
        if (value.includes('@')) {
          if (isValidEmail(value)) {
            setSearchUsers([{ name: value, type: 'email' }]);
          }
        } else {
          let res = await instance.post(
            '/user/search',
            {
              name: value
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          );
          res.data.users = res.data.users.filter(x => {
            console.log(x.id, me.id);
            return x.id !== me.id;
          });
          setSearchUsers(res.data.users);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="w-full h-full  bg-[#37393F] rounded-[10px] flex flex-col text-white">
      <div className="ml-8 font-[700] text-[20px] mt-8">Add Users</div>
      <img
        alt="x"
        src={Close}
        className="absolute w-[18px] h-[18px] top-[8%] right-[5%] cursor-pointer"
        onClick={() => {
          close();
        }}
      />

      <div className="ml-8 font-[400] text-[16px] mt-8">Add users or Send invtes</div>
      <input
        className="ml-8 mt-5 p-3 w-[90%] rounded-[5px] bg-[#40434B] outline-none"
        placeholder="Enter email or name"
        value={searchBar}
        onChange={e => {
          setSearBar(e.target.value);
          handleSearch(e.target.value);
        }}
      />
      {searchUsers.length !== 0 ? (
        <div className="relative w-[80%] max-h-[40%] bg-[#585B66] flex flex-col ml-12 rounded-[5px] py-2">
          {searchUsers.map(x => {
            return (
              <div
                className="flex cursor-pointer  mt-3 hover:bg-[#4D96DA] w-full py-2  flex-wrap content-center"
                onClick={() => {
                  let found = selecrtedUsers.find(user => user.name === x.name);
                  if (found == null) {
                    if (x.type === 'email') {
                      setSelecterdUsers([...selecrtedUsers, { name: x.name, type: x.type }]);
                    } else {
                      setSelecterdUsers([
                        ...selecrtedUsers,
                        { name: x.name, chatWorkSpaceId: x.chatWorkSpaces.id, email: x.email }
                      ]);
                    }
                  }
                  setSearchUsers([]);
                  setSearBar('');
                }}
              >
                {x.type === 'email' ? (
                  <div className="text-white font-[700] mr-3 ml-8">Invite</div>
                ) : (
                  <img alt="img" src={x.profilePic} className="w-[30px] h-[30px] mr-3 ml-8 " />
                )}
                <div className="text-white font-[700]">{x.name}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div class="flex flex-wrap ml-8 mt-8 w-[80%] max-h-[40%]  overflow-scroll ">
          {selecrtedUsers.map((user, index) => {
            return (
              <div class="flex-shrink-0 flex-grow-0 bg-[#4D96DA] rounded-[5px] px-4 py-2 mb-2 mr-2 h-[40px] text-white flex flex-wrap justify-center content-center">
                <span class="text-white">{user.name}</span>
                <img
                  src={Close}
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
      )}

      <button
        className=" py-2  bg-[#4D96DA] absolute bottom-[10%] right-[5%] rounded-[5px] w-[100px] "
        onClick={() => {
          if (!loading) {
            haneleSend();
          }
        }}
      >
        {!loading ? (
          'Send'
        ) : (
          <div
            class="inline-block h-5 w-5 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          >
            <span class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
        )}
      </button>
      <div className="absolute bottom-[10%] ml-8 text-red-400">{error}</div>
    </div>
  );
}
