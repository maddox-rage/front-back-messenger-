import { useStateProvider } from "@/context/StateContext";
import { HOST } from "@/utils/ApiRoutes";
import { calculateTime } from "@/utils/CalculateTime";
import React from "react";
import MessageStatus from "../common/MessageStatus";
import axios from "axios";
import { DELETE_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import { reducerCases } from "@/context/constants";
import { BsFileEarmarkText, BsFileEarmarkSpreadsheet, BsFileEarmarkPresentation, BsFileEarmarkPdf } from "react-icons/bs"; 

function DocumentMessage({ message }) {
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

  return (
    <div className={`p-1 rounded-lg ${
      message.senderId === currentChatUser.id
        ? "bg-incoming-background"
        : "bg-outgoing-background"
    } flex items-center`}>
        <div className="flex items-center">
          <DocumentIcon fileExtension={getFileExtension(message.message)} />
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
        {message.senderId === userInfo.id && (
          <div className="flex items-center">
            <MessageStatus messageStatusId={message.messageStatusId} />
          
          </div>
        )}
      </div>
    </div>
  );
}

const getFileExtension = (fileName) => {
  return fileName.split('.').pop().toLowerCase();
};

const DocumentIcon = ({ fileExtension }) => {
  switch (fileExtension) {
    // case 'doc':
    // case 'docx':
    //   return <BsFileEarmarkText />; 
    // case 'xls':
    //   return <BsFileEarmarkPresentation />;
    // case 'xlsx':
    //   return <BsFileEarmarkPresentation />;
    // case 'pdf':
    //   return <BsFileEarmarkPdf />; 
    default:
      return <div>Document</div>; 
  }
};

export default DocumentMessage;
