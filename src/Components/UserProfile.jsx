/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from 'react';

import ReactPlayer from 'react-player';
import { Checkbox } from '@mui/material';
import { AvatarGroup } from '@mui/material';
import { Avatar } from '@mui/material';
import { useChannel } from '@ably-labs/react-hooks';
import {
  useChatStore,
  useGroupChatStore,
  useSelectedStore,
  useUserStore,
  useWorkSpaceStore
} from '../Stores/MainStore';
import Popup from 'reactjs-popup';
import { instance } from '../axios';

export default function UserProfile() {
  const me = useUserStore(state => state.user);
  let chats = useChatStore(state => state.chats);
  let groupChat = useGroupChatStore(state => state.chats);

  let workspace = useWorkSpaceStore(state => state.workspace);
  const user = useSelectedStore(state => state.user);

  const setter = useUserStore(state => state.updateUserState);

  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState([]);
  const [renderMedia, setRenderMedia] = useState([]);
  useEffect(() => {
    let y = [];

    if (user.groupChat) {
      let x = user.groupChat.msges.filter(msg => {
        return msg.type !== 'CMD' && msg.type !== 'MSG';
      });
      setMedia(x);
    } else {
      let x = chats.filter(y => {
        return y.friend.id === user.id && y.chat.workspaceId === workspace.id;
      });

      x = x[0].chat.msges.filter(msg => {
        return msg.type !== 'CMD' && msg.type !== 'MSG';
      });
      console.log(x);

      setMedia(x);
    }

    if (user.groupChat) {
      workspace.chatWorkSpace.forEach(obj1 => {
        if (!user.groupChat.groupChatRef.some(obj2 => obj2.user.id === obj1.id)) {
          y.push(obj1);
        }
      });
      setRenderList(y);
    }
  }, [user, chats, groupChat]);

  let accessToken = localStorage.getItem('token');
  const handleRemoveUser = async (userId, msg, uid, groupChatRefId, close) => {
    try {
      await instance.post(
        '/gchat/remove',
        {
          userid: userId,
          msg: msg,
          groupId: user.groupChat.id,
          groupChatRefId: groupChatRefId,
          userxid: uid
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      close();
    } catch (error) {
      console.log(error);
    }
  };
  const handleAddUser = async close => {
    try {
      if (selectedCheckboxes.length > 0) {
        setLoading(true);
        await instance.post(
          '/gchat/add',
          {
            workspaceId: workspace.id,
            groupChatId: user.groupChat.id,
            name: me.name,
            users: selectedCheckboxes
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        setLoading(false);
        close();
      }
    } catch (error) {
      console.log(error);
    }
  };
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [renderList, setRenderList] = useState([]);

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
  return user.groupChat ? (
    <div className="w-full h-full dark:bg-[#16171B] bg-[#E9EFF4] flex flex-col flex-wrap content-center dark:shadow-left-shadow relative">
      <AvatarGroup
        total={user.groupChat.groupChatRef.length <= 3 ? user.groupChat.groupChatRef.length : 3}
        spacing="small"
        className="w-[50%] top-5 relative left-1"
      >
        {user.groupChat.groupChatRef.map(x => {
          return <Avatar alt={x.user.user.name} src={x.user.user.profilePic} />;
        })}
      </AvatarGroup>
      <div className="text-[24px] dark:text-white font-bold  text-center mt-6">{user.groupChat.name}</div>
      <div className="w-[90%] p-3 bg-[#22252F] rounded-xl mt-8">
        <input className="bg-[#22252F] outline-none text-white " placeholder="Search Messages" />
      </div>
      <div className="flex flex-col w-[90%] h-[35%] bg-[#22252F] mt-5 rounded-xl max-h-[35%] overflow-scroll    content-center overflow-x-hidden">
        <div className="w-full flex justify-around h-[10%] m-1  ">
          <div className="  text-[#b3b3b3]">file and media </div>
          <div className="text-[#b3b3b3]">{media.length}</div>
        </div>

        <div className="grid grid-cols-2  gap-2 w-[90%] max-h-[90%] overflow-scroll ml-3  mt-3  ">
          {media.map(msg => {
            return (
              <div className="w-full h-full ">
                {msg.type === 'IMG' ? (
                  <img src={msg.url} alt={msg.content} />
                ) : msg.type === 'VIDEO' ? (
                  <ReactPlayer url={msg.url} width="440" height="230" />
                ) : (
                  <div className="w-full h-full bg-blue-500 flex justify-center content-center flex-wrap rounded-lg">
                    <div className="p-1 bg-white text-sm w-[90%] rounded-lg ">{msg.content}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {user.groupChat.userId === me.id ? (
        <div className="flex  flex-col w- ">
          <Popup
            closeOnDocumentClick={false}
            modal
            trigger={
              <div className="bg-[#22252F] p-3 dark:text-white mt-5 w-[98%] h-[25%] rounded-xl cursor-pointer flex flex-wrap justify-center content-center">
                Add +
              </div>
            }
            position="center"
            onClose={() => {
              setSelectedCheckboxes([]);
              setLoading(false);
            }}
          >
            {close => (
              <div className="w-full h-full  flex flex-col">
                <div
                  className="absolute top-[5%] right-[5%] text-red-500 font-extrabold cursor-pointer"
                  onClick={() => {
                    close();
                  }}
                >
                  X
                </div>

                <div className="dark:text-white font-bold text-[24px] mt-5 ml-5 ">Users</div>
                <div className="w-full h-[75%] max-h-[75%] overflow-scroll flex-col flex ">
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
                <button
                  className="bg-[#22252F] p-3 cursor-pointer dark:text-white max-w-[15%]  rounded-lg ml-5"
                  disabled={selectedCheckboxes.length > 0 && !loading ? false : true}
                  onClick={() => {
                    handleAddUser(close);
                  }}
                >
                  {loading ? 'Loading..' : 'Add+'}
                </button>
              </div>
            )}
          </Popup>
          <Popup
            modal
            closeOnDocumentClick={false}
            trigger={
              <div className="bg-[#22252F] p-3 dark:text-white mt-5 w-[98%] h-[35%]  rounded-xl cursor-pointer  flex justify-center content-center flex-wrap ">
                Manage Members
              </div>
            }
          >
            {close => (
              <div className="flex flex-col max-h-[100%] overflow-hidden">
                <div
                  className="absolute top-[5%] right-[5%] text-red-500 font-extrabold cursor-pointer"
                  onClick={() => {
                    close();
                  }}
                >
                  X
                </div>

                <div className="dark:text-white font-bold text-[24px] mt-3 ml-3">Remove members</div>
                <div className="w-[60%] h-[70%] max-h-[70%] relative overflow-scroll ">
                  {user.groupChat.groupChatRef.map(user_ => {
                    let groupChatRefId = user.groupChat.groupChatRef.filter(x => {
                      return x.user.id === user_.user.id;
                    });
                    return user_.user.user.id !== me.id ? (
                      <div className="w-[70%] h-[50%] m-5 flex shadow-2xl dark:bg-[#22252F] rounded-lg ml-5 bg-[#F9FBFC] relative">
                        <img alt={user_.user.user.name} src={user_.user.user.profilePic} />
                        <div className="dark:text-white ml-4 mt-2">{user_.user.user.name}</div>
                        <button
                          className="dark:bg-blue-500 text-white h-[50%] p-2  rounded-lg absolute right-[5%] top-[40%]"
                          onClick={() => {
                            handleRemoveUser(
                              user_.id,
                              `${me.name} removed ${user_.user.user.name}`,
                              user_.user.user.id,
                              groupChatRefId[0].id,
                              close
                            );
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </Popup>
        </div>
      ) : (
        <div
          className="dark:text-white  w-[90%] h-[5%] text-center bg-[#22252f] mt-5 rounded-lg cursor-pointer flex flex-wrap justify-center content-center "
          onClick={() => {
            handleRemoveUser(me.chatWorkSpaces.id, `${me.name} left`, me.id, user.id);
          }}
        >
          Leave Group
        </div>
      )}
    </div>
  ) : (
    <div className="w-full h-full dark:bg-[#16171B] bg-[#E9EFF4] flex flex-col flex-wrap content-center dark:shadow-left-shadow">
      <img alt="loading.." src={user.user.profilePic} className="rounded-full w-[40%] mt-10 ml-20" />
      <div className="text-[24px] dark:text-white font-bold  text-center mt-6">{user.user.name}</div>
      <div className="w-[90%] p-3 bg-[#22252F] rounded-xl mt-8">
        <input className="bg-[#22252F] outline-none text-white " placeholder="Search Messages" />
      </div>
      <div className="flex flex-col w-[90%] h-[35%] bg-[#22252F] mt-5 rounded-xl max-h-[35%] overflow-scroll    content-center overflow-x-hidden">
        <div className="w-full flex justify-around h-[10%] m-1  ">
          <div className="  text-[#b3b3b3]">file and media </div>
          <div className="text-[#b3b3b3]">{media.length}</div>
        </div>

        <div className="grid grid-cols-2  gap-2 w-[90%] max-h-[90%] overflow-scroll ml-3  mt-3  ">
          {media.map(msg => {
            return (
              <div className="w-full h-full ">
                {msg.type === 'IMG' ? (
                  <img src={msg.url} alt={msg.content} />
                ) : msg.type === 'VIDEO' ? (
                  <ReactPlayer url={msg.url} width="440" height="230" />
                ) : (
                  <div className="w-full h-full bg-blue-500 flex justify-center content-center flex-wrap rounded-lg">
                    <div className="p-1 bg-white text-sm w-[90%] rounded-lg ">{msg.content}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
