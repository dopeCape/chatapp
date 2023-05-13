/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import ScrollableFeed from "react-scrollable-feed";
import { useChannel } from "@ably-labs/react-hooks";
import { instance } from "../axios";

export default function ChatSection({ me, msges, msgSetter, user }) {
  const [chat, setChat] = useState([]);
  const screollRef = useRef();
  const chatRef = useRef();

  const [my_channel, ably] = useChannel(me.userId, (x) => { });

  my_channel.subscribe("new-msg", (data) => {
    msges.forEach((x) => {
      if (x.chatId === data.data.chatId) {
        x.msges = data.data.msges;
      }
    });
    msgSetter(msges);

    changeChat();

    screollRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  });

  my_channel.subscribe("delete-msg", (data) => {
    msges.forEach((x) => {
      if (x.chatId === data.data.chatId) {
        x.msges = data.data.msges;
      }
    });
    msgSetter(msges);

    changeChat();

    screollRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  });
  const changeChat = () => {
    msges.forEach((x) => {
      if (x.chatId === user.chatId) {
        setChat(x.msges);
      }
    });
  };
  useEffect(() => {
    changeChat();
  }, [user, msges]);

  const [server_channel, _] = useChannel("server", (x) => { });
  const handleDeleteMsg = async (e) => {
    try {
      server_channel.publish("delete-msg", {
        chatId: user.chatId,
        msgId: e.currentTarget.getAttribute("data-value"),
        to: user.userId,
      });
      let new_chat = chat.filter((x) => {
        return x.msgId !== e.currentTarget.getAttribute("data-value");
      });
      msges.forEach((x) => {
        if (x.chatId === user.chatId) {
          x.msges = new_chat;
        }
      });
      msgSetter(msges);

      changeChat();
    } catch (error) {
      console.log(error);
    }
  };
  const handleSendMsg = async () => {
    server_channel.publish("new-msg", {
      msg: chatRef.current.value,
      from: me.userId,
      to: user.userId,
      chatId: user.chatId,
    });
    chatRef.current.value = "";
  };

  // useEffect(() => {
  //   const x = async () => {
  //     if (user.pending === "accepted") {
  //       let msges = await instance.get(`/msges/${user.chatId}`, {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //         },
  //       });
  //       let nemsges = msges.data.msges.msges;
  //
  //       setChat(nemsges);
  //     }
  //   };
  //   x();
  // }, []);

  return (
    <div className="w-full h-full bg-black  rounded-[10px] border-gray_i_like border-[2px] hover:border-gray-500 ">
      {user.blocked === me.userId ? (
        <div className="text-white text-[26px] font-bold text-center mt-24">
          Unblock To resume conversation
        </div>
      ) : user.blocked === user.userId ? (
        <div className="text-white text-[26px] font-bold text-center mt-24">
          User Has Blocked you
        </div>
      ) : user.pending === user.userId ? (
        <div className="text-white text-[26px] font-bold text-center mt-24">
          Accpet the request to start conversation
        </div>
      ) : user.pending === me.userId || user.pending === "rejected" ? (
        <div className="text-white text-[26px] font-bold text-center mt-24">
          User has not accepted the request
        </div>
      ) : user.pending === undefined ? (
        <div className="text-white text-[26px] font-bold text-center mt-24">
          They are not you friend
        </div>
      ) : user.pending === "accepted" ? (
        chat.length === 0 ? (
          <div className="text-white text-[26px] font-bold text-center mt-24">
            Say Hello to Them
          </div>
        ) : (
          <div className="h-[87%] w-full max-h-[87%] overflow-y-scroll overflow-x-hidden flex flex-col mb-2 relative">
            {chat.map((msg) => {
              return msg.from === me.userId ? (
                <div className=" text-gray-400 font-bold text-[14px] mr-5 ">
                  <div className="relative left-[95%] mt-3">{"me"}</div>

                  <div className="text-white p-3 border-gray_i_like rounded-lg border-[1px]  ml-5 mt-3 font-normal text-[20px] flex flex-warp justify-end ">
                    <div className="relative left-[10%] w-[50% ] text-start max-w-[60%] overflow-hidden">
                      {msg.msg}
                    </div>
                    <button
                      className="text-gray-600 relative right-[90%] w-[10%] hover:text-white"
                      data-value={msg.msgId}
                      onClick={handleDeleteMsg}
                    >
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative  text-gray-400 font-bold text-[14px] mr-5 ">
                  <div className="relative ml-5 mt-3">{user.userName}</div>

                  <div className="text-white p-3 border-gray_i_like rounded-lg border-[1px]   ml-5 mt-3 font-normal text-[20px] flex flex-warp justify-start w-[] ">
                    {msg.msg}
                  </div>
                </div>
              );
            })}

            <div ref={screollRef}></div>
          </div>
        )
      ) : (
        ""
      )}
      {user.pending === "accepted" && user.blocked === (undefined || "") ? (
        <div className="flex flex-wrap w-full mb-5 sticky top-[90%]">
          <input
            className="w-[80%] bg-black text-white border-gray_i_like border-[2px] rounded-lg p-4 ml-5 mt-2  outline-none  "
            placeholder="type a message..."
            ref={chatRef}
          />

          <button
            className="bg-black text-white font-bold text-[26px] ml-5 sticky "
            onClick={handleSendMsg}
          >
            send
          </button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
