import React, { useEffect, useRef, useState } from 'react';
import { instance } from '../axios';
import UserElement from './UserElement';
import { Checkbox } from '@mui/material';

import Loadingbar from '../Ellipsis-1.3s-200px(1).svg';
import { useChatStore, useGroupChatStore, useUserStore, useWorkSpaceStore } from '../Stores/MainStore';
import Popup from 'reactjs-popup';
import { search } from '../utils/helper.js';

export default function ChatSelector() {
  const [list, setList] = useState([]);
  const [renderList, setRenderList] = useState([]);

  const [back, setBack] = useState(false);
  const [newGroup, setNewGroup] = useState(false);

  let me = useUserStore(state => state.user);
  let chatStore = useChatStore(state => state.chats);

  let groupStore = useGroupChatStore(state => state.chats);
  let selectedWorkspace = useWorkSpaceStore(state => state.workspace);

  const [chat, setChat] = useState([]);
  const [group, setGroup] = useState([]);
  const [users, setUsers] = useState([]);
  useEffect(() => {
    let chat_ = [];
    let group_ = [];

    if (selectedWorkspace != null) {
      groupStore.forEach(x => {
        if (x.workspaceId === selectedWorkspace.id) {
          group_.push(x);
        }
      });
      chatStore.forEach(y => {
        if (y.chat.workspaceId === selectedWorkspace.id) {
          chat_.push(y.friend);
        }
      });

      setChat(chat_);
      setGroup(group_);
    }

    let temp_list = [];
    if (selectedWorkspace) {
      selectedWorkspace.chatWorkSpace.forEach(user => {
        if (user.user && user.user.id !== me.id) {
          temp_list.push(user);
        }
      });
      setUsers(temp_list);
      setRenderList(temp_list);
    }
  }, [me, groupStore, chatStore, selectedWorkspace]);
  const groupSeachRef = useRef('');

  const handelSearchAddGroup = () => {
    if (groupSeachRef.current.value === '') {
      setRenderList(users);
    } else {
      setRenderList(search(users, groupSeachRef.current?.value, me));
    }
  };
  const searhRef = useRef();

  const handleChangeBar = () => {
    if (searhRef.current !== undefined) {
      searhRef.current.value = '';
      if (back) {
        setBack(false);
        setList([]);
      } else {
        setBack(true);
      }
    }
  };
  useEffect(() => {
    setBack(false);

    setList([]);
    if (searhRef.current?.value) {
      searhRef.current.value = '';
    }
  }, [selectedWorkspace]);

  const [selectedCheckboxes, setSelectedCheckboxes] = useState([
    { id: me.chatWorkSpaces.id, user: { id: me.id, name: me.name } }
  ]);

  const handleCheckboxChange = label => {
    setSelectedCheckboxes(prevSelected => {
      const isLabelSelected = prevSelected.some(item => {
        // Compare the properties of the objects
        return item.id === label.id;
      });

      if (isLabelSelected) {
        return prevSelected.filter(item => {
          // Filter out the selected label
          return item.id !== label.id;
        });
      } else {
        return [...prevSelected, label];
      }
    });
  };
  const handleSearch = async () => {
    let q = searhRef.current.value;
    if (back) {
      if (q) {
        try {
          selectedWorkspace.chatWorkSpace = selectedWorkspace.chatWorkSpace.filter(x => {
            return x.id !== me.chatWorkSpaces.id;
          });
          let users = search(selectedWorkspace.chatWorkSpace, q, me);

          setList(users);
        } catch (error) {
          console.log(error);
        }
      } else {
        setList([]);
      }
    } else {
    }
  };
  const groupNameRef = useRef('');
  const [groupError, setGroupError] = useState(null);
  const accessToken = localStorage.getItem('token');
  const [creating, setCreatin] = useState(false);
  const handleCreateGroup = async close => {
    console.log(selectedCheckboxes, groupNameRef.current.value);
    if (groupNameRef.current.value === '') {
      setGroupError('name cannot be empty');
    } else {
      if (groupNameRef.current.value === 'general') {
        setGroupError('name cannot be general');
      } else {
        setCreatin(true);
        await instance.post(
          '/gchat/create',
          {
            workspaceId: selectedWorkspace.id,
            users: selectedCheckboxes,
            user: { id: me.id, name: me.name },
            name: groupNameRef.current.value
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );

        setCreatin(false);
        close();
      }
    }
  };
  return (
    <div className="w-full h-full flex  flex-col  bg-[#F9FBFC]  dark:bg-[#22252F]  ">
      {selectedWorkspace === null ? (
        <div className="w-full h-full flex flex-wrap justify-center content-center dark:text-white text-[24px]">
          Select a workspace
        </div>
      ) : (
        <div className="w-full h-full flex  flex-col  bg-[#F9FBFC]  dark:bg-[#121316]  ">
          <div className="w-full  h-[50%] h-max-[50%] flex flex-col flex-warp bg-[#F9FBFC]  dark:bg-[#121316]  mt-10">
            <div className="flex flex-wrap w-full h-[5%]    ">
              <div className="flex flex-wrap w-[90%] h-full justify-between content-end ml-5 mt-2 ">
                <div className="text-[20px] font-extrabold relative bottom-1 cursor-pointer dark:text-white">Group</div>
                <Popup
                  trigger={<i class="fa-solid fa-plus dark:text-white mt-1"></i>}
                  modal
                  onClose={() => {
                    setSelectedCheckboxes([
                      {
                        id: me.chatWorkSpaces.id,
                        user: { id: me.id, name: me.name }
                      }
                    ]);
                  }}
                  closeOnDocumentClick={false}
                >
                  {close => (
                    <div className="w-full h-full  flex flex-col">
                      <div className="p-3 dark:bg-[#22252F] w-[50%] ml-5 h-[10%] rounded-lg mt-5 bg-[#F9FBFC]">
                        <input
                          className="bg-transparent dark:text-white w-full outline-none"
                          placeholder="Find users"
                          ref={groupSeachRef}
                          onChange={handelSearchAddGroup}
                        />
                      </div>
                      <div
                        className="absolute top-[5%] right-[5%] text-red-500 font-extrabold cursor-pointer"
                        onClick={() => {
                          close();
                        }}
                      >
                        X
                      </div>

                      <div className="w-full h-[50%] max-h-[50%] overflow-scroll flex-col flex">
                        {renderList.map(user => {
                          return (
                            <div className="w-[50%] h-[30%] m-5 flex shadow-2xl dark:bg-[#22252F] rounded-lg ml-5 bg-[#F9FBFC]">
                              <img alt={user.user.name} src={user.user.profilePic} />
                              <div className="dark:text-white text-[18px] ml-5 mt-1"> {user.user.name}</div>

                              <Checkbox
                                className="relative right-16 top-3"
                                onChange={() => {
                                  handleCheckboxChange(user);
                                }}
                                checked={selectedCheckboxes.some(item => {
                                  // Check if the label is selected
                                  return item.id === user.id;
                                })}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div className="dark:text-white text-[22px] relative top-[10%] ml-5">
                        Enter name for group(name can't be "general")
                      </div>
                      <div className="w-full flex relative top-[10%]  ">
                        <div
                          className="p-3 dark:bg-[#22252f] relative top-[12%] ml-5 w-[40%] rounded-lg  bg-[#F9FBFC]
                          "
                        >
                          <input
                            className=" bg-transparent outline-none dark:text-white w-full"
                            placeholder="Group's name"
                            ref={groupNameRef}
                          />
                        </div>
                        <div
                          className="p-4 dark:bg-[#22252f] w-[15%] rounded-lg ml-2 dark:text-white relative top-[10%] bg-[#F9FBFC] cursor-pointer"
                          onClick={() => {
                            handleCreateGroup(close);
                          }}
                        >
                          {!creating ? 'Create' : 'loading..'}
                        </div>
                      </div>
                      <div className="text-red-500 relative top-[11%] ml-5">{groupError}</div>
                    </div>
                  )}
                </Popup>
              </div>
            </div>

            {newGroup ? (
              <input
                placeholder="Find Friends"
                className="p-5 bg-[#EFEFEF] w-[90%] rounded-lg ml-5  dark:bg-[#22252F] dark:text-white outline-none border-none "
                onChange={handleSearch}
                ref={searhRef}
              />
            ) : (
              <input
                placeholder="Search Messages"
                className="p-4 bg-[#EFEFEF] w-[90%] rounded-lg ml-5 mt-4 dark:bg-[#22252F] dark:text-white outline-none border-none"
                ref={searhRef}
              />
            )}

            <div className="relative  flex flex-col   justify-start content-center overflow-scroll max-h-[85%] h-[85%] mt-8  ">
              {!newGroup
                ? group.map((fr, index) => {
                  return (
                    <div className="w-[90%]">
                      <UserElement user={fr} index={index} type={'group'} />
                    </div>
                  );
                })
                : null}
            </div>
          </div>
          <div className="w-full max-h-[50%]  flex flex-col flex-warp bg-[#F9FBFC]  dark:bg-[#121316] mt-10  overflow-hidden">
            <div className="flex flex-wrap w-[90%] h-[5%]    justify-between content-end mt-3 ml-5 ">
              {back ? (
                <i
                  className="fa-solid fa-arrow-left text-[20px] relative  cursor-pointer dark:text-white"
                  onClick={handleChangeBar}
                ></i>
              ) : (
                <>{null}</>
              )}

              <div className="text-[20px] font-extrabold relative bottom- cursor-pointer dark:text-white ">
                Direct Messages
              </div>
              {!back ? <i class="fa-solid fa-plus dark:text-white mt-1" onClick={handleChangeBar}></i> : <></>}
            </div>
            {back ? (
              <input
                placeholder="Find Friends"
                className="p-4 bg-[#EFEFEF] w-[90%] rounded-lg ml-5 mt-4 dark:bg-[#22252F] dark:text-white outline-none border-none"
                onChange={handleSearch}
                ref={searhRef}
              />
            ) : (
              <input
                placeholder="Search Messages"
                className="p-4 bg-[#EFEFEF] w-[90%] rounded-lg ml-5 mt-4 dark:bg-[#22252F] dark:text-white outline-none border-none"
                ref={searhRef}
              />
            )}

            <div className="relative top-[1%] flex flex-col   justify-start content-center overflow-scroll max-h-[80%] h-[80%]  ">
              {!back
                ? chat.map((fr, index) => {
                  return (
                    <div className="w-[90%]">
                      <UserElement user={fr} index={index} type={'friend'} />
                    </div>
                  );
                })
                : list.map((fr, index) => {
                  return (
                    <div className="w-[90%]">
                      <UserElement type={'find'} user={fr} index={index} me={me} />
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
