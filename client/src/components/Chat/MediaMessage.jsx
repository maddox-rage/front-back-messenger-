import { useStateProvider } from "@/context/StateContext";
import { HOST } from "@/utils/ApiRoutes";
import { calculateTime } from "@/utils/CalculateTime";
import React from "react";
import MessageStatus from "../common/MessageStatus";
import { FiTrash } from "react-icons/fi"; 
import axios from "axios";
import { DELETE_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import { reducerCases } from "@/context/constants";
import { FaFileVideo, FaFileAudio, FaFile } from "react-icons/fa"; 

function MediaMessage({ message }) {
  const [{ currentChatUser, userInfo, socket }, dispatch] = useStateProvider();

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
  const fileExtension = getFileExtension(message.message);
  const fileName = message.message.split('/').pop();
  const fileUrl = `${HOST}/${message.message}`;

  return (
    <div className={`p-2 rounded-lg ${isOutgoing ? "bg-outgoing-background" : "bg-incoming-background"} my-2`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <MediaIcon fileExtension={fileExtension} />
          <span className="text-bubble-meta text-[11px] pt-1 min-w-fit text-black ml-2">
            {fileName} 
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-bubble-meta text-[11px] pt-1 min-w-fit mr-2">
            {calculateTime(message.createdAt)}
          </span>
          {isOutgoing && (
            <>
              <MessageStatus messageStatusId={message.messageStatusId} />
            </>
          )}
        </div>
      </div>
      <div className="mt-2">
      {fileExtension === 'mp4' || fileExtension === 'mov' || fileExtension === 'avi'? (
        <video controls className="w-full max-w-lg min-w-[200px] max-h-[500px] min-h-[200px]">
          <source src={fileUrl} type={`video/${fileExtension}`} />
          Your browser does not support the video tag.
        </video>
      ) : fileExtension === 'mp3' || fileExtension === 'wav'? (
        <audio controls className="w-full">
          <source src={fileUrl} type={`audio/${fileExtension}`} />
          Your browser does not support the audio element.
        </audio>
      ) : fileExtension === 'mov' || fileExtension === 'avi'? (
        <video controls className="w-full max-w-lg min-w-[200px] max-h-[500px] min-h-[200px]">
          <source src={fileUrl} type={`video/${fileExtension}`} />
          Your browser does not support the video tag.
        </video>
      ) : (
        <a href={fileUrl} download={fileName} className="text-blue-500">
          Download File
        </a>
      )}
      </div>
    </div>
  );
}

const getFileExtension = (fileName) => {
  return fileName.split('.').pop().toLowerCase();
};

const MediaIcon = ({ fileExtension }) => {
  switch (fileExtension) {
    case 'mp4':
    case 'mov':
    case 'avi':
      return <FaFileVideo className="text-xl" />; 
    case 'mp3':
    case 'wav':
      return <FaFileAudio className="text-xl" />; 
    default:
      return <FaFile className="text-xl" />; 
  }
};

export default MediaMessage;
