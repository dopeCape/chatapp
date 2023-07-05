import React, { useState } from 'react';

import { useWorkSpaceStore, useUserStore } from '../Stores/MainStore';
import styled from '@emotion/styled';
import Popup from 'reactjs-popup';
import InviteToWorkcpace from './InviteToWorkcpacePopup';
import EditWorkSpace from './EditWorkSpace';
import NewGroup from './NewGroup';
import History from './History';
export default function WorkSpaceMenu() {
  const me = useUserStore(state => state.user);
  const workspace = useWorkSpaceStore(state => state.workspace);
  const [editWorkspaceOpen, setEditWorkspaceOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [addUserToWorkspaceOpen, setAddUserToWorkspaceOpen] = useState(false);

  const [createChannelOpen, SetCreateChannelOpen] = useState(false);
  const EditWorkspcePopup = styled(Popup)`
    &-content {
      border: none;
      height: 532px;
      padding: 0;
      width: 721px;
      border-radius: 10px;
    }
  `;
  const AddUserToWorkspacePopup = styled(Popup)`
    &-content {
      border: none;
      height: 480px;
      padding: 0;
      width: 730px;
      border-radius: 10px;
    }
  `;
  const CreateChannelPopup = styled(Popup)`
    &-content {
      border: none;
      height: 350px;
      padding: 0;
      width: 600px;
      border-radius: 10px;
    }
  `;

  return (
    <div className="w-full h-full  bg-[#37393F]  flex flex-col text-white  rounded-[10px] ">
      <div className="  flex w-[90%] ml-8 mt-8">
        <img alt="W" src={workspace.profilePic} className="w-[50px] h-[50px] object-fill rounded-[5px]" />
        <div className="ml-6 text-[20px] font-[700]"> {workspace.name}</div>
      </div>
      <div className="w-[80%]  h-0 border-[1px] border-[#616061] ml-8  mt-5  "></div>
      <div
        className="  pl-8   cursor-pointer hover:bg-[#4D96DA]  py-3 mt-1  "
        onClick={() => {
          setAddUserToWorkspaceOpen(true);
        }}
      >
        Invite people to {workspace.name}
      </div>
      <AddUserToWorkspacePopup
        modal
        open={addUserToWorkspaceOpen}
        onClose={() => {
          setAddUserToWorkspaceOpen(false);
        }}
        position="center center"
        closeOnDocumentClick={false}
        closeOnEscape={false}
      >
        {close => <InviteToWorkcpace close={close} />}
      </AddUserToWorkspacePopup>
      <div
        className=" py-3 pl-8   cursor-pointer hover:bg-[#4D96DA]"
        onClick={() => {
          SetCreateChannelOpen(true);
        }}
      >
        Create Channel
      </div>

      <CreateChannelPopup
        open={createChannelOpen}
        onClose={() => {
          SetCreateChannelOpen(false);
        }}
        modal
        position="center center"
        closeOnEscape={false}
        closeOnDocumentClick={false}
      >
        {close => <NewGroup close={close} type={'Channel'} />}
      </CreateChannelPopup>
      <div
        className=" py-3 pl-8   cursor-pointer hover:bg-[#4D96DA]"
        onClick={() => {
          setHistoryOpen(!historyOpen);
        }}
      >
        History
      </div>
      {historyOpen ? (
        <div className="absolute h-[380px] w-[350px] left-[100%] top-[55%]">
          <History workspaceId={workspace.id} />
        </div>
      ) : null}
      <EditWorkspcePopup
        open={editWorkspaceOpen}
        onClose={() => {
          setEditWorkspaceOpen(false);
        }}
        modal
        position="center center"
        closeOnEscape={false}
        closeOnDocumentClick={false}
      >
        {close => <EditWorkSpace close={close} />}
      </EditWorkspcePopup>

      {me.admin ? (
        <div
          className=" py-3 pl-8   cursor-pointer hover:bg-[#4D96DA]"
          onClick={() => {
            setEditWorkspaceOpen(true);
          }}
        >
          Edit Workspace Profile
        </div>
      ) : null}

      <div className="w-[80%]  h-0 border-[1px] border-[#616061] ml-8  mt-auto "></div>
      <div className="ml-8 mb-8 mt-5 text-[#DA4D4D] cursor-pointer">Sign out of {workspace.name}</div>
    </div>
  );
}
