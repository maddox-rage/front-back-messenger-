import { useStateProvider } from "@/context/StateContext";
import { HOST } from "@/utils/ApiRoutes";
import { calculateTime } from "@/utils/CalculateTime";
import React from "react";
import MessageStatus from "../common/MessageStatus";
import axios from "axios";
import { DELETE_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import { reducerCases } from "@/context/constants";
import { FaFileArchive } from "react-icons/fa"; 

function ArchiveMessage({ message }) {
  const [{ currentChatUser, userInfo, socket}, dispatch] = useStateProvider();

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

  const isOutgoing = message.senderId === userInfo.id;

  return (
    <div className={`p-1 rounded-lg ${isOutgoing ? "bg-outgoing-background" : "bg-incoming-background"} flex items-center justify-between`}>
      <div className="flex items-center">
        <FileIcon fileExtension={getFileExtension(message.message)} />
        <a
          href={`${HOST}/${message.message}`}
          download
          className="text-bubble-meta text-[11px] pt-1 min-w-fit text-blue-500 ml-2 underline"
        >
          {message.message.split('/').pop()} 
        </a>
      </div>
      <div className="flex items-center">
        <span className="text-bubble-meta text-[11px] pt-1 min-w-fit text-black ml-2">
          {calculateTime(message.createdAt)}
        </span>
        {isOutgoing && (
          <>
            <MessageStatus messageStatusId={message.messageStatusId} />
          </>
        )}
      </div>
    </div>
  );
}


const getFileExtension = (fileName) => {
  return fileName.split('.').pop().toLowerCase();
};


const FileIcon = ({ fileExtension }) => {
  switch (fileExtension) {
    case 'zip':
      return <FaFileArchive className="text-gray-500" size={20} />; 
    case 'rar':
      return <FaFileArchive className="text-gray-500" size={20} />; 
    case '7z':
      return <FaFileArchive className="text-gray-500" size={20} />; 
    default:
      return <FaFileArchive className="text-gray-500" size={20} />; 
  }
};

export default ArchiveMessage;
