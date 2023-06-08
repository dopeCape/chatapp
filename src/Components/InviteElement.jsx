import React, { useEffect, useState } from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

import Loadingbar from "../Ellipsis-1.3s-200px(1).svg";
import { instance } from "../axios";
export default function InviteElement({ user, workSpaceId }) {
  const [role, setRole] = useState(null);
  const [send, setSend] = useState(null);

  const handleChangeRole = (e) => {
    setRole(e.target.value);
  };
  useEffect(() => {
    console.log(user);
  }, []);
  let accessToken = localStorage.getItem("token");
  const handleAddUser = async () => {
    try {
      setSend("sending");
      let res = await instance.post(
        "/user/invite",
        {
          chatWorkSpaceId: user.chatWorkSpaceId,
          name: user.name,
          email: user.email,
          user_: user,
          workSpaceId: workSpaceId,
        },

        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setSend("sent");
      user.status = "sent";
    } catch (error) {
      setSend(null);
      console.log(error);
    }
  };
  return (
    <div className="h-full w-full dark:bg-[#16171B] rounded-md shadow-md  flex ">
      <img alt={user.name} src={user.profilePic} />
      <div className="flex flex-col dark:text-white ml-4 mt-2 w-[30%]">
        <div>{user.name}</div>
        <div className="text-[14px]">
          {user.status == "x" ? "Not a Member" : user.status}
        </div>
      </div>

      {user.status === "x" ? (
        <button
          className="bg-[#EFEFEF] dark:bg-[#22252F] w-[30%] rounded-md outline-none dark:text-white h-[50%] mt-3 ml-3"
          onClick={handleAddUser}
          disabled={send != "sent" ? false : true}
        >
          {send == null ? (
            "Add"
          ) : send === "sent" ? (
            "sent"
          ) : (
            <img src={Loadingbar} />
          )}
        </button>
      ) : null}
    </div>
  );
}
