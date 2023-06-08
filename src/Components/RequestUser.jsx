import React from "react";
import { v4 } from "uuid";

import { useChannel } from "@ably-labs/react-hooks";
import { useChatStore, useMsgesStore, useUserStore } from "../Stores/MainStore";
export default function RequestUser({ user }) {
  const [reqChannel] = useChannel("server", (message) => { });
  let me = useUserStore((state) => state.user);
  const setter = useUserStore((state) => state.updateUserState);
  let msges = useMsgesStore((state) => state.msges);
  const msgSetter = useMsgesStore((state) => state.updateMsgesState);
  const chatSec = useChatStore((state) => state.updateChatState);
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
  const rejectRequest = async () => {
    try {
      reqChannel.publish("reject-request", {
        from: user.userId,
        to: me.userId,
      });

      me.requests = me.requests.filter((x, i) => {
        if (x.userId !== user.userId) {
          x.pending = "accepted";
          chatSec(x);
          return false;
        } else {
          return true;
        }
      });

      setter(me);
    } catch (error) {
      console.log(error);
    }
  };

  const acceptRequest = async () => {
    try {
      let chatId = v4();

      reqChannel.publish("accept-request", {
        from: user.userId,
        to: me.userId,
        chatId: chatId,
      });

      let index;
      me.requests.forEach((x, i) => {
        if (x.userId === user.userId) {
          let user = x;
          user.pending = "accepted";
          user.chatId = chatId;

          index = i;

          me.friends.unshift(user);
        }
      });
      me.requests = me.requests.filter((x) => {
        return x.userId !== user.userId;
      });

      setter(me);

      // msgSetter({ chatId: chatId, msges: [] });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full h-full flex flex-wrap dark:bg-[#16171B] rounded-xl dark:shadow-black shadow-xl">
      <img
        alt="loading.."
        src={user.profilePic}
        className="rounded-full h-[70%] mt-3 ml-4"
      />
      <div className="flex flex-col felx-wrap ml-3 mt-1 cursor-pointer">
        <div className="text-[24px] font-bold dark:text-white">
          {user.userName}
        </div>
      </div>
      {user.pending === me.userId ? (
        <div className="text-[#909090] relative top-[50%] right-[16%]">
          Request Pending
        </div>
      ) : (
        <div className="flex ">
          {" "}
          <div
            className="text-green-600 ml-5 mt-3 cursor-pointer"
            onClick={acceptRequest}
          >
            yes
          </div>
          <div
            className="text-red-600 ml-3 mt-3 cursor-pointer"
            onClick={rejectRequest}
          >
            no
          </div>
        </div>
      )}
    </div>
  );
}
