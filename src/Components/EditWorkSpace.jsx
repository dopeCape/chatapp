import React, { useEffect, useRef, useState } from 'react';

import axios from 'axios';

import Spinner from '../Spin-1s-200px.svg';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useGroupChatStore, useUserStore, useWorkSpaceStore } from '../Stores/MainStore';
import { instance } from '../axios';

export default function EditWorkSpace({ close }) {
  const fileRef = useRef();
  let workspace = useWorkSpaceStore(state => state.workspace);
  const [fileName, setFileName] = useState(null);
  const [url, setData] = useState(workspace.profilePic);
  const [name, setName] = useState(workspace.name);
  const [uploading, setUploading] = useState();
  const [dis, setDis] = useState(workspace.description);
  const [sending, setSending] = useState(false);
  const [topic, setTopic] = useState(workspace.topic);
  const [error, setError] = useState(null);
  const accessToken = localStorage.getItem('token');

  const handelSave = async () => {
    try {
      if (url.length !== 0 && name.length !== 0 && dis.length !== 0 && topic.length !== 0) {
        if (
          url !== workspace.profilePic ||
          name !== workspace.name ||
          dis !== workspace.description ||
          topic !== workspace.topic
        ) {
          if (url !== workspace.profilePic) {
            await axios.delete(workspace.profilePic);
          }
          setSending(true);
          await instance.post(
            '/workspace/update',
            {
              profilePic: url,
              name,
              description: dis,
              topic,
              id: workspace.id
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          );
          setError(null);
          setTimeout(() => {
            close();
          }, 1000);
        } else {
          setError('*Noting was changed');
        }
      } else {
        setError('*Fields Cannot be empty');
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleProfileUpload = async e => {
    try {
      if (e.target.files) {
        if (e.target.files[0].size < 5000000) {
          if (url.length !== 0) {
            let file = e.target.files[0];
            let fileExt = file.name;
            const storage = getStorage();
            const storageRef = ref(storage, 'files/' + fileExt);
            setUploading(true);
            uploadBytes(storageRef, file).then(snapshot => {
              getDownloadURL(snapshot.ref).then(async ur => {
                setData(ur);
                setFileName(fileExt);
                setUploading(false);
              });
            });
          } else {
            let file = e.target.files[0];
            let fileExt = file.name;
            const storage = getStorage();
            const storageRef = ref(storage, 'files/' + fileExt);

            setUploading(true);
            uploadBytes(storageRef, file).then(snapshot => {
              getDownloadURL(snapshot.ref).then(async ur => {
                setData(ur);

                setFileName(fileExt);

                setUploading(false);
              });
            });
          }
        } else {
          setFileName('Image should be less than 5mb');
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="w-full h-full bg-[#37393F] rounded-[5px] flex flex-col">
      <div className="flex flex-col w-full h-full ">
        <div className="text-white font-[700] ml-8 mt-8 text-[18px]">Workspace name</div>
        <input
          className="bg-[#40434B] p-4 text-white rounded-[5px]  w-[60%] mt-4 ml-8 outline-none"
          placeholder="ex: AMX Consulting"
          value={name}
          onChange={e => {
            if (e.target.value.length < 15) {
              setName(e.target.value);
            } else {
              setName(e.target.value.slice(0, 15));
            }
          }}
        />

        <div className="absolute top-[25%]  text-white left-[59%] ">{name.length}/15</div>
        <div className="text-white font-[700] ml-8 mt-8 text-[18px]">Topic</div>
        <input
          className="bg-[#40434B] p-4 text-white rounded-[5px]  w-[60%] mt-4 ml-8 outline-none"
          placeholder="ex: AMX Consulting Team Collaboration"
          value={topic}
          onChange={e => {
            if (e.target.value.length < 40) {
              setTopic(e.target.value);
            } else {
              setTopic(e.target.value.slice(0, 40));
            }
          }}
        />
        <div className="absolute top-[49%]  text-white left-[59%] ">{topic.length}/40</div>
        <div className="text-white font-[700] ml-8 mt-12 text-[18px]">Description</div>
        <textarea
          className="bg-[#40434B] p-4 text-white rounded-[5px]  w-[90%] mt-5 ml-8 resize-none outline-none"
          placeholder="ex: To recap daily task, event, or any collaborations."
          value={dis}
          onChange={e => {
            if (e.target.value.length < 80) {
              setDis(e.target.value);
            } else {
              setDis(e.target.value.slice(0, 80));
            }
          }}
        />

        <div className="absolute top-[80%]  text-white right-[6%] ">{dis.length}/80</div>
        <div className="absolute flex flex-col right-[5%] top-[8%]">
          <div className="text-white font-[700]  text-[18px] mb-2">Profile photo</div>
          <div className="bg-[#585B66] w-[190px] h-[190px] rounded-[5px] flex flex-warp justify-center content-center">
            <img alt="Workspace" src={url} className="object-cover" />
          </div>
          <button
            className="rounded-[5px] bg-[#585B66] px-3 text-[18px] text-white font-[700] py-2 mt-3 flex flex-wrap justify-center content-center outline-none"
            onClick={() => {
              fileRef.current.click();
            }}
          >
            {uploading ? <img className="h-[25px] w-[40px] " alt="loading.." src={Spinner} /> : 'Upload Photo'}
          </button>
          <input type="file" ref={fileRef} className="hidden" onChange={handleProfileUpload} />
          <div className="text-[#F8F8F8] text-[12px]  mt-3 text-center">
            {fileName ? <div className="text-red-400">{fileName.split('.')[0]}</div> : 'We recommend 1:1 Ratio'}
          </div>
        </div>
        <div className="absolute bottom-[5%] ml-6 text-red-400">{error}</div>
      </div>
      <button
        className="bg-transparent w-[100px] border-[2px] border-[#4D96DA] rounded-[5px] absolute bottom-[5%] right-[23%] py-2  text-white outline-none"
        onClick={async () => {
          if (url !== workspace.profilePic) {
            await axios.delete(url);
          }
          close();
        }}
      >
        Cancel
      </button>

      <button
        className=" w-[100px]  bg-[#4D96DA] rounded-[5px] absolute bottom-[5%] right-[5%] py-2  text-white outline-none border-[1px] border-transparent "
        onClick={() => {
          if (!sending) {
            handelSave();
          }
        }}
        disabled={sending}
      >
        {sending ? (
          <div
            class="inline-block h-5 w-5 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          >
            <span class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
        ) : (
          'Save'
        )}
      </button>
    </div>
  );
}
