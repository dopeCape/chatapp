import React, { useEffect, useState } from 'react';

import ChatSelector from '../Components/ChatSelector';
import UserProfile from '../Components/UserProfile';
import ChatSection from '../Components/ChatSection';
import lodadinGif from '../Ripple-1.3s-287px.svg';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import LoginScreen from './LoginScreen';
import { instance } from '../axios';
import { configureAbly } from '@ably-labs/react-hooks';
import SideBar from '../Components/SideBar';
import RequestScreen from '../Components/RequestScreen';
import { useChatStore, useGroupChatStore, useMsgesStore, useSelectedStore, useUserStore } from '../Stores/MainStore';

export default function MainScreen() {
  const [screen, setScreen] = useState('main');

  const [, setAbly] = useState(null);
  const user = useUserStore(state => state.user);

  const auth = getAuth();

  let profile = useSelectedStore(state => state.user);
  const setChat = useChatStore(state => state.setChat);
  const setGroupChat = useGroupChatStore(state => state.setChat);
  const updateUser = useUserStore(state => state.updateUserState);

  useEffect(() => {
    onAuthStateChanged(auth, async user_ => {
      if (user_) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User

        localStorage.setItem('token', user_.accessToken);
        //
        setTimeout(async () => {
          let user = await instance.get(`/user/${user_.uid}`, {
            headers: {
              Authorization: `Bearer ${user_.accessToken}`
            }
          });
          configureAbly({
            authCallback: (_, callback) => {
              callback(null, user.data.ably_token);
            }
          });

          let groupChat = user.data.user_data.chatWorkSpaces.groupChats;
          let chats = user.data.user_data.chatWorkSpaces.Friend;

          setChat(chats);
          setGroupChat(groupChat);
          updateUser(user.data.user_data);
        }, 3000);
        // ...
      } else {
        updateUser('logout');
        setAbly(null);
        localStorage.removeItem('token');
        // User is signed out
        // ...
      }
    });
  }, []);

  return (
    <div className="w-screen h-screen bg-black_i_like flex  flex-wrap justify-center content-center max-h-screen max-w-screen overflow-hidden ">
      {user === null ? (
        <img src={lodadinGif} alt="loadin.." />
      ) : user === 'logout' ? (
        <LoginScreen />
      ) : (
        <div className="w-screen h-screen  flex felx-wrap  ">
          {profile !== null ? (
            <div className="w-[5%] h-full ">
              <SideBar setter={setScreen} type="half" />
            </div>
          ) : (
            <div className="w-[18%] h-full ">
              <SideBar setter={setScreen} type="full" />
            </div>
          )}
          <>
            <div className="h-full w-[25%]">
              <ChatSelector />
            </div>
            <div className="h-full " style={{ width: `${profile !== null ? '50%' : '57%'}` }}>
              <ChatSection />
            </div>
            {profile !== null ? (
              <div className="h-full w-[20%]">
                <UserProfile />
              </div>
            ) : null}
          </>{' '}
        </div>
      )}
    </div>
  );
}
