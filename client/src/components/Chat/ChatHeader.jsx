import React, { useState } from "react";
import Avatar from "../common/Avatar";
import { BsThreeDotsVertical } from "react-icons/bs";
import { BiSearchAlt2 } from "react-icons/bi";
import { MdCall } from "react-icons/md";
import { IoVideocam } from "react-icons/io5";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import ContextMenu from "../common/ContextMenu";
import {DELETE_ALL_MESSAGE} from "@/utils/ApiRoutes"
import axios from "axios";
import ReportWindow from "../common/ReportWindow"
import CurrentChatUserProfile from "../common/CurrentChatUserProfile"

export default function ChatHeader() {
  const [{ userInfo, currentChatUser, onlineUsers, socket}, dispatch] =useStateProvider();

  const [contextMenuCordinates, setContextMenuCordinates] = useState({
    x: 0,
    y: 0,
  });
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [isCurrentUserProfile, setIsCurrentUserProfile] = useState(false);

  const showContextMenu = (e) => {
    e.preventDefault();
    setContextMenuCordinates({ x: e.pageX - 50, y: e.pageY + 20 });
    setIsContextMenuVisible(true);
  };

  const showReportWindow = () => {
    setIsReportWindow(true);
  };

  const closeReportWindow = () => {
    setIsReportWindow(false);
  };

  const showCurrentUserProfile = () => {
    setIsCurrentUserProfile(true);
  };
  
  const closeShowCurrentUserProfile = () => {
    setIsCurrentUserProfile(false);
  };

  const [isReportWindow, setIsReportWindow] = useState(false);

  const contextMenuOptions = [
    {
      name: "Профиль пользователя",
      callBack: async () => {
        setIsContextMenuVisible(false);
        showCurrentUserProfile()
      },
    },
   
    {
      name: "Удалить диалог",
      callBack: async () => {
        setIsContextMenuVisible(false);
        try {
          const { data } = await axios.post(DELETE_ALL_MESSAGE, {
            to: currentChatUser.id,
            from: userInfo.id,
          });
          // socket.current.emit("send-msg", {
          //   to: currentChatUser.id,
          //   from: userInfo.id,
          //   message: data.message,
          // });
          // dispatch({
          //   type: reducerCases.ADD_MESSAGE,
          //   newMessage: {
          //     ...data.message,
          //   },
          //   fromSelf: true,
          // });
          dispatch({ type: reducerCases.SET_EXIT_CHAT });
        } catch (err) {
          console.log(err);
        }
      },
    },
    {
      name: "Удалить и заблокировать пользователя",
      callBack: async () => {
        setIsContextMenuVisible(false);
        try {
          const { data } = await axios.post(DELETE_ALL_MESSAGE, {
            to: currentChatUser.id,
            from: userInfo.id,
            isBlock:true,
            blocker: userInfo.id,
            blocked:currentChatUser.id
          });
          // socket.current.emit("send-msg", {
          //   to: currentChatUser.id,
          //   from: userInfo.id,
          //   message: data.message,
          // });
          // dispatch({
          //   type: reducerCases.ADD_MESSAGE,
          //   newMessage: {
          //     ...data.message,
          //   },
          //   fromSelf: true,
          // });
          dispatch({ type: reducerCases.SET_EXIT_CHAT });
        } catch (err) {
          console.log(err);
        }
      },
    },
    {
      name: "Пожаловаться",
      callBack: async () => {
        setIsContextMenuVisible(false);
        showReportWindow()
      },
    },
    {
      name: "Выход",
      callBack: async () => {
        setIsContextMenuVisible(false);
        dispatch({ type: reducerCases.SET_EXIT_CHAT });
      },
    },
  ];

  const sendMessage = async () => {
    try {
      setMessage("");
      const { data } = await axios.post(ADD_MESSAGE_ROUTE, {
        to: currentChatUser.id,
        from: userInfo.id,
        message,
      });
      socket.current.emit("send-msg", {
        to: currentChatUser.id,
        from: userInfo.id,
        message: data.message,
      });
      dispatch({
        type: reducerCases.ADD_MESSAGE,
        newMessage: {
          ...data.message,
        },
        fromSelf: true,
      });
    } catch (err) {
      console.log(err);
    }
  };


  const handleVideoCall = () => {
    dispatch({
      type: reducerCases.SET_VIDEO_CALL,
      videoCall: {
        ...currentChatUser,
        type: "out-going",
        callType: "video",
        roomId: Date.now(),
      },
    });
  };

  const handleVoiceCall = () => {
    dispatch({
      type: reducerCases.SET_VOICE_CALL,
      voiceCall: {
        ...currentChatUser,
        type: "out-going",
        callType: "audio",
        roomId: Date.now(),
      },
    });
    
  };

  return (
    <div className="h-16 px-4 py-3 flex justify-between items-center bg-panel-header-background z-10">
      <div className="flex items-center justify-center gap-6">
        <Avatar type="sm" image={currentChatUser?.profilePicture} />
        <div className="flex flex-col">
          <span className="text-primary-strong">{currentChatUser?.name}</span>
          <span className="text-secondary text-sm">
            {onlineUsers.includes(currentChatUser.id) ? "Онлайн" : "Оффлайн"}
          </span>
        </div>
      </div>
      <div className="flex gap-6">
        
        <MdCall
          className="text-panel-header-icon cursor-pointer text-xl"
          onClick={handleVoiceCall}
        />
        <IoVideocam
          className="text-panel-header-icon cursor-pointer text-xl"
          onClick={handleVideoCall}
        />
         <BsThreeDotsVertical
          className="text-panel-header-icon cursor-pointer text-xl"
          onClick={(e) => showContextMenu(e)}
          id="context-opener"
        />
        <BiSearchAlt2
          className="text-panel-header-icon cursor-pointer text-xl"
          onClick={() => dispatch({ type: reducerCases.SET_MESSAGES_SEARCH })}
        />
       
        {isContextMenuVisible && (
          <ContextMenu
            options={contextMenuOptions}
            cordinates={contextMenuCordinates}
            contextMenu={isContextMenuVisible}
            setContextMenu={setIsContextMenuVisible}
          />
        )}
        {isReportWindow && <ReportWindow userInfo={userInfo}  currentChatUser={currentChatUser} onClose={closeReportWindow} />}
        {isCurrentUserProfile && <CurrentChatUserProfile currentChatUser ={currentChatUser} onClose={closeShowCurrentUserProfile} />}
      </div>
    </div>
  );
}
