import React, { useState } from "react";
import Avatar from "./Avatar";
import axios from "axios";
import { UNBLOCK_USER } from "@/utils/ApiRoutes";
import { SENT_REPORT_ON_USER } from "@/utils/ApiRoutes";

const UserProfile = ({ userInfo, onClose, currentChatUser }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [reportReason, setReportReason] = useState("");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault(); 
    try {
        const {data} = await axios.post(SENT_REPORT_ON_USER, {
            reportedBy:userInfo.id,
            reportedUser:currentChatUser.id,
            reportReason
        })
       if(data.status){
        onClose()
        console.log("done")
       }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-panel-header-background rounded-lg p-8 shadow-md text-white" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4">Отправить жалобу на пользователя {currentChatUser.name}</h2>

        <form onSubmit={handleFormSubmit} className="flex flex-col items-center gap-4">
          <input
            type="text"
            placeholder="Причина жалобы"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="bg-input-background text-sm focus:outline-none text-white h-10 rounded-lg pl-5 pr-5 py-4 w-full"
          />
          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="flex items-center justify-center bg-outgoing-background hover:bg-outgoing-hover text-white py-2 px-4 rounded-lg"
            >
              Отправить
            </button>
          </div>
        </form>
        
      </div>
    </div>
  );
};

export default UserProfile;