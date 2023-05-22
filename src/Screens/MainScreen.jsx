import React, { useEffect, useRef, useState } from "react";

import ChatSelector from "../Components/ChatSelector";
import UserProfile from "../Components/UserProfile";
import ChatSection from "../Components/ChatSection";
import lodadinGif from "../Ripple-1.3s-287px.svg";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import LoginScreen from "./LoginScreen";
import { instance } from "../axios";
import { configureAbly, useChannel } from "@ably-labs/react-hooks";

export default function MainScreen() {
  const [selected, setSelected] = useState(null);
  const [msages, setMsages] = useState([]);
  const [ruser, setUser] = useState(null);
  const [ably, setAbly] = useState(null);
  let forceRef = useRef(0);
  const auth = getAuth();
  useEffect(() => {
    onAuthStateChanged(auth, async (user_) => {
      if (user_) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User

        localStorage.setItem("token", user_.accessToken);

        setTimeout(async () => {
          let user = await instance.get(`/user/${user_.uid}`, {
            headers: {
              Authorization: `Bearer ${user_.accessToken}`,
            },
          });

          configureAbly({
            authCallback: (_, callback) => {
              callback(null, user.data.ably_token);
            },
          });
          setMsages(user.data.msg);

          setUser(user.data.user_data);
        }, 1000);

        // ...
      } else {
        setUser("logout");
        setAbly(null);
        localStorage.removeItem("token");
        // User is signed out
        // ...
      }
    });
  }, []);

  return (
    <div className="w-screen h-screen bg-black_i_like flex  flex-wrap justify-center content-center ">
      {ruser === null ? (
        <img src={lodadinGif} alt="loadin.." />
      ) : ruser === "logout" ? (
        <LoginScreen setter={setUser} />
      ) : (
        <>
          <div className="w-[25%] h-[80%]   ">
            <ChatSelector
              friends={ruser.friends}
              chatSec={setSelected}
              userId={ruser.userId}
              setter={setUser}
              me={ruser}
            />
          </div>
          {selected !== null ? (
            <div className=" w-[40%] h-[80%] ml-5">
              <ChatSection
                reRender={forceRef}
                user={selected}
                me={ruser}
                msges={msages}
                msgSetter={setMsages}
                userSetter={setUser}
              />
            </div>
          ) : (
            ""
          )}
          <div className="w-[25%] h-[80%] flex flex-col">
            <div className="w-[100%] h-[40%] ml-5">
              <UserProfile
                reRendere={forceRef}
                user={selected}
                me={ruser}
                msges={msages}
                msgSetter={setMsages}
                setter={setUser}
                chatSec={setSelected}
              />
            </div>
            <div className="w-[100%] h-[60%] ml-5 mt-5">
              <UserProfile
                type="me"
                user={ruser}
                setter={setUser}
                msgSetter={setMsages}
                chatSec={setSelected}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
