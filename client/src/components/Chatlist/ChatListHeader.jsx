import React, { useState } from "react";
import Avatar from "../common/Avatar";
import { BsFillChatLeftTextFill, BsThreeDotsVertical } from "react-icons/bs";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { useRouter } from "next/router";
import ContextMenu from "../common/ContextMenu";
import UserProfile from "../common/UserProfile";
import { GrUserAdmin } from "react-icons/gr";
import Admin from "../common/Admin"

export default function ChatListHeader() {
  const [{ userInfo }, dispatch] = useStateProvider();
  const router = useRouter();
  const [contextMenuCordinates, setContextMenuCordinates] = useState({
    x: 0,
    y: 0,
  });
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);

  const showContextMenu = (e) => {
    e.preventDefault();
    setContextMenuCordinates({ x: e.pageX, y: e.pageY });
    setIsContextMenuVisible(true);
  };

  const showUserProfile = () => {
    setIsUserProfileVisible(true); 
  };
  const closeUserProfile = () => {
    setIsUserProfileVisible(false); 
  };
  const showAdmin = () => {
    setIsAdminVisible(true); 
  };
  const closeAdmin = () => {
    setIsAdminVisible(false);
  };

  const [isUserProfileVisible, setIsUserProfileVisible] = useState(false);
  const [isAdminVisible, setIsAdminVisible] = useState(false); 

  const contextMenuOptions = [
    {
      name: "Профиль",
      callBack: async () => {
        setIsContextMenuVisible(false);
        showUserProfile()
      },
    },
    {
      name: "Разлогиниться",
      callBack: async () => {
        setIsContextMenuVisible(false);
        router.push("/logout");
      },
    },
  ];

  const handleAllContactsPage = () => {
    dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE });
  };

  return (
    <div className="h-16 px-4 py-3 flex justify-between items-center">
      <div className="cursor-pointer">
        <Avatar type="sm" image={userInfo?.profileImage} />
      </div>
      <div className="flex gap-6 ">
      { userInfo?.role===2 && (<GrUserAdmin
        className="text-panel-header-icon cursor-pointer text-xl"
        onClick={showAdmin}
      />)}
        <BsFillChatLeftTextFill
          className="text-panel-header-icon cursor-pointer text-xl"
          title="Новый чат"
          onClick={handleAllContactsPage}
        />
     
        <>
          <BsThreeDotsVertical
            className="text-panel-header-icon cursor-pointer text-xl"
            title="Меню"
            onClick={(e) => showContextMenu(e)}
            id="context-opener"
          />
          {isContextMenuVisible && (
            <ContextMenu
              options={contextMenuOptions}
              cordinates={contextMenuCordinates}
              contextMenu={isContextMenuVisible}
              setContextMenu={setIsContextMenuVisible}
            />
          )}
        </>
      </div>
      {isUserProfileVisible && <UserProfile userInfo={userInfo} onClose={closeUserProfile} />}
      {isAdminVisible && <Admin userInfo={userInfo} onClose={closeAdmin} />}
    </div>
  );
}
