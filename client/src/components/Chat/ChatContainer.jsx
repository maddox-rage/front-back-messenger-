import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { calculateTime } from "@/utils/CalculateTime";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import ImageMessage from "./ImageMessage";
import DocumentMessage from "./DocumentMessage";
import MediaMessage from "./MediaMessage";
import ArchiveMessage from "./ArchiveMessage";
import ContextMenu from "../common/ContextMenu";
import { DELETE_MESSAGE_ROUTE, DELETE_MESSAGE_BY_RECIEVER } from "@/utils/ApiRoutes"; // Add edit message route
import MessageStatus from "../common/MessageStatus";

const VoiceMessage = dynamic(() => import("@/components/Chat/VoiceMessage"), {
  ssr: false,
});

export default function ChatContainer() {
  const [{ messages, currentChatUser, userInfo, socket }, dispatch] = useStateProvider();
  const containerRef = useRef(null);

  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    const container = containerRef.current;
    const lastMessage = container.lastElementChild?.lastElementChild?.lastElementChild?.lastElementChild;

    if (lastMessage) {
      lastMessage.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const deleteMessage = async (messageId) => {
    try {
      const { data } = await axios.delete(`${DELETE_MESSAGE_ROUTE}/${messageId}`);
      socket.current.emit("delete-msg", {
        message: data.message,
        to: currentChatUser.id,
        from: userInfo.id,
      });
      dispatch({
        type: reducerCases.DELETE_MESSAGE,
        messageId,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const deleteMessageByReciever = async (messageId) => {
    try {
      const { data } = await axios.post(`${DELETE_MESSAGE_BY_RECIEVER}/${messageId}`);
      dispatch({
        type: reducerCases.DELETE_MESSAGE,
        messageId,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleRightClick = (e, messageId, messageText) => {
    e.preventDefault();
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      messageId,
      messageText,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  useEffect(() => {
    if (contextMenu) {
      document.addEventListener("click", handleCloseContextMenu);
    } else {
      document.removeEventListener("click", handleCloseContextMenu);
    }

    return () => {
      document.removeEventListener("click", handleCloseContextMenu);
    };
  }, [contextMenu]);

  const contextMenuOptions = [
    {
      name: "Удалить сообщение у всех",
      callBack: () => {
        deleteMessage(contextMenu.messageId);
        handleCloseContextMenu();
      },
    },
    {
      name: "Удалить сообщение только у меня",
      callBack: () => {
        deleteMessageByReciever(contextMenu.messageId);
        handleCloseContextMenu();
      },
    },
  ];

  return (
    <div
      className="h-[80vh] w-full relative flex-grow overflow-auto custom-scrollbar"
      ref={containerRef}
    >
      <div className="bg-chat-background bg-fixed h-full w-full opacity-5 fixed left-0 top-0 z-0"></div>
      <div className="mx-10 my-6 relative bottom-0 left-0">
        <div className="flex w-full">
          <div className="flex flex-col justify-end w-full gap-1 overflow-auto">
            {messages
              .filter(message => 
                !message.deleteByReciever || message.senderId !== userInfo.id
              )
              .map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.senderId === currentChatUser.id ? "justify-start" : "justify-end"
                  }`}
                  onContextMenu={(e) => message.senderId === userInfo.id && handleRightClick(e, message.id, message.message)}
                >
                  {message.messageTypeId === 1 && (
                    <div
                      className={`text-white px-2 py-[5px] text-sm rounded-md flex gap-2 items-end max-w-[45%] ${
                        message.senderId === currentChatUser.id
                          ? "bg-incoming-background"
                          : "bg-outgoing-background"
                      }`}
                    >
                      <span className="break-all">{message.message}</span>
                      <div className="flex gap-1 items-end">
                        <span className="text-bubble-meta text-[11px] pt-1 min-w-fit">
                          {calculateTime(message.createdAt)}
                        </span>
                        <span>
                          {message.senderId === userInfo.id && (
                            <MessageStatus messageStatusId={message.messageStatusId} />
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                  {message.messageTypeId === 4 && <DocumentMessage message={message} />}
                  {message.messageTypeId === 5 && <MediaMessage message={message} />}
                  {message.messageTypeId === 6 && <ArchiveMessage message={message} />}
                  {message.messageTypeId === 2 && <ImageMessage message={message} />}
                  {message.messageTypeId === 3 && <VoiceMessage message={message} />}
                </div>
              ))}
          </div>
        </div>
      </div>
      {contextMenu && (
        <ContextMenu
          options={contextMenuOptions}
          cordinates={{ x: contextMenu.x, y: contextMenu.y }}
          contextMenu={contextMenu}
          setContextMenu={setContextMenu}
        />
      )}
    </div>
  );
}
