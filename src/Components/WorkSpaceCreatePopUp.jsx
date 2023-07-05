import React, { useEffect, useRef, useState } from 'react';
import Spinner from '../Spin-1s-200px.svg';

import ProgressBar from 'progressbar.js';
import Done from '../check logo.svg';
import { isValidEmail } from '../utils/helper';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Close from '../ph_x-bold.svg';
import SuteCase from '../briefcase.svg';
import axios from 'axios';
import { instance } from '../axios';
import { useGroupChatStore, useUserStore, useWorkSpaceStore } from '../Stores/MainStore';
import { search } from '../utils/helper';
import { type } from '@testing-library/user-event/dist/type';
export default function WorkSpaceCreatePopUp({ close, setSize }) {
  let workspace = useWorkSpaceStore(state => state.workspace);
  const me = useUserStore(state => state.user);
  const [url, setData] = useState('');
  const [name, setName] = useState('');
  const [uploading, setUploading] = useState('');
  const [dis, setDis] = useState('');
  const [topic, setTopic] = useState('');
  const [screen, setScreen] = useState(1);
  const [processs, setProcess] = useState(null);
  const [error, setError] = useState(null);
  const [searchBar, setSearBar] = useState('');
  const fileRef = useRef();
  const [searchUsers, setSearchUsers] = useState([]);
  const [selecrtedUsers, setSelecterdUsers] = useState([]);
  const [bar, setBar] = useState(null);
  const [fileName, setFileName] = useState(null);
  const addWorkSpace = useUserStore(state => state.addWorkSpace);
  const addChat = useGroupChatStore(state => state.addChat);
  let accessToken = localStorage.getItem('token');
  // useEffect(() => {
  //   let bar;
  //   if (screen === 3) {
  //     setTimeout(() => {
  //       bar = new ProgressBar.Circle('#bar', {
  //         easing: 'easeInOut',
  //         color: '#228b22',
  //         strokeWidth: 3,
  //         trailWidth: 3,
  //         trailColor: '#fbfbfb'
  //       });
  //       bar.animate(0.33);
  //     }, 10);
  //
  //     setProcess('Creating workspce');
  //     setTimeout(() => {
  //       bar.animate(0.33);
  //
  //       setProcess('Sending Invites');
  //     }, 1000);
  //
  //     setTimeout(() => {
  //       bar.animate(0.66);
  //
  //       setProcess('Adding users');
  //     }, 2000);
  //
  //     setTimeout(() => {
  //       bar.animate(1);
  //     }, 3000);
  //     setTimeout(() => {
  //       setScreen(4);
  //     }, 4000);
  //   }
  // }, [scree]);
  const handleSend = async () => {
    try {
      setScreen(3);
      let emailIntes = selecrtedUsers.filter(x => {
        return x.type === 'email';
      });
      let usersA = selecrtedUsers.filter(x => {
        return x.type !== 'email';
      });
      let bar;
      setTimeout(() => {
        bar = new ProgressBar.Circle('#bar', {
          easing: 'easeInOut',
          color: '#228b22',
          strokeWidth: 3,
          trailWidth: 3,
          trailColor: '#fbfbfb'
        });
      }, 10);

      setProcess('Creating workspace');
      let res = await instance.post(
        '/workspace/create',
        {
          userid: me.id,
          id: me.chatWorkSpaces.id,
          name: name,
          topic,
          description: dis,
          profilePic: url
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      bar.animate(0.33);
      let workspaceId = res.data.workspace_.id;
      if (emailIntes.length > 0) {
        setProcess('Sending invtes.');
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

      bar.animate(0.66);
      setProcess('Sending invtes.');
      setTimeout(async () => {
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
      }, 0);
      bar.animate(1);
      setScreen(4);
      addWorkSpace(res.data.workspace_);
      addChat(res.data.groupChat);
      setBar(bar);
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
            return x.id !== me.id;
          });
          setSearchUsers(res.data.users);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleProfileUpload = async e => {
    try {
      if (e.target.files) {
        if (e.target.files[0].size < 5000000) {
          if (url.length !== 0) {
            let file = e.target.files[0];
            let fileExt = file.name;
            await axios.delete(url);

            const storage = getStorage();
            const storageRef = ref(storage, 'files/' + fileExt);
            setUploading(true);
            uploadBytes(storageRef, file).then(snapshot => {
              getDownloadURL(snapshot.ref).then(async ur => {
                setData(ur);
                setFileName(fileExt);
                setUploading(false);
              });
            });
          } else {
            let file = e.target.files[0];
            let fileExt = file.name;
            const storage = getStorage();
            const storageRef = ref(storage, 'files/' + fileExt);

            setUploading(true);
            uploadBytes(storageRef, file).then(snapshot => {
              getDownloadURL(snapshot.ref).then(async ur => {
                setData(ur);

                setFileName(fileExt);

                setUploading(false);
              });
            });
          }
        } else {
          setFileName('Image should be less than 5mb');
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const HandleNext = () => {
    if (url.length !== 0 && name.length !== 0 && topic.length !== 0 && dis.length !== 0) {
      setScreen(2);
      setError(null);
    } else {
      setError('* Please provide required information');
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#37393F] rounded-[10px] relative">
      <div className="flex ml-8 mt-8">
        {screen === 2 ? (
          <div>
            <i
              class="fa-solid fa-angle-left text-white text-[20px] mt-1 mr-2 cursor-pointer"
              onClick={() => {
                setScreen(1);
              }}
            ></i>
          </div>
        ) : null}
        <div className=" text-[20px] text-white font-[700]">Create a Workspace</div>
      </div>
      {screen !== 3 && screen !== 4 ? (
        <div>
          {' '}
          <button
            className="absolute bg-transparent border-[1px] border-[#4D96DA] py-2 px-4 text-white rounded-[5px] w-[130px]  bottom-[7%] right-[25%] font-[700] "
            onClick={async () => {
              if (url.length !== 0) {
                await axios.delete(url);
                close();
              } else {
                close();
              }
            }}
          >
            Cancle
          </button>
          {screen === 1 ? (
            <button
              className="absolute bg-[#4D96DA]  border-[1px]  py-2 px-4 text-white rounded-[5px] w-[130px]  bottom-[7%] right-[5%]  font-[700] border-[#4D96DA] disabled:bg-blue-300 "
              onClick={HandleNext}
            >
              Next
            </button>
          ) : (
            <button
              className="absolute bg-[#4D96DA]  border-[1px]  py-2 px-4 text-white rounded-[5px] w-[130px]  bottom-[7%] right-[5%]  font-[700] border-[#4D96DA] disabled:bg-blue-300 "
              onClick={handleSend}
            >
              Create
            </button>
          )}
        </div>
      ) : null}
      {screen === 1 ? (
        <div className="flex flex-col w-full h-full ">
          <div className="text-white font-[700] ml-8 mt-8 text-[18px]">Workspace name</div>
          <input
            className="bg-[#40434B] p-4 text-white rounded-[5px]  w-[55%] mt-4 ml-8 outline-none"
            placeholder="ex: AMX Consulting"
            value={name}
            onChange={e => {
              if (e.target.value.length < 15) {
                setName(e.target.value);
              } else {
                setName(e.target.value.slice(0, 15));
              }
            }}
          />

          <div className="absolute top-[33%]  text-white left-[54%] ">{name.length}/15</div>
          <div className="text-white font-[700] ml-8 mt-8 text-[18px]">Topic</div>
          <input
            className="bg-[#40434B] p-4 text-white rounded-[5px]  w-[55%] mt-4 ml-8 outline-none"
            placeholder="ex: AMX Consulting Team Collaboration"
            value={topic}
            onChange={e => {
              if (e.target.value.length < 40) {
                setTopic(e.target.value);
              } else {
                setTopic(e.target.value.slice(0, 40));
              }
            }}
          />

          <div className="absolute top-[55%]  text-white left-[54%] ">{topic.length}/40</div>
          <div className="text-white font-[700] ml-8 mt-8 text-[18px]">Description</div>
          <textarea
            className="bg-[#40434B] p-4 text-white rounded-[5px]  w-[90%] mt-4 ml-8 resize-none outline-none"
            placeholder="ex: To recap daily task, event, or any collaborations."
            value={dis}
            onChange={e => {
              if (e.target.value.length < 80) {
                setDis(e.target.value);
              } else {
                setDis(e.target.value.slice(0, 80));
              }
            }}
          />

          <div className="absolute top-[81%]  text-white right-[6%] ">{dis.length}/80</div>
          <div className="absolute flex flex-col right-[10%] top-[13%]">
            <div className="text-white font-[700]  text-[18px] mb-2">Profile photo</div>
            <div className="bg-[#585B66] w-[190px] h-[190px] rounded-[5px] flex flex-warp justify-center content-center">
              {url.length !== 0 ? (
                <img alt="Workspace" src={url} className="object-cover" />
              ) : (
                <img alt="Workspace" src={SuteCase} />
              )}
            </div>
            <button
              className="rounded-[5px] bg-[#585B66] px-3 text-[18px] text-white font-[700] py-2 mt-3 flex flex-wrap justify-center content-center"
              onClick={() => {
                fileRef.current.click();
              }}
            >
              {uploading ? <img className="h-[25px] w-[40px] " alt="loading.." src={Spinner} /> : 'Upload Photo'}
            </button>
            <input type="file" ref={fileRef} className="hidden" onChange={handleProfileUpload} />
            <div className="text-[#F8F8F8] text-[12px]  mt-3 text-center">
              {fileName ? (
                <div className="text-red-400">{fileName.split('.')[0].slice(0, 15)}</div>
              ) : (
                'We recommend 1:1 Ratio'
              )}
            </div>
          </div>
          <div className="absolute bottom-[4%] ml-6 text-red-400">{error}</div>
        </div>
      ) : screen === 2 ? (
        <div className="flex flex-col  w-full h-full">
          <div className="text-white font-[700] text-[18px] mt-8 ml-8">Invite team members</div>
          <input
            value={searchBar}
            onChange={e => {
              if (e.target.value !== '') {
                setSearBar(e.target.value);
                handleSearch(e.target.value);
              } else {
                setSearBar(e.target.value);
                setSearchUsers([]);
              }
            }}
            className="w-[85%] ml-8 bg-[#40434B] outline-none p-3 rounded-[5px] text-white mt-4"
            placeholder="Enter email or name"
          />
          {searchUsers.length !== 0 ? (
            <div className="relative w-[80%] m-h-[40%] bg-[#585B66] flex flex-col ml-12 rounded-[5px] py-2">
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
            <div class="flex flex-wrap ml-8 mt-8 w-[85%] max-h-[40%]  ">
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
        </div>
      ) : screen === 3 ? (
        <div className="w-full h-full flex flex-col flex-wrap justify-center content-center">
          <div id="bar" className="bar w-[200px] h-[200px]"></div>
          <div className="mt-8 text-white font-bold text-center">{processs}</div>
        </div>
      ) : screen === 4 ? (
        <div className="flex flex-col w-full h-full justify-center content-center  flex-wrap">
          <img alt="done." className="w-[200px] h-[200px] ml-12 " src={Done} />
          <div className="text-white font-[700] mt-8 text-[24px]">Workspace has been created!</div>
          <img
            className="absolute right-[10%] top-[8%] w-[20px] h-[20px] cursor-pointer"
            src={Close}
            onClick={() => {
              close();
            }}
            alt="X"
          />
        </div>
      ) : null}
      <div className="absolute bottom-[10%] text-white  ml-8">Step {screen} of 4</div>
    </div>
  );
}
