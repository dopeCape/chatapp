import React, { useState } from 'react';
import Spinner from '../Spin-1s-200px.svg';

export default function RemoveFromWorkspace({ close, func, workspaceName }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="w-full h-full flex flex-col bg-[#37393F] text-white rounded-[10px] relative">
      <div className="ml-5 mt-8">Are You sure?</div>
      <div className="ml-5 mt-4 text-[#B4B4B4] text-[12px]">
        This action in not reversible , all the converstions with teammates in{' '}
        <span className=" font-extrabold text-[14px]  text-white mr-1">{workspaceName}</span>
        will be deleted
      </div>
      <div className="mt-5 ml-5 flex w-full flex-wrap justify-end content-center">
        <button
          className="border-[1px] border-[#4D96DA] bg-transparent rounded-[5px] w-[100px] py-1 outline-none relative right-[15%] "
          onClick={() => {
            close();
          }}
        >
          Cancle
        </button>
        <button
          className="border-[1px] border-transparent bg-[#4D96DA] rounded-[5px] w-[100px] py-1 outline-none relative right-[8%] flex flex-wrap justify-center content-center"
          onClick={async () => {
            if (!loading) {
              setLoading(true);
              await func();
              setLoading(false);
            }
          }}
        >
          {loading ? <img alt="Loading..." src={Spinner} className="w-[20px] " /> : 'Confirm'}
        </button>
      </div>
    </div>
  );
}
