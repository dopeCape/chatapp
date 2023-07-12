import React, { useEffect, useRef, useState } from 'react';
import './Styles/WorkSpacePopup.css';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import Seting from '../settings.svg';
import { useChannel } from '@ably-labs/react-hooks';
import {
  useChatStore,
  useGroupChatStore,
  useHistoryStore,
  useMsgesStore,
  useSelectedChatStore,
  useSelectedStore,
  useUserStore,
  useWorkSpaceStore
} from '../Stores/MainStore';
import { instance } from '../axios';
import WorkSpaceSelector from './WorkSpaceSelector';
import { styled } from 'styled-components';
import WorkSpaceCreatePopUp from './WorkSpaceCreatePopUp';
export default function SideBar({ setter, type }) {
  const [open, setOpen] = useState(false);
  const [req, setReq] = useState(false);
  const [error, setError] = useState(null);
  const [createWorkspacePopUpOpen, setCreateWorkspcePopUpOpen] = useState(false);
  const [clicked, setClicked] = useState(0);
  const [worspacePopUpSize, setWorspacePupUpSize] = useState(600);
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
  const removeWorkspace = useUserStore(state => state.removeWorkspace);
  const removeFriendsFromWorkspace = useChatStore(state => state.removeFriendsFromWorkspacce);
  const addNewHistoryEntry = useHistoryStore(state => state.addNewEntry);
  const changeGroupChatAdmin = useGroupChatStore(state => state.changeAdmin);
  const removeUserFromWorkspace = useUserStore(state => state.removeUserFromWorkspace);
  const deleteAllGroupFromWorkSpace = useGroupChatStore(state => state.removeAllGroupFromWorkspace);
  const addWorkSpace = useUserStore(state => state.addWorkSpace);
  const setSelected = useSelectedStore(state => state.updateSelectedState);
  const groupChat = useGroupChatStore(state => state.chats);
  const unfriend = useChatStore(state => state.unfriend);
  const setSelectedWorkSpace = useWorkSpaceStore(state => state.setWorkSelectdSapce);
  const removeUserFromSelectedWorkspace = useWorkSpaceStore(state => state.removeUser);
  const friends = useChatStore(state => state.chats);
  const updateSelectedWorkSpace = useWorkSpaceStore(state => state.updateSelectedWorkspace);
  const updateWorkspace = useUserStore(state => state.updateWorkspace);
  const removeMemberFromGrup = useGroupChatStore(state => state.removeuser);
  const selectedChatStore = useSelectedChatStore(state => state.user);
  const deleteGroup = useGroupChatStore(state => state.deleteGroup);
  const updateSelectedChatStore = useSelectedChatStore(state => state.updateChatState);
  const addUndread = useChatStore(state => state.incrementUnRead);
  const selectedWorkspace = useWorkSpaceStore(state => state.workspace);
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
  const inclrementGroupUnRead = useGroupChatStore(state => state.incrementUnRead);
  const deleteMsg = useChatStore(state => state.deleteMsg);
  const selecteChat = useSelectedChatStore(state => state.user);
  const deleteGroupMsg = useGroupChatStore(state => state.deleteMsg);
  const editGroupMsg = useGroupChatStore(state => state.editMsg);
  const editMsg = useChatStore(state => state.editMsg);
  const me = useUserStore(state => state.user);
  let selected = useSelectedStore(state => state.user);
  const setSelectedProfile = useSelectedStore(state => state.updateSelectedState);
  const handleNewMemberInWokrSpace = msg => {
    addUserToGroup(msg.data.newUser, msg.data.chiatId);
    updateGroupChat(msg.data.msg, msg.data.chiatId);
    addUserToWorkSpace(msg.data.user, msg.data.workSpaceID);
    inclrementGroupUnRead(msg.data.chiatId);
  };
  const playSound = () => {
    try {
      let au = new Audio('/mixkit-dry-pop-up-notification-alert-2356.wav');
      au.volume = 0.5;
      au.play().catch(error => {
        console.log(error);
      });
    } catch (error) {
      console.log(error);
    }
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
  let accessToken = localStorage.getItem('token');
  useEffect(() => {
    my_channel.subscribe('send-request', msg => {
      let to = msg.data;
      updateUser(to);
    });
    my_channel.subscribe('new-chat', msg => {
      let new_chat = msg.data.data;
      addChat(new_chat);
      if (selectedChatStore.user) {
        if (new_chat.friend.user.id === selectedChatStore?.user.id) {
          updateSelectedChatStore(new_chat.friend);
        } else {
          playSound();
          addUndread(new_chat.id);
        }
      }
    });
    my_channel.subscribe('new-memeber-group', msg => {
      let history = msg.data.history;
      let historyId = msg.data.historyId;
      addNewHistoryEntry(historyId, history);

      msg.data.newUser.forEach(x => {
        addUserToGroup(x, msg.data.chatId);
      });
      updateGroupChat(msg.data.msg, msg.data.chatId);
      if (selecteChat.chatId !== msg.data.chatId) {
        inclrementGroupUnRead(msg.data.chatId);
      }
      groupChat.forEach(x => {
        if (x.groupChat.id === msg.data.chatId && selecteChat.chatId !== msg.data.chatId) {
          if (!x.muted) {
            playSound();
          }
        }
      });
    });

    my_channel.subscribe('new-memeber-workspace', msg => {
      handleNewMemberInWokrSpace(msg);

      playSound();
    });
    my_channel.subscribe('new-workspace', msg => {
      addWorkSpace(msg.data.workspace);
      addGroupChat(msg.data.GroupChat);
      inclrementGroupUnRead(msg.data.groupChat.groupChat.id);

      playSound();
    });
    my_channel.subscribe('new-group', msg => {
      addGroupChat(msg.data.GroupChat);
      playSound();
      inclrementGroupUnRead(msg.data.GroupChat.groupChat.id);
    });
    my_channel.subscribe('accept-request', msg => {
      let to = msg.data.from_user;
      let chatId = msg.data.chatId;
      changeMsgState({ chatId: chatId, msges: [] });
      updateUser(to);
    });

    my_channel.subscribe('new-msg', async data => {
      let msg = data.data;
      if (msg.data.msg.from.id !== me.id) {
        if (selecteChat && selecteChat.user) {
          if (selecteChat.user.id !== msg.data.msg.from.id && selectedWorkspace.id !== msg.data.workspaceId) {
            addUndread(msg.data.friendId);
            friends.forEach(x => {
              if (x.id === msg.data.friendId) {
                if (!x.muted) {
                  playSound();
                }
              }
            });
          } else {
            await instance.post(
              '/user/handleread',
              {
                id: msg.data.friendId
              },
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`
                }
              }
            );
          }
        } else {
          addUndread(msg.data.friendId);

          friends.forEach(x => {
            if (x.id === msg.data.friendId) {
              if (!x.muted) {
                playSound();
              }
            }
          });
        }
      }
      addMsg(msg.data.msg);
    });
    my_channel.subscribe('new-msg-group', async data => {
      let msg = data.data.msg.msg;
      if (msg.from.id !== me.id) {
        if (selecteChat && selecteChat.groupChat) {
          if (selecteChat.groupChatId !== data.data.chatId) {
            inclrementGroupUnRead(data.data.chatId);
            groupChat.forEach(x => {
              if (x.groupChat.id === data.data.chatId && selecteChat.chatId !== data.data.chatId) {
                if (!x.muted) {
                  playSound();
                }
              }
            });
          } else {
            await instance.post(
              '/gchat/unread',
              {
                id: selecteChat.id
              },
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`
                }
              }
            );
          }
        } else {
          inclrementGroupUnRead(data.data.chatId);
          groupChat.forEach(x => {
            if (selecteChat && x.groupChat.id === data.data.chatId && selecteChat.chatId !== data.data.chatId) {
              if (!x.muted) {
                playSound();
              }
            }
          });
        }
      }
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
      let msg = data.data;

      editGroupMsg(msg.msgId, msg.chatId, msg.msg);
    });
    my_channel.subscribe('edit-msg', data => {
      let msg = data.data;

      editMsg(msg.msgId, msg.chatId, msg.content);
    });
    my_channel.subscribe('group-remove', data => {
      removeGroup(data.data.groupChatRefId);
      if (selectedChatStore.id === data.data.groupChatRefId) {
        updateSelectedChatStore(null);
      }
      if (selected.id === data.data.groupChatRefId) {
        setSelectedProfile(null);
      }
    });

    my_channel.subscribe('group-remove-member', data => {
      let history = data.data.history;
      let historyId = data.data.historyId;
      addNewHistoryEntry(historyId, history);

      removeMemberFromGrup(data.data.groupId, data.data.groupChatRefId);
      updateGroupChat(data.data.msg, data.data.groupId);
      inclrementGroupUnRead(data.data.groupId);
      groupChat.forEach(x => {
        if (x.groupChat.id === data.data.groupId && selecteChat.chatId !== data.data.groupId) {
          if (!x.muted) {
            playSound();
          }
        }
      });
    });

    my_channel.subscribe('group-delete', data => {
      console.log(data.data);
      let history = data.data.history;
      let historyId = data.data.historyId;
      addNewHistoryEntry(historyId, history);
      if (selecteChat.groupChat) {
        if (selecteChat.groupChat.id === data.data.groupChatId) {
          updateSelectedChatStore(null);
        }
      }
      deleteGroup(data.data.groupChatId);
    });

    my_channel.subscribe('workspace-update', data => {
      let id = data.data.workSpaceId;
      let workspace_ = data.data.workspace;
      if (id === selectedWorkspace.id) {
        updateSelectedWorkSpace(workspace_);
      }
      updateWorkspace(id, workspace_);
    });

    my_channel.subscribe('unfriend', data => {
      let workspaceId = data.data.workspaceId;
      let userId = data.data.chatWorkspaceId;
      if (selecteChat.id === userId) {
        updateSelectedChatStore(null);
      }
      unfriend(userId, workspaceId);
    });
    my_channel.subscribe('workspace-remove', data => {
      let friendId = data.data.friendId;
      let userId = data.data.id;
      let workspaceId = data.data.workspaceId;
      let groupChats = data.data.groupChats;
      console.log(groupChats);
      if (friendId !== undefined) {
        unfriend(friendId, workspaceId);
      }
      if (!selecteChat.groupChat) {
        if (selecteChat.id === userId && selectedWorkspace.id === workspaceId) {
          updateSelectedChatStore(null);
        }
      }
      groupChats.forEach(groupChat => {
        removeMemberFromGrup(groupChat.groupChatId, groupChat.groupChatRefId);
        updateGroupChat(groupChat.msg, groupChat.groupChatId);
        if (groupChat.admin) {
          console.log(groupChat.admin);
          changeGroupChatAdmin(groupChat.groupChatId, groupChat.admin);
        }
      });
      if (selectedWorkspace.id === workspaceId) {
        removeUserFromSelectedWorkspace(userId);
      }
      removeUserFromWorkspace(workspaceId, userId);
    });
    my_channel.subscribe('workspace-delete', data => {
      let workspaceId = data.data.workspaceId;
      if (selectedWorkspace.id === workspaceId) {
        setSelectedWorkSpace(null);
        if (selecteChat.groupChat) {
          if (selecteChat.groupChat.workspaceId === workspaceId) {
            updateSelectedChatStore(null);
          }
        }
      }
      removeFriendsFromWorkspace(workspaceId);
      removeWorkspace(workspaceId);
      deleteAllGroupFromWorkSpace(workspaceId);
    });

    return () => {
      my_channel.unsubscribe('send-request');
      my_channel.unsubscribe('unfriend');
      my_channel.unsubscribe('workspace-delete');
      my_channel.unsubscribe('workspace-remove');
      my_channel.unsubscribe('workspace-update');
      my_channel.unsubscribe('group-delete');
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
  const CreateWorkspacePopUp = styled(Popup)`
    &-content {
      border: none;
      height: ${({ height }) => height}px;
      padding: 0;
      width: 730px;
      border-radius: 10px;
    }
  `;

  return type === 'full' ? (
    <div className="w-full h-full flex flex-col felx-wrap bg-[#202226] border-r-[2px] border-[#353b43]   ">
      {me.chatWorkSpaces.workspaces !== undefined ? (
        <div className="max-h-[70%]  w-full overflow-scroll flex flex-col mt-4 ">
          {me.chatWorkSpaces.workspaces.map((workspace, index) => {
            return (
              <div className="w-[70px] h-[70px]  ml-3 mb-2" key={index} onClick={() => handleClicked(index)}>
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
        <button
          className="rounded-[10px] bg-[#85858526] h-[60px] w-[60px] ml-4 pt-1    "
          onClick={() => {
            setCreateWorkspcePopUpOpen(true);
          }}
        >
          <i class="fa-solid fa-plus text-white text-[25px]"></i>
        </button>
      ) : null}
      <CreateWorkspacePopUp
        height={worspacePopUpSize}
        modal
        open={createWorkspacePopUpOpen}
        onClose={() => {
          setCreateWorkspcePopUpOpen(false);
        }}
        closeOnDocumentClick={false}
        position="center center"
        closeOnEscape={false}
      >
        {close => <WorkSpaceCreatePopUp close={close} setSize={setWorspacePupUpSize} />}
      </CreateWorkspacePopUp>

      <button className="bg-red dark:text-white  absolute bottom-[13%] ml-4" onClick={handleLogout}>
        Logout
      </button>
      <button className="w-[60px] h-[60px] bg-[#85858526] rounded-[10px] absolute bottom-[2%] ml-4  ">
        <img alt="setting" className="pl-4 animate-pulse" src={Seting} />
      </button>
    </div>
  ) : (
    <div className="w-full h-full flex flex-col  flex-wrap justify-start content-center bg-white dark:bg-[#16171B]">
      <i
        class="fa-solid fa-arrow-right  dark:text-white mt-12 text-[30px] cursor-pointer "
        onClick={handleProfileSetter}
      ></i>
    </div>
  );
}
