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
      className="w-full h-full flex  hover:bg-[#4D96DA] rounded-md p-6 content-center flex-wrap cursor-pointer relative"
      style={{ backgroundColor: `${selected ? '#4D96DA' : ''}` }}
      onClick={handleSetWorkSpace}
    >
      <div className="dark:text-white text-md ml-2">{workspace.name}</div>
      <div className="  dark:text-white cursor-pointer absolute right-[10%] top-[30%]  ">
        <Popup
          trigger={<i class="fa-solid fa-gear"></i>}
          modal
          closeOnDocumentClick={false}
          onClose={() => {
            setEmailError(null);

            setList([]);
          }}
        >
          {close => (
            <div className="w-full h-full flex flex-col">
              <div
                className="absolute top-[1%] right-[2%] text-red-600 cursor-pointer text-[24px]"
                onClick={() => close()}
              >
                x
              </div>
              <div className="w-full h-[70%] flex flex-col flex-wrap">
                <input
                  className="bg-[#EFEFEF] dark:bg-[#22252F] w-[70%] h-[15%] outline-none rounded-md mt-3 ml-3 dark:text-white p-1"
                  placeholder="Users"
                  ref={searchRef}
                  onChange={handleGetUsers}
                />
                <div className="w-[90%] h-[65%] max-h-[65%] overflow-scroll flex flex-col">
                  {list.map(user => {
                    return (
                      <div className="w-[70%] h-[40%] ml-3 mt-2">
                        <InviteElement user={user} workSpaceId={workspace.id} />
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="w-full h-[30%] flex  flex-wrap  ">
                <input
                  className="bg-[#EFEFEF] dark:bg-[#22252F] w-[50%] h-[35%] outline-none rounded-md mt-3 ml-3 dark:text-white p-1"
                  placeholder="Email"
                  ref={emailRef}
                />
                <FormControl
                  sx={{ m: 1, minWidth: 120 }}
                  size="small"
                  className="bg-[#EFEFEF] dark:bg-[#22252F] w-[20%] rounded-md outline-none dark:text-white h-[30%] relative top-[4%]"
                >
                  <InputLabel id="demo-select-small-label" className="dark:text-white">
                    Role
                  </InputLabel>
                  <Select
                    labelId="demo-select-small-label"
                    id="demo-select-small"
                    value={role}
                    label="Role"
                    className="dark:text-white"
                    onChange={handleSetRole}
                  >
                    <MenuItem value={'member'}>Member</MenuItem>
                    <MenuItem value={'external'}>External</MenuItem>
                  </Select>
                </FormControl>
                <button
                  className="bg-[#EFEFEF] dark:bg-[#22252F] w-[20%] rounded-md outline-none dark:text-white h-[30%] mt-3"
                  onClick={handleSendEmailInvite}
                >
                  {emailError === 'x' ? <img src={Loadingbar} alt="sending" /> : 'Send'}
                </button>
              </div>
              <div className="text-red-500 text-[18px] absolute bottom-[5%] left-[3%]">
                {emailError === 'x' ? null : emailError}
              </div>
            </div>
          )}
        </Popup>
      </div>
    </div>
  );
}
