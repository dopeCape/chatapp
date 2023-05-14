/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from "react";
import { useChannel } from "@ably-labs/react-hooks";
import { v4 } from "uuid";

import { getAuth, signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function UserProfile({
  type,
  me,
  user,
  setter,
  chatSec,
  reRendere,
  msgSetter,
  msges,
}) {
  const [profile, setProfile] = useState(user);
  const handleLogout = () => {
    setter(null);
    chatSec(null);
    msgSetter([]);

    signOut(auth);
  };
  useEffect(() => {
    if (type === "me") {
      me?.friends?.forEach((x) => {
        console.log(x);
        if (x.pending !== "accepted") {
          setFriendData({
            ...friendData,
            pending: friendData.pending + 1,
          });
        }
        if (x.blocked !== "" || x.blocked !== undefined) {
          setFriendData({
            ...friendData,
            blocked: friendData.blocked + 1,
          });
        }
        if (x.pending === "accepted") {
          console.log("huh?");
          setFriendData({
            ...friendData,
            friend: friendData.friend + 1,
          });
        }
      });
    }
  }, []);
  const [reqChannel, ably] = useChannel("server", (message) => { });
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

  if (type !== "me") {
    const [my_channel, ably] = useChannel(me.userId, (message) => { });

    my_channel.subscribe("send-request", (msg) => {
      let to = msg.data;
      setter(to);
      reRendere.current = reRendere.current + 1;
    });

    my_channel.subscribe("accept-request", (msg) => {
      let to = msg.data.from_user;
      let chatId = msg.data.chatId;
      msgSetter([...msges, { chatId: chatId, msges: [] }]);

      setter(to);

      reRendere.current = reRendere.current + 1;
    });
    my_channel.subscribe("reject-request", (msg) => {
      let to = msg.data;

      setter(to);

      reRendere.current = reRendere.current + 1;
    });
    my_channel.subscribe("block-request", (msg) => {
      let to = msg.data;

      setter(to);
    });
    my_channel.subscribe("unblock-request", (msg) => {
      let to = msg.data;

      setter(to);

      reRendere.current = reRendere.current + 1;
    });
    my_channel.subscribe("remove-request", (msg) => {
      let to = msg.data;

      setter(to);

      reRendere.current = reRendere.current + 1;
    });
  }
  const unBlockRequest = () => {
    try {
      reqChannel.publish("unblock-request", {
        from: me.userId,
        to: user.userId,
      });
      let index;
      me.friends.forEach((x, i) => {
        if (x.userId === user.userId) {
          index = i;
          console.log(x);

          chatSec(x);
        }
      });

      setter(me);

      reRendere.current = reRendere.current + 1;
    } catch (error) {
      console.log(error);
    }
  };

  const blockRequest = () => {
    try {
      reqChannel.publish("block-request", {
        from: me.userId,
        to: user.userId,
      });

      me.friends.forEach((x, i) => {
        if (x.userId === user.userId) {
          x.blocked = me.userId;

          console.log(x);

          chatSec(x);
        }
      });

      setter(me);

      reRendere.current = reRendere.current + 1;
    } catch (error) {
      console.log(error);
    }
  };
  const removeRequest = () => {
    try {
      reqChannel.publish("remove-request", {
        from: me.userId,
        to: user.userId,
      });
      let index;
      me.friends.filter((x, i) => {
        if (x.userId === user.userId) {
          x.blocked = "";
          x.pending = "";
          user.pending = "";
          user.blocked = "";

          chatSec(x);
        }
        return x.userId !== user.userId;
      });

      me.friends = array_move(me.friends, index, 0);

      setter(me);

      reRendere.current = reRendere.current + 1;
    } catch (error) {
      console.log(error);
    }
  };

  const sendRequest = async () => {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks

      if (user.pending !== me.userId) {
        reqChannel.publish("send-request", {
          from: me.userId,
          to: user.userId,
        });
        setter({
          ...me,
          friends: [
            { ...user, pending: me.userId, status: "pending" },

            ...me.friends,
          ],
        });
        user.pending = me.userId;
      }

      reRendere.current = reRendere.current + 1;
    } catch (error) {
      console.log(error);
    }
  };

  const rejectRequest = async () => {
    try {
      reqChannel.publish("accept-request", {
        from: user.userId,
        to: me.userId,
      });
      let index;
      me.friends.forEach((x, i) => {
        if (x.userId === user.userId) {
          x.pending = "rejected";
          index = i;

          chatSec(x);
        }
      });
      me.friends = array_move(me.friends, index, 0);

      setter(me);

      reRendere.current = reRendere.current + 1;
    } catch (error) {
      console.log(error);
    }
  };

  const acceptRequest = async () => {
    try {
      let chatId = v4();
      console.log(chatId);
      reqChannel.publish("accept-request", {
        from: user.userId,
        to: me.userId,
        chatId: chatId,
      });
      console.log(chatId);
      let index;
      me.friends.forEach((x, i) => {
        if (x.userId === user.userId) {
          x.pending = "accepted";
          x.chatId = chatId;
          index = i;

          chatSec(x);
        }
      });
      me.friends = array_move(me.friends, index, 0);

      setter(me);

      msgSetter([...msges, { chatId: chatId, msges: [] }]);

      reRendere.current = reRendere.current + 1;
    } catch (error) {
      console.log(error);
    }
  };

  const [friendData, setFriendData] = useState({
    pending: 0,
    blocked: 0,
    friend: 0,
  });
  return (
    <div className="w-full h-full bg-black  rounded-[10px] border-gray_i_like border-[2px] hover:border-gray-500 max-h-full max-w-full overflow-hidden">
      {type === "me" ? (
        <div className="flex flex-wrap felx-col w-full h-full ">
          <div className="w-full h-[50%] flex flex-wrap justify-start ml-5 mt-5 content-center">
            <img
              alt={user.userName}
              src={user.profilePic}
              className="h-[90%] w-[50%] object-cover rounded-lg"
            />
          </div>
          <div className="flex flex-col w-full h-[50%]">
            <div className="text-white text-[30px] font-bold ml-5">
              {user.userName}
            </div>
            <div className="text-gray-400 text-[25px]  ml-5">{user.email}</div>

            <button
              className="text-black hover:bg-white w-[35%] h-[20%] relative left-[60%]   rounded-lg bg-gray-400"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      ) : user === null ? (
        <div className="flex flex-wrap text-center text-white text-[30px] font-bold justify-center content-center h-full">
          start a converstion by selecting a friend
        </div>
      ) : (
        <div className="w-full h-full flex flex-col">
          <div className="w-[100%] h-[60%] flex flex-wrap">
            <img
              src={user.profilePic}
              alt={user.userName}
              className="w-[40%] h-[100%] ml-5 mt-5 rounded-lg"
            />
            <div className="felx flex-col">
              <div className="text-white text-[25px] font-bold mt-5 ml-5">
                {user.userName}
              </div>
              {user.pending === me.userId ? (
                <div className="text-yellow-400 text-[20px]  mt-3 ml-5">
                  Request Sent
                </div>
              ) : user.pending === user.userId ? (
                <div className="text-yellow-400 text-[20px]  mt-3 ml-5">
                  Pending Request
                </div>
              ) : user.pending === "rejected" ? (
                <div className="text-yellow-400 text-[20px]  mt-3 ml-5">
                  rejected .
                </div>
              ) : user.blocked === me.userId ? (
                <div className="text-red-400 text-[20px]  mt-3 ml-5">
                  You blocked the user
                </div>
              ) : user.blocked === user.userId ? (
                <div className="text-red-400 text-[20px]  mt-3 ml-5">
                  User blocked You
                </div>
              ) : user.pending === "accepted" ? (
                <div className="text-green-400 text-[20px]  mt-3 ml-5">
                  Friend
                </div>
              ) : user.pending === "" ? (
                <div className="text-white text-[20px]  mt-3 ml-5">
                  Not a Friend
                </div>
              ) : user.blocked === "" ? (
                <div className="text-green text-[20px]  mt-3 ml-5">Friend</div>
              ) : (
                <div className="text-white text-[20px]  mt-3 ml-5">
                  Not a Friend
                </div>
              )}
            </div>
          </div>
          {user.pending === user.userId ? (
            <div className="flex flex-wrap justify-around mt-10">
              <button
                className="bg-gray-400 p-3 w-[35%] rounded-lg hover:bg-white "
                onClick={acceptRequest}
              >
                Accept Request
              </button>
              <button
                className="bg-gray-400 p-3 w-[35%] rounded-lg  hover:bg-white"
                onClick={rejectRequest}
              >
                Reject request
              </button>
            </div>
          ) : user.blocked === me.userId ? (
            <div className="flex flex-wrap justify-around mt-10">
              <button
                className="bg-gray-400 p-3 w-[35%] rounded-lg hover:bg-white "
                onClick={removeRequest}
              >
                Unfriend
              </button>
              <button
                className="bg-gray-400 p-3 w-[35%] rounded-lg  hover:bg-white"
                onClick={unBlockRequest}
              >
                UnBlock
              </button>
            </div>
          ) : user.pending === "accepted" ? (
            <div className="flex flex-wrap justify-around mt-10">
              <button
                className="bg-gray-400 p-3 w-[35%] rounded-lg hover:bg-white "
                onClick={removeRequest}
              >
                Unfriend
              </button>
              <button
                className="bg-gray-400 p-3 w-[35%] rounded-lg  hover:bg-white"
                onClick={blockRequest}
              >
                Block
              </button>
            </div>
          ) : user.blocked === user.userId ? (
            <button
              className="bg-gray-400 p-3 w-[35%] rounded-lg hover:bg-white "
              onClick={removeRequest}
            >
              Unfriend
            </button>
          ) : user.pending === me.userId ? (
            ""
          ) : (
            <button
              className="bg-gray-400 p-3 w-[35%] rounded-lg hover:bg-white mt-10 ml-5"
              onClick={sendRequest}
            >
              Send Request
            </button>
          )}
        </div>
      )}
    </div>
  );
}
