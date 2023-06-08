import React, { useEffect } from "react";
import RequestUser from "./RequestUser";
import {
  useMsgesStore,
  useSelectedStore,
  useUserStore,
} from "../Stores/MainStore";
import { shallow } from "zustand/shallow";

export default function RequestScreen({ }) {
  let me = useUserStore((state) => state.user);
  let requests = me.requests;
  let setter = useUserStore((state) => state.updateUserState);
  const chatSec = useSelectedStore((state) => state.updateSelectedState);
  let msges = useMsgesStore((state) => state.msges);
  const setMsg = useMsgesStore((state) => state.updateMsgesState);
  useEffect(() => {
    console.log(requests);
  });

  return (
    <div className="w-full h-full bg-[#F9FBFC] dark:bg-[#121316] flex flex-wrap">
      <div className="flex flex-col  w-[30%] h-full">
        <div className="flex w-full h-[10%] flex-wrap justify-evenly content-center">
          <i className="fa-solid fa-arrow-left text-[20px] relative top-[10%]  dark:text-white"></i>
          <div className="dark:text-white font-bold text-[26px]">
            Message Request
            <span className="ml-3 text-[16px] bg-[#4D96DA] rounded-full pl-1 pr-1 ">
              3
            </span>
          </div>
        </div>
        <div className="w-full h-[90%] max-h-[90%] overflow-scroll mt-5 flex flex-col ">
          {requests.map((req) => {
            return (
              <div className="w-[85%] h-[10%] mb-8 relative left-[10%]">
                <RequestUser
                  me={me}
                  user={req}
                  setter={setter}
                  chatSec={chatSec}
                  msgSetter={setMsg}
                  msges={msges}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="w-[70%] h-full flex flex-wrap justify-center content-center flex-col bg-white dark:bg-[#16171B]">
        <div className="dark:text-white text-[18px] font-bold relative left-[3%] ">
          Hello, I'm the Message Request Space!{" "}
        </div>
        <div className="max-w-[40%] text-center text-[14px] tracking-tight dark:text-[#909090] text-[#909090]">
          With me, you have all your message requests presented in an organized
          manner, making communication between you and your contacts easier!
        </div>
      </div>
    </div>
  );
}
