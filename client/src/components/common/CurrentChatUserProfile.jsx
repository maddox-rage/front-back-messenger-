import React, {useState} from "react";
import Avatar from "./Avatar";
import axios from "axios";
import { UNBLOCK_USER } from "@/utils/ApiRoutes";

const CurrentChatUserProfile = ({ currentChatUser, onClose}) => {

  console.log(currentChatUser)
  return (
    <div className="fixed top-0 left-0 w-full h-full flex  justify-center items-center bg-black bg-opacity-50"  onClick={onClose}>
      <div className="bg-panel-header-background rounded-lg p-8 shadow-md text-white"  onClick={(e) => e.stopPropagation()}>
          <div>
            <Avatar type="sm" image={currentChatUser?.profilePicture} />
            <p>Имя: {currentChatUser.name}</p>
            <p>Электронная почта: {currentChatUser.email}</p>
            <p>О себе: {currentChatUser.about}</p>
          </div>
      </div>
    </div>
  );
};

export default CurrentChatUserProfile;
