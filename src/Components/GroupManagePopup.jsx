import React, { useEffect, useState } from 'react';
import Mute from '../volume-x.svg';

import { instance } from '../axios';
import Exit from '../streamline_interface-logout-arrow-exit-frame-leave-logout-rectangle-right.svg';
import Person from '../ic_round-person-add.svg';
import Search from '../search.svg';
import Cross from '../ph_x-bold.svg';
import styled from '@emotion/styled';
import Popup from 'reactjs-popup';

import { useChatStore, useGroupChatStore, useSelectedChatStore, useUserStore } from '../Stores/MainStore';
import SeachFileElement from './SeacrhFileElement';
import { fileSeacrh } from '../utils/helper';
import DeleteUserPopup from './DeleteUserPopup';
import AddUsersToGroupPopup from './AddUsersToGroupPopup';

export default function GroupManagePopup({ close, groupChat }) {
  const [selected, setSelected] = useState('A');
  const [allFiles, setallFiles] = useState([]);
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState('');
  let me = useUserStore(state => state.user);
  let user = useSelectedChatStore(state => state.user);
  let chat_ = useChatStore(state => state.chats);
  let group_ = useGroupChatStore(state => state.chats);

  useEffect(() => {
    let files = [];
    groupChat.groupChat.msges.forEach(msg => {
      if (msg.type === 'VIDEO' || msg.type === 'IMG' || msg.type === 'FILE' || msg.type === 'STICKER') {
        files.push(msg);
      }
    });
    setFiles(files);
    setallFiles(files);
  }, [user, group_, chat_]);
  const accessToken = localStorage.getItem('token');
  const handeleLeaveGroup = async () => {
    try {
      const msg = `${me.name} left`;
      const groupChatRefId = groupChat.id;
      const uid = me.id;
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
    } catch (error) {
      console.log(error);
    }
  };

  const handleSeach = query => {
    try {
      let res = fileSeacrh(files, query);
      console.log(res);
      setFiles(res);
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
      {selected === 'A' ? (
        <div className="flex flex-col">
          {' '}
          <div className="w-[90%] h-[80px] ml-8 bg-[#40434B] rounded-[10px] flex flex-col mt-12 ">
            <div className="ml-5 mt-3 text-white font-[700]">Created and managed by</div>
            <div className="ml-6 text-[#B4B4B4] mt-2 text-[14px]">{groupChat.groupChat.admin.email}</div>
          </div>
          <div className="flex w-[90%] ml-8 mt-5  flex-wrap justify-between">
            <button className="bg-[#40434B] py-4 w-[48%] flex flex-wrap justify-center  rounded-[10px] outline-none">
              <img className="w-[20px] h-[20px] " src={Mute} alt="X" />
              <div className="text-white tex-[18px] font-[700] ml-2">Mute notification</div>
            </button>
            <button
              className="bg-[#40434B] py-4 w-[48%] flex flex-wrap justify-center  rounded-[10px] outline-none"
              disabled={groupChat.groupChat.admin.id === me.id}
              onClick={() => {
                if (groupChat.groupChat.admin.id !== me.id) {
                  handeleLeaveGroup();
                }
              }}
            >
              <img className="w-[20px] h-[20px] " src={Exit} alt="X" />
              <div className="text-[#DA4D4D] tex-[18px] font-[700] ml-2">Leave group</div>
            </button>
          </div>
          <div className="bg-[#40434B] rounded-[10px] ml-8 mt-5 w-[90%] h-[320px] relative  ">
            <div className="text-white ml-5 mt-5">Files</div>
            <div className="flex bg-[#696D78] p-2 absolute right-[5%] top-[5%] rounded-[10px] w-[140px] ">
              <img alt="" src={Search} className=" ml-1" />
              <input
                className="bg-transparent outline-none w-[120px] text-white ml-1"
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
            <div className=" w-[90%] max-h-[80%] ml-5 mt-5 flex flex-col overflow-y-scroll">
              {files?.map(fl => {
                return <SeachFileElement msg={fl} />;
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-[510px] max-h-[550px] w-[90%] ml-8 mt-8 bg-[#40434B] flex flex-col rounded-[10px]">
          {groupChat.groupChat.admin.id === me.id ? (
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
            return groupChat.groupChat.admin.id === me.id ? (
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
