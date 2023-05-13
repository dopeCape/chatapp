import React, { useRef, useState } from "react";
import { instance } from "../axios";

export default function ChatSelector({ friends, chatSec, userId, me }) {
  const [bar, setBar] = useState("friends");
  const [list, setList] = useState([]);
  const [friendsList, setFriends] = useState(friends);

  const searhRef = useRef();

  const handleChangeBar = () => {
    if (searhRef.current !== undefined) {
      searhRef.current.value = "";
      if (bar === "friends") {
        setBar("find");
      } else {
        setBar("friends");
      }
    }
  };
  //
  const handleSearch = async () => {
    let q = searhRef.current.value;
    if (bar === "find") {
      if (q) {
        try {
          let res = await instance.get(`/user/search/${q}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          res.data.users = res.data.users.filter((x) => {
            return x.userId !== userId;
          });
          res.data.users.forEach((x) => {
            me.friends.forEach((y) => {
              if (x.userId === y.userId) {
                x.blocked = y.blocked;

                x.pending = y.pending;
              }
            });
          });
          setList(res.data.users);
        } catch (error) {
          console.log(error);
        }
      } else {
        setList([]);
      }
    } else {
    }
  };
  return (
    <div className="w-full h-full bg-black  rounded-[10px] border-gray_i_like border-[2px] hover:border-gray-500 flex flex-col flex-warp  ">
      <div className="flex flex-warp  flex-col w-full h-[20%]  ">
        <div className="flex  flex-warp justify-between">
          <button
            className=" outline-none  text-[20px] mt-5 ml-5 text-gray-500 hover:text-gray-300 cursor-pointer font-bold "
            style={{ color: `${bar === "friends" ? "white" : ""}` }}
            onClick={handleChangeBar}
          >
            Friends
          </button>
          <button
            className=" outline-none  text-[20px] mt-5 relative right-[5%]  text-gray-500 hover:text-gray-300 cursor-pointer font-bold"
            style={{ color: `${bar === "find" ? "white" : ""}` }}
            onClick={handleChangeBar}
          >
            Find Friends
          </button>
        </div>
        <div>
          <input
            className="outline-none border-gray_i_like border-[2px] bg-black ml-5 mt-5 w-[90%]  text-white p-3 rounded-[10px] focus:border-white"
            placeholder="Search"
            ref={searhRef}
            onChange={handleSearch}
          />
        </div>
      </div>
      <div className="w-full h-[80%] flex flex-col  max-w-full max-h-[80%] overflow-x-hidden overflow-y-scroll">
        {bar === "friends"
          ? friends?.map((fr, i) => {
            return (
              <div
                className="w-full h-[12%] flex flex-warp  mt-5 cursor-pointer text-gray-700 hover:text-white hover:scale-105"
                value={i}
                onClick={(e) => {
                  chatSec({ ...fr });
                }}
              >
                <img
                  alt={fr.userName || fr.userName}
                  src={fr.profilePic || fr.profilePic}
                  className="rounded-lg ml-5 "
                  value={i}
                  onClick={(e) => {
                    chatSec({ ...fr });
                  }}
                />
                <div className="flex flex-col ">
                  <div
                    className="text-[25px]  font-bold ml-3 mt-1 "
                    value={i}
                    onClick={(e) => {
                      chatSec({ ...fr });
                    }}
                  >
                    {fr.userName}
                  </div>
                  <div
                    value={i}
                    onClick={(e) => {
                      chatSec({ ...fr });
                    }}
                    className="text-[14px] font-bold ml-3 "
                    style={{
                      color: `${fr.status === "friend"
                          ? "green"
                          : fr.status === "pending"
                            ? "yellow"
                            : fr.status === "blocked"
                              ? "red"
                              : ""
                        }`,
                    }}
                  >
                    {fr.status}
                  </div>
                </div>
              </div>
            );
          })
          : list?.map((fr, i) => {
            return (
              <div
                className="w-full h-[12%] flex flex-warp  mt-5 cursor-pointer text-gray-700 hover:text-white hover:scale-105"
                value={i}
                onClick={(e) => {
                  chatSec({ ...fr, status: fr.status });
                }}
              >
                <img
                  alt={fr.userName}
                  src={fr.profilePic}
                  className="rounded-lg ml-5 "
                  value={i}
                  onClick={(e) => {
                    chatSec({ ...fr, status: fr.status });
                  }}
                />
                <div className="flex flex-col ">
                  <div
                    className="text-[25px]  font-bold ml-3 mt-1 "
                    value={i}
                    onClick={(e) => {
                      chatSec({ ...fr, status: fr.status });
                    }}
                  >
                    {fr.userName}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
