import React from "react";

export default function SideBar({ user }) {
  return (
    <div className="w-full h-full flex flex-col felx-wrap">
      <div className="w-full h-full flex felx-wrap justify-end content-center ">
        <img
          alt={user.userName}
          src={user.profilePic}
          className="rounded-full"
        />
      </div>
    </div>
  );
}
