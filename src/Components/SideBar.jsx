import React, { useEffect, useRef, useState } from 'react';
import Loadingbar from '../Ellipsis-1.3s-200px(1).svg';
import './Styles/WorkSpacePopup.css';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

import { useChannel } from '@ably-labs/react-hooks';

import {
  useChatStore,
  useGroupChatStore,
  useMsgesStore,
  useSelectedChatStore,
  useSelectedStore,
  useUserStore,
  useWorkSpaceStore
} from '../Stores/MainStore';
import { instance } from '../axios';
import WorkSpaceSelector from './WorkSpaceSelector';
import { setRef } from '@mui/material';

export default function SideBar({ setter, type }) {
  const [open, setOpen] = useState(false);
  const [req, setReq] = useState(false);
  const [error, setError] = useState(null);
  const [clicked, setClicked] = useState(null);

  function array_move(arr, old_index, new_index) {
    if (new_index >= arr.length) {
      var k = new_index - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing
  }
  const workspaceNameRef = useRef(null);

  const updateUser = useUserStore(state => state.updateUserState);
  const addWorkSpace = useUserStore(state => state.addWorkSpace);

  const setSelected = useSelectedStore(state => state.updateSelectedState);
  const groupChat = useGroupChatStore(state => state.chats);
  const removeMemberFromGrup = useGroupChatStore(state => state.removeuser);
  const selectedChatStore = useSelectedChatStore(state => state.user);
  const updateSelectedChatStore = useSelectedChatStore(state => state.updateChatState);
  const addUndread = useChatStore(state => state.incrementUnRead);

  const removeGroup = useGroupChatStore(state => state.removegroup);
  const updateGroupChat = useGroupChatStore(state => state.updateChat);
  const addUserToGroup = useGroupChatStore(state => state.addUser);
  const addUserToWorkSpace = useUserStore(state => state.addUser);
  const addUserToSelectedChat = useSelectedChatStore(state => state.addNewUserToSelectedStore);

  const updateSelected = useSelectedStore(state => state.updateSelectedState);
  const chatSetter = useChatStore(state => state.setChat);
  const groupChatSetter = useGroupChatStore(state => state.setChat);
  const workSpaceStore = useWorkSpaceStore(state => state.setWorkSelectdSapce);

  const changeMsgState = useMsgesStore(state => state.updateMsgesState);
  const msgSetter = useMsgesStore(state => state.changeMsgesState);
  const addGroupChat = useGroupChatStore(state => state.addChat);
  const setUser = useUserStore(state => state.updateUserState);
  const addChat = useChatStore(state => state.addChat);
  const addMsg = useChatStore(state => state.addMsg);

  const deleteMsg = useChatStore(state => state.deleteMsg);
  const deleteGroupMsg = useGroupChatStore(state => state.deleteMsg);

  const editGroupMsg = useGroupChatStore(state => state.editMsg);
  const editMsg = useChatStore(state => state.editMsg);

  const me = useUserStore(state => state.user);

  useUserStore.subscribe(state => state.user, console.log);

  let selected = useSelectedStore(state => state.user);
  const setSelectedProfile = useSelectedStore(state => state.updateSelectedState);
  let msges = useMsgesStore(state => state.msges);
  const handleNewMemberInWokrSpace = msg => {
    addUserToGroup(msg.data.newUser, msg.data.chiatId);
    updateGroupChat(msg.data.msg, msg.data.chiatId);
    addUserToWorkSpace(msg.data.newUser, msg.data.workSpaceID);
  };

  const handleCreateWorkSpace = async close => {
    try {
      const accessToken = localStorage.getItem('token');
      if (workspaceNameRef.current.value !== '') {
        setReq(true);

        let res = await instance.post(
          '/workspace/create',
          {
            name: workspaceNameRef.current.value,
            id: me.chatWorkSpaceId,
            userid: me.id
          },

          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );

        workspaceNameRef.current.value = '';

        // me.chatWorkSpaces = res.data.workspace_.workspaces;

        if (res.data.workspace_ === 'P2002') {
          setError('Workspace name should be unique');
          setReq(false);
        } else {
          addWorkSpace(res.data.workspace_);
          addGroupChat(res.data.groupChat);

          close();

          setReq(false);
        }
      } else {
        setError('Name Cannot be empty');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClicked = clicked => {
    setClicked(clicked);
  };

  const addDarkMode = () => {
    document.querySelector('html').classList.add('dark');
    document.querySelector('html').setAttribute('data-theme', 'dark');
  };
  const removeDarkMode = () => {
    document.querySelector('html').classList.remove('dark');

    document.querySelector('html').setAttribute('data-theme', 'light');
  };
  const handleLogout = () => {
    updateSelected(null);
    chatSetter([]);
    groupChatSetter([]);
    workSpaceStore(null);
    setUser(null);

    signOut(auth);
    window.location.reload();
  };
  const handleProfileSetter = () => {
    updateSelected(null);
  };
  const [my_channel] = useChannel(me.id, msg => { });

  useEffect(() => {
    my_channel.subscribe('send-request', msg => {
      let to = msg.data;
      updateUser(to);
    });
    my_channel.subscribe('new-chat', msg => {
      console.log(msg.data.data);
      let new_chat = msg.data.data;
      addChat(new_chat);
    });
    my_channel.subscribe('new-memeber-group', msg => {
      msg.data.newUser.forEach(x => {
        addUserToGroup(x, msg.data.chatId);
      });

      updateGroupChat(msg.data.msg, msg.data.chatId);
    });

    my_channel.subscribe('new-memeber-workspace', msg => {
      handleNewMemberInWokrSpace(msg);
    });
    my_channel.subscribe('new-workspace', msg => {
      addWorkSpace(msg.data.workspace);
      addGroupChat(msg.data.GroupChat);
    });
    my_channel.subscribe('new-group', msg => {
      addGroupChat(msg.data.GroupChat);
    });
    my_channel.subscribe('accept-request', msg => {
      let to = msg.data.from_user;
      let chatId = msg.data.chatId;

      changeMsgState({ chatId: chatId, msges: [] });

      updateUser(to);
    });

    my_channel.subscribe('new-msg', data => {
      let msg = data.data;
      console.log(msg.data.friendId);
      addUndread(msg.data.friendId);

      addMsg(msg.data.msg.msg);
    });
    my_channel.subscribe('new-msg-group', data => {
      console.log(data.data.msg.msg, data.data.chatId);

      updateGroupChat(data.data.msg.msg, data.data.chatId);
    });
    my_channel.subscribe('delete-msg-group', data => {
      let msg = data.data;

      deleteGroupMsg(msg.msgId, msg.chatId);
    });
    my_channel.subscribe('delete-msg', data => {
      let msg = data.data;

      deleteMsg(msg.msgid, msg.chatId);
    });
    my_channel.subscribe('edit-msg-group', data => {
      console.log(data.data);

      let msg = data.data;

      editGroupMsg(msg.msgId, msg.chatId, msg.msg);
    });
    my_channel.subscribe('edit-msg', data => {
      let msg = data.data;
      console.log(data);

      editMsg(msg.msgId, msg.chatId, msg.content);
    });
    my_channel.subscribe('group-remove', data => {
      console.log(data.data);
      removeGroup(data.data.groupId);
      if (selectedChatStore.id === data.data.groupId) {
        updateSelectedChatStore(null);
      }
      if (selected.id === data.data.groupId) {
        setSelectedProfile(null);
      }
    });

    my_channel.subscribe('group-remove-member', data => {
      console.log(data.data);
      removeMemberFromGrup(data.data.groupId, data.data.rId, data.data.msg);
      updateGroupChat(data.data.msg, data.data.groupId);
    });

    return () => {
      my_channel.unsubscribe('send-request');

      my_channel.unsubscribe('new-memeber-workspace');

      my_channel.unsubscribe('new-workspace');

      my_channel.unsubscribe('new-chat');

      my_channel.unsubscribe('new-msg');

      my_channel.unsubscribe('new-msg-group');

      my_channel.unsubscribe('new-msg');

      my_channel.unsubscribe('delete-msg');

      my_channel.unsubscribe('delete-msg-delete');

      my_channel.unsubscribe('group-remove-member');

      my_channel.unsubscribe('group-remove');

      my_channel.unsubscribe('edit-msg');

      my_channel.unsubscribe('edit-msg-group');

      my_channel.unsubscribe('new-group');
      my_channel.unsubscribe('new-memeber-group');
    };
  });

  // const [my_channel] = useChannel(me.id, (msg) => {
  //   console.log(msg);
  // });
  //
  // my_channel.subscribe("send-request", (msg) => {
  //   let to = msg.data;
  //   updateUser(to);
  // });
  // my_channel.subscribe("new-memeber-workspace", (msg) => {
  //   handleNewMemberInWokrSpace(msg);
  // });
  // my_channel.subscribe("new-workspace", (msg) => {
  //   addWorkSpace(msg.data.workspace);
  //   addGroupChat(msg.data.GroupChat);
  // });
  // my_channel.subscribe("accept-request", (msg) => {
  //   let to = msg.data.from_user;
  //   let chatId = msg.data.chatId;
  //
  //   changeMsgState({ chatId: chatId, msges: [] });
  //
  //   updateUser(to);
  // });
  //
  // my_channel.subscribe("new-msg", (data) => {
  //   let chatId = data.data.chatId;
  //   let temp_msg = msges.get(chatId);
  //   temp_msg.msges = data.data.msges;
  //   msges.set(chatId, temp_msg);
  //
  //   let index;
  //   me.friends.forEach((x, i) => {
  //     if (x.chatId === chatId) {
  //       index = i;
  //     }
  //   });
  //   me.friends = array_move(me.friends, index, 0);
  //
  //   updateUser(me);
  //   msgSetter(msges);
  // });

  return type === 'full' ? (
    <div className="w-full h-full flex flex-col felx-wrap bg-white dark:bg-black_i_like ">
      <img alt={me.name} src={me.profilePic} className="rounded-full w-[45%] h-[15%] mt-[15%] ml-[25%]" />
      <div className="dark:text-white font-bold text-[24px] ml-5">{me.name}</div>
      <div className="dark:text-white font-bold text-[24px] ml-5 mt-8">Workspaces</div>
      {me.chatWorkSpaces.workspaces !== undefined ? (
        <div className="max-h-[30%] h-[30%] w-full overflow-scroll flex flex-col mt-4 ">
          {me.chatWorkSpaces.workspaces.map((workspace, index) => {
            return (
              <div className="w-[90%] h-[13%]  ml-3 mb-5" key={index} onClick={() => handleClicked(index)}>
                <WorkSpaceSelector workspace={workspace} selected={clicked === index ? true : false} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="dark:text-white text-[18px] font-bold ml-5 mt-3">No workspaces</div>
      )}
      <div></div>

      {me.admin ? (
        <Popup
          open={open}
          closeOnDocumentClick={!req}
          onClose={() => {
            setError(null);
            setOpen(false);
          }}
          trigger={
            <div className="dark:text-white p-2 w-[90%] ml-3 mt-5 bg-[#EFEFEF] dark:bg-[#1E1E1E] hover:bg-[#4D96DA] dark:hover:bg-[#4D96DA] rounded-md cursor-pointer">
              Add Workspace
            </div>
          }
          position="center"
          modal
        >
          {close => (
            <div className="flex flex-col">
              <div className="flex  w-full h-[70%] ">
                <input
                  ref={workspaceNameRef}
                  placeholder="Workspace name"
                  className="dark:bg-[#1E1E1E] p-1 w-[80%] h-[50px]  text-white dark:text-white outline-none bg-gray_i_like"
                />
                <button
                  disabled={req}
                  className="dark:bg-[#1E1E1E] dark:text-white ml-3 flex flex-wrap justify-center content-center pl-1 pr-1 w-[20%] cursor-pointer bg-gray_i_like "
                  onClick={() => {
                    handleCreateWorkSpace(close);
                  }}
                >
                  {req ? <img src={Loadingbar} /> : 'create'}
                </button>
              </div>
              <div className="text-red-600 text-[18px] mt-1 ">{error}</div>
            </div>
          )}
        </Popup>
      ) : null}

      <button className="bg-red dark:text-white mt-10" onClick={handleLogout}>
        Logout
      </button>
      <div className="flex flex-wrap flex-col  w-[2.5%] h-[10%] justify-between content-center absolute  bottom-[5%] ml-6 dark:bg-[#040706] rounded-3xl pt-2 pb-2 ">
        <i className="fa-solid fa-sun text-[#4D96DA] text-[25px] cursor-pointer" onClick={removeDarkMode}></i>

        <i class="fa-solid fa-moon text-[#4D96DA] text-[25px] cursor-pointer" onClick={addDarkMode}></i>
      </div>
    </div>
  ) : (
    <div className="w-full h-full flex flex-col flex-wrap justify-start content-center bg-white dark:bg-[#16171B]">
      <i
        class="fa-solid fa-arrow-right  dark:text-white mt-12 text-[30px] cursor-pointer "
        onClick={handleProfileSetter}
      ></i>
    </div>
  );
}
