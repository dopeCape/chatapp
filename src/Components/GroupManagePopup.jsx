import React, { useEffect, useState } from 'react';
import Spinner from '../Spin-1s-200px.svg';
import Mute from '../volume-x.svg';
import Delete from '../delete.svg';

import { instance } from '../axios';
import Exit from '../streamline_interface-logout-arrow-exit-frame-leave-logout-rectangle-right.svg';
import Person from '../ic_round-person-add.svg';
import Search from '../search.svg';
import Cross from '../ph_x-bold.svg';
import styled from '@emotion/styled';
import Popup from 'reactjs-popup';

import {
  useChatStore,
  useGroupChatStore,
  useSelectedChatStore,
  useUserStore,
  useWorkSpaceStore
} from '../Stores/MainStore';
import SeachFileElement from './SeacrhFileElement';
import { fileSeacrh } from '../utils/helper';
import DeleteUserPopup from './DeleteUserPopup';
import AddUsersToGroupPopup from './AddUsersToGroupPopup';

export default function GroupManagePopup({ close, groupChat, type, useR, chat, id, chatId, friendId }) {
  const [selected, setSelected] = useState('A');
  const [allFiles, setallFiles] = useState([]);
  const [mute, setMute] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState('');
  const setChatMute = useChatStore(state => state.setMute);

  const setGroupChatMute = useGroupChatStore(state => state.setMute);

  let me = useUserStore(state => state.user);
  let user = useSelectedChatStore(state => state.user);
  let workspace = useWorkSpaceStore(state => state.workspace);
  let chat_ = useChatStore(state => state.chats);
  let group_ = useGroupChatStore(state => state.chats);

  useEffect(() => {
    let files = [];
    if (type === 'G') {
      groupChat.groupChat.msges.forEach(msg => {
        if (msg.type === 'VIDEO' || msg.type === 'IMG' || msg.type === 'FILE' || msg.type === 'STICKER') {
          files.push(msg);
        }
      });
      group_.forEach(x => {
        if (x.id === id) {
          console.log(x.muted);
          setMute(x.muted);
        }
      });
      setFiles(files);
      setallFiles(files);
    } else {
      chat.forEach(msg => {
        if (msg.type === 'VIDEO' || msg.type === 'IMG' || msg.type === 'FILE' || msg.type === 'STICKER') {
          files.push(msg);
        }
        setFiles(files);
        setallFiles(files);
      });
      chat_.forEach(x => {
        if (x.id === id) {
          console.log(x.muted);
          setMute(x.muted);
        }
      });
    }
  }, [user, group_, chat_, type]);
  const accessToken = localStorage.getItem('token');
  const handleUnfriend = async () => {
    setDeleting(true);
    await instance.post(
      '/user/unfriend',
      {
        id: me.chatWorkSpaces.id,
        chatId: chatId,
        friendId: friendId,
        workspaceId: workspace.id,
        uid: me.id
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    setDeleting(false);
  };
  const handeleLeaveGroup = async () => {
    try {
      const msg = `${me.name} left`;
      const groupChatRefId = groupChat.id;
      const uid = me.id;
      setDeleting(true);
      await instance.post(
        '/gchat/remove',
        {
          userid: me.chatWorkSpaces.id,
          msg: msg,
          groupId: groupChat.groupChat.id,
          groupChatRefId: groupChatRefId,
          userxid: uid
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      setDeleting(false);
    } catch (error) {
      console.log(error);
    }
  };
  const handleMute = async () => {
    try {
      if (type === 'C') {
        let friendId = id;
        let mute_ = !mute;
        await instance.post(
          '/user/mute',
          {
            friendId,
            mute: mute_
          },

          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        setChatMute(id, mute_);
        setMute(mute_);
      } else {
        let groupChatRefId = id;
        let mute_ = !mute;
        await instance.post(
          '/gchat/mute',
          {
            groupChatRefId,
            mute: mute_
          },

          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        setGroupChatMute(id, mute_);
        setMute(mute_);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSeach = query => {
    try {
      let res = fileSeacrh(files, query);
      res = res.map(x => {
        return x.item;
      });
      setFiles(res);
    } catch (error) {
      console.log(error);
    }
  };
  const handleDeleteGroup = async () => {
    try {
      let groupChatRefs = groupChat.groupChat.groupChatRef.map(x => x.id);
      let users = groupChat.groupChat.groupChatRef.map(x => x.user.user.id);
      setDeleting(true);
      await instance.post(
        '/gchat/delete',
        {
          groupChatId: groupChat.groupChat.id,
          groupChatRefs,
          users,
          name: me.name,
          groupName: groupChat.groupChat.name
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      setDeleting(false);
    } catch (error) {
      console.log(error);
    }
  };
  const AddMemberPopup = styled(Popup)`
    &-content {
      border: none;
      height: 280px;
      padding: 0;
      width: 620px;
      border-radius: 10px;
    }
  `;
  const RemoveMemberPopup = styled(Popup)`
    &-content {
      border: none;
      height: 180px;
      padding: 0;
      width: 400px;
      border-radius: 10px;
    }
  `;

  return (
    <div className="w-full h-full rounded-[10px] flex flex-col bg-[#37393F] relative  ">
      <img
        alt="X"
        src={Cross}
        className="absolute right-[5%] top-[5%] w-[20px] h-[20px] cursor-pointer"
        onClick={() => {
          close();
        }}
      />
      {type === 'G' ? (
        <div className="flex  text-[#B4B4B4] mt-12 content-center justify-center  text-[20px] font-[700]  relative">
          <div
            className="cursor-pointer"
            style={{ color: `${selected === 'A' ? 'white' : '#B4B4B4'}` }}
            onClick={() => {
              setSelected('A');
            }}
          >
            About
          </div>
          {selected === 'A' ? (
            <div className="w-[13px] h-0 border-[#4D96DA] border-[3px] rounded-[10px] absolute bottom-[-30%] left-[37%] "></div>
          ) : null}
          <div
            className="ml-10 cursor-pointer"
            style={{ color: `${selected === 'M' ? 'white' : '#B4B4B4'}` }}
            onClick={() => {
              setSelected('M');
            }}
          >
            Members<span className="ml-2 font-[400]">{groupChat.groupChat.groupChatRef.length}</span>
          </div>

          {selected === 'M' ? (
            <div className="w-[13px]  border-[#4D96DA] border-[3px] rounded-[10px] absolute bottom-[-30%] right-[41%] "></div>
          ) : null}
        </div>
      ) : null}
      {selected === 'A' ? (
        <div className="flex flex-col">
          {type === 'G' ? (
            <div className="w-[90%] h-[80px] ml-8 bg-[#40434B] rounded-[10px] flex flex-col mt-12 ">
              <div className="ml-5 mt-3 text-white font-[700]">Created by</div>
              <div className="ml-5 text-[#B4B4B4] mt-2 text-[14px]">{groupChat.groupChat.admin.email}</div>
            </div>
          ) : (
            <div className="w-[90%] h-[100px] ml-8 bg-[#40434B] rounded-[10px] flex mt-16 flex-wrap content-center ">
              <img src={user.user.profilePic} alt="Loading.." className="w-[80px] h-[80px] rounded-[10px] ml-5 " />
              <div className="flex flex-col">
                <div className="ml-3 text-[18px] font-[700] text-white mt-1">{user.user.name}</div>
                <div className="text-[#B4B4B4] ml-3 text-[14px] mt-1">Status</div>
              </div>
            </div>
          )}
          <div className="flex w-[90%] ml-8 mt-5  flex-wrap justify-between">
            <button
              className="bg-[#40434B] py-4 w-[48%] flex flex-wrap justify-center  rounded-[10px] outline-none"
              onClick={() => {
                handleMute();
              }}
            >
              {mute ? (
                <i class="fa-solid fa-volume-high text-white mt-1"></i>
              ) : (
                <img className="w-[20px] h-[20px] " src={Mute} alt="X" />
              )}
              <div className="text-white tex-[18px] font-[700] ml-2">{mute ? 'Unmute' : 'Mute'} notification</div>
            </button>
            {type === 'G' ? (
              <button
                className="bg-[#40434B] py-4 w-[48%] flex flex-wrap justify-center  rounded-[10px] outline-none"
                onClick={() => {
                  if (groupChat.groupChat.admin.id !== me.id) {
                    handeleLeaveGroup();
                  } else if (groupChat.groupChat.type === 'CHANNEL' && groupChat.groupChat.admin.id === me.id) {
                    if (groupChat.groupChat.name !== 'general') {
                      handleDeleteGroup();
                    }
                  }
                }}
              >
                {groupChat.groupChat.admin.id === me.id && groupChat.groupChat.type !== 'GROUP' ? (
                  deleting ? null : (
                    <img src={Delete} alt="D" className="w-[20px] h-[20px]" />
                  )
                ) : (
                  <img className="w-[20px] h-[20px] " src={Exit} alt="X" />
                )}
                <div className="text-[#DA4D4D] tex-[18px] font-[700] ml-2">
                  {groupChat.groupChat.admin.id === me.id && groupChat.groupChat.type !== 'GROUP' ? (
                    deleting ? (
                      <img className="w-[25px] h-[20px]" src={Spinner} alt="Deleting..." />
                    ) : (
                      'Delete Group'
                    )
                  ) : groupChat.groupChat.type === 'CHANNEL' ? (
                    deleting ? (
                      <img className="w-[25px] h-[20px]" src={Spinner} alt="Deleting..." />
                    ) : (
                      'Leave Channel'
                    )
                  ) : deleting ? (
                    <img className="w-[25px] h-[20px]" src={Spinner} alt="Deleting..." />
                  ) : (
                    ' Leave Group'
                  )}
                </div>
              </button>
            ) : (
              <button
                className="bg-[#40434B] py-4 w-[48%] flex flex-wrap justify-center  rounded-[10px] outline-none"
                onClick={handleUnfriend}
              >
                {deleting ? null : <img className="w-[20px] h-[20px] " src={Exit} alt="X" />}
                <div className="text-[#DA4D4D] tex-[18px] font-[700] ml-2">
                  {deleting ? <img src={Spinner} className="w-[25px] h-[25px] " alt="Delering.." /> : 'Delete Chat'}
                </div>
              </button>
            )}
          </div>
          <div
            className={`bg-[#40434B] rounded-[10px] ml-8 mt-5 w-[90%] h-[320px]
               relative  `}
          >
            <div className="text-white ml-5 mt-5">Files</div>
            <div className="flex bg-[#696D78] p-2 absolute right-[5%] top-[5%] rounded-[10px] w-[180px] ">
              <img alt="" src={Search} className=" ml-1" />
              <input
                className="bg-transparent outline-none w-[160px] text-white ml-1"
                placeholder="Find files"
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  if (e.target.value === '') {
                    setFiles(allFiles);
                  } else {
                    handleSeach(e.target.value);
                  }
                }}
              />
            </div>
            <div
              className={` w-[90%] max-h-[${type === 'G' ? '80' : '80'}%]  ml-5 mt-5 flex flex-col overflow-y-scroll`}
            >
              {files?.map(fl => {
                return <SeachFileElement msg={fl} />;
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-[510px] max-h-[550px] w-[90%] ml-8 mt-8 bg-[#40434B] flex flex-col rounded-[10px]">
          {groupChat.groupChat.admin.id === me.id || groupChat.groupChat.type === 'GROUP' ? (
            <AddMemberPopup
              modal
              position="center"
              closeOnDocumentClick={false}
              trigger={
                <div className="flex ml-5 mt-5 ">
                  <div className="w-[50px] h-[50px] flex justify-center content-center flex-wrap bg-[#4D96DA] rounded-[5px] cursor-pointer ">
                    <img alt="+" src={Person} className="w-[25px] h-[25px]" />
                  </div>
                  <div className="text-white ml-2 mt-3 font-[700] cursor-pointer">Add Members</div>
                </div>
              }
            >
              {close => <AddUsersToGroupPopup close={close} groupChat={groupChat} />}
            </AddMemberPopup>
          ) : null}
          <div className="flex text-white mt-5">
            <img alt="loadin.." src={me.profilePic} className="h-[50px] w-[50px] ml-5 rounded-[5px] cursor-pointer " />
            <div className="flex flex-col ml-2 cursor-pointer">
              <div className="font-[700]">{'Me'}</div>

              <div className="text-[#B4B4B4]">Status</div>
            </div>
          </div>

          {groupChat.groupChat.groupChatRef.map(user => {
            return groupChat.groupChat.admin.id === me.id && groupChat.groupChat.type === 'CHANNEL' ? (
              user.user.user.id === me.id ? null : (
                <RemoveMemberPopup
                  modal
                  position="center"
                  closeOnDocumentClick={false}
                  trigger={
                    <div className="flex text-white mt-5">
                      <img
                        alt="loadin.."
                        src={user.user.user.profilePic}
                        className="h-[50px] w-[50px] ml-5 rounded-[5px] cursor-pointer "
                      />
                      <div className="flex flex-col ml-2 cursor-pointer">
                        <div className="font-[700]">{user.user.user.name}</div>

                        <div className="text-[#B4B4B4]">Status</div>
                      </div>
                    </div>
                  }
                >
                  {close => <DeleteUserPopup close={close} user={user} groupChat={groupChat} />}
                </RemoveMemberPopup>
              )
            ) : user.user.user.id === me.id ? null : (
              <div className="flex text-white mt-5">
                <img alt="loadin.." src={user.user.user.profilePic} className="h-[50px] w-[50px] ml-5 rounded-[5px] " />
                <div className="flex flex-col ml-2">
                  <div className="font-[700]">{user.user.user.name}</div>

                  <div className="text-[#B4B4B4]">Status</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
