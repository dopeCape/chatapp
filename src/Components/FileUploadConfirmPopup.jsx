import React, { useEffect, useCallback, useState, useRef } from 'react';

import FloatingVideoPlayer from './FloatingVideoPlayer';
import ImgsViewer from 'react-images-viewer';

import Cross from '../ph_x-bold.svg';
import { FileIcon, defaultStyles } from 'react-file-icon';
import Upload from '../Uploading icon.svg';
import Spinner from '../Spin-1s-200px.svg';
import VideoThumbnail from './VideoThumbnal';
import axios from 'axios';
import ReactPlayer from 'react-player';
import ReactMediaViewer from 'react-media-viewer';
import { instance } from '../axios';
export default function FileUplaodConfirmPopup({
  close,
  uploadFunc,
  per,
  fileFunc,
  uplodedUrl,
  setUplodedUrl,
  perSetter
}) {
  const [url, setUrl] = useState(null);
  const [type, setType] = useState(null);
  const [uploading, setUploding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [file, setFile] = useState(null);

  let fileRef = useRef();

  const handleDragEnter = e => {
    e.preventDefault();
  };
  const handleDragLeave = e => {
    e.preventDefault();
  };
  const handleDragOver = e => {
    e.preventDefault();
  };
  const handleDrop = async e => {
    e.preventDefault();
    let files;
    if (e.target.files) {
      files = e.target.files;
    } else {
      files = e.dataTransfer.files;
    }
    if (files[0].size < 10000000) {
      const type = files[0].type;
      if (type === 'video/mp4') {
        setType('VIDEO');
      } else if (type === 'image/gif' || type === 'image/jpeg' || type === 'image/png' || type === 'image/webp') {
        setType('IMG');
      } else {
        setType('FILE');
      }
      const url_ = URL.createObjectURL(files[0]);
      setUrl(url_);
      setFile(files[0]);
      await fileFunc(files[0]);
    } else {
      alert('file sieze should be less than 10mb');
    }
  };
  const handleDelete = async () => {
    try {
      await axios.delete(uplodedUrl);
      setFile(null);
      setUplodedUrl(null);
      setUrl(null);
    } catch (error) {
      console.log(error);
    }
  };
  const handleClose = async () => {
    try {
      if (uplodedUrl) {
        setDeleting(true);
        await axios.delete(uplodedUrl);
        setDeleting(false);
        setUplodedUrl(null);
        perSetter(0);
        close(false);
      } else {
        setUplodedUrl(null);
        perSetter(0);
        close(false);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleUpload = async () => {
    try {
      setUploding(true);
      await uploadFunc(uplodedUrl, file.name, type);
      setUploding(true);
      setUplodedUrl(null);
      perSetter(0);
      close(false);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="w-full h-full text-white flex flex-col rounded-[10px] bg-[#37393F] px-5 py-4 relative z-2">
      <div className="font-[700]">Upload and Attach files </div>
      {file ? (
        <div className="h-[75px] w-[98%] max-w-[98%] overflow-hidden flex  border-[1px] border-gray-600  mt-12 rounded-[10px] p-3  ">
          {type === 'IMG' ? (
            <>
              <ImgsViewer
                isOpen={clicked}
                onClose={() => {
                  setClicked(false);
                }}
                imgs={[{ src: url }]}
              />
              <img
                className="w-[40px] h-[40px] rounded-[5px] cursor-pointer"
                alt="Loading."
                src={url}
                onClick={() => {
                  setClicked(true);
                }}
              />{' '}
            </>
          ) : type === 'VIDEO' ? (
            <>
              <div
                onClick={() => {
                  setClicked(true);
                }}
                className="cursor-pointer"
              >
                <ReactPlayer url={url} width={'40px'} height={'40px'} muted playing playIcon />
              </div>
              {clicked ? <FloatingVideoPlayer videoUrl={url} close={setClicked}></FloatingVideoPlayer> : null}
            </>
          ) : type === 'FILE' ? (
            <FileIcon extension={url.split('.')[1]} {...defaultStyles[file.name.split('.')[1]]} />
          ) : null}
          <div className="flex flex-col ml-2">
            <div className="font-[700]">{file.name}</div>
            <div className="text-[12px] text-[#B4B4B4] relative bottom-1">
              {(file.size / 1000000).toString().slice(0, 4)}MB
            </div>
            <div className="flex">
              <div className="relative bg-[#B5B5B5] w-[290px] h-[6px] rounded-[10px]">
                <div className="bg-[#4D96DA] h-full rounded-[10px]" style={{ width: `${per}%` }}></div>
              </div>
              {per !== 100 ? (
                <div className="font-[700] text-[12px] ml-2 relative bottom-2">{per}%</div>
              ) : (
                <img
                  alt="X"
                  className="w-[15px] h-[15px]  cursor-pointer relative bottom-1 ml-1  "
                  onClick={handleDelete}
                  src={Cross}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          className="w-[98%] h-[150px] border-dashed border-[1px] boreder-white rounded-[10px]  mt-6 border-spacing-[50px]  flex flex-col flex-wrap justify-center content-center bg-[#40434B] text-center relative"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <img alt="Upload" className="w-[34px] h-[45px]  relative left-[20%]" src={Upload} />
          <div className="text-[14px] mt-2 ">
            <span
              className="font-[700] underline cursor-pointer mr-1 "
              onClick={() => {
                fileRef.current.click();
              }}
            >
              Click to upload
            </span>
            or drag and drop
          </div>
          <div className="text-[12px]">Maximum file size 10 MB</div>
          <input
            className="w-full h-full absolute bottom-0 z-1 overscroll-none hidden "
            type="file"
            ref={fileRef}
            onChange={handleDrop}
          />
        </div>
      )}
      <button
        className="absolute bottom-[5%] bg-transparent border-[#4D96DA] border-[1px] rounded-[5px] w-[195px] py-2 outline-none right-[5%] flex flex-wrap justify-center content-center"
        onClick={async () => {
          if (!uploading) {
            await handleClose();
          }
        }}
      >
        {deleting ? <img className="w-[30px] h-[25px]" src={Spinner} alt="loading..." /> : 'Cancle'}
      </button>
      <button
        className="absolute bottom-[5%] bg-[#4D96DA]  rounded-[5px] w-[200px] py-2 flex flex-wrap justify-center content-center right-[50%] border-transparent border-[1px]"
        onClick={async () => {
          if (!uploading && uplodedUrl) {
            await handleUpload();
          }
        }}
        disabled={uplodedUrl ? false : true}
      >
        {uploading ? <img className="w-[30px] " src={Spinner} alt="loading..." /> : 'Attach files'}
      </button>
    </div>
  );
}
