import React, { useRef, useState } from 'react';
import { useGroupChatStore, useSelectedChatStore, useWorkSpaceStore } from '../Stores/MainStore';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import Popup from 'reactjs-popup';
import { instance } from '../axios';
import RequestUser from './RequestUser';
import Loadingbar from '../Ellipsis-1.3s-200px(1).svg';
import InviteElement from './InviteElement';
export default function WorkSpaceSelector({ workspace, selected }) {
  const setSelected = useWorkSpaceStore(state => state.setWorkSelectdSapce);
  const setSeleccteChat = useSelectedChatStore(state => state.updateChatState);
  const groupChat = useGroupChatStore(state => state.chats);
  const [list, setList] = useState([]);
  const [emailError, setEmailError] = useState(null);
  const handleSetWorkSpace = () => {
    const user = groupChat.filter(x => {
      return x.groupChat.name === 'general' && x.groupChat.workspaceId === workspace.id;
    });
    setSeleccteChat(user[0]);
    setSelected(workspace);
  };
  const searchRef = useRef();

  const emailRef = useRef('');

  const [role, setRole] = useState('member');
  const handleSetRole = e => {
    setRole(e.target.value);
  };
  let accessToken = localStorage.getItem('token');
  const validateEmail = email => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  };
  const handleSendEmailInvite = async () => {
    if (emailRef.current.value !== '' && role != null) {
      if (validateEmail(emailRef.current.value)) {
        setEmailError('x');
        let res = await instance.post(
          '/user/email',
          {
            email: emailRef.current.value,
            workspaceId: workspace.id,

            role: role
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        console.log(res);
        setEmailError(res.data.invite);

        emailRef.current.value = '';
      } else {
        emailRef.current.value = '';
        setEmailError('invalid Email');
      }
    } else {
      setEmailError('Email and Role is required ');
    }
  };
  const handleGetUsers = async () => {
    if (searchRef.current.value !== '') {
      try {
        let res = await instance.post(
          '/user/search',
          {
            name: searchRef.current.value,
            workspaceId: workspace.id
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        res.data.users.forEach(x => {
          x.status = 'x';
        });

        res.data.users.forEach(x => {
          workspace.chatWorkSpace.forEach(y => {
            if (y.id != x.chatWorkSpaceId && x.status == 'x') {
              x.status = 'x';
            } else {
              x.status = x.chatWorkSpaces.role;
            }
          });
        });
        setList(res.data.users);
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div
      className="w-[70px] h-[70px] flex   rounded-[10px]  content-center flex-wrap cursor-pointer relative border-[3px] border-[#202226]  p-1 max-h-full max-w-full overflow-hidden"
      style={{ borderColor: `${selected ? 'white' : ''}` }}
      onClick={handleSetWorkSpace}
    >
      <img alt={workspace.name} className="object-cover h-full w-full rounded-[5px]" src={workspace.profilePic} />
    </div>
  );
}
