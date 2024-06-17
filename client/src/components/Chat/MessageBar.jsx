import React, { useEffect, useRef, useState } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { ImAttachment } from "react-icons/im";
import { FaMicrophone } from "react-icons/fa";
import { MdSend } from "react-icons/md";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import axios from "axios";
import { ADD_IMAGE_MESSAGE_ROUTE, ADD_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import EmojiPicker from "emoji-picker-react";
import dynamic from "next/dynamic";
import PhotoPicker from "../common/PhotoPicker";

const CaptureAudio = dynamic(() => import("@/components/common/CaptureAudio"), {
  ssr: false,
});

export default function MessageBar() {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [grabImage, setGrabImage] = useState(false);

  const photoPickerOnChange = async (e) => {
    const file = e.target.files[0];
    await handleImageUpload(file);
  };

  const handleImageUpload = async (file) => {
    const getFileType = (fileName) => {
      const extension = fileName.split('.').pop().toLowerCase();
      const imageExtensions = ['jpg', 'jpeg', 'png','bmp', 'gif'];
      const officeExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf'];
      const multimediaExtensions = ['mp4', 'mov', 'avi', 'mp3', 'wav'];
      const archiveExtensions = ['zip', 'rar', '7z'];

      if (imageExtensions.includes(extension)) {
          return 'image';
      } else if (officeExtensions.includes(extension)) {
          return 'office';
      } else if (multimediaExtensions.includes(extension)) {
          return 'multimedia';
      } else if (archiveExtensions.includes(extension)) {
          return 'archive';
      } else {
          alert("Пока не обрабатываем такой тип файлов")
          return 'unknown';
      }
    };
    const fileType = getFileType(file.name);
    console.log(fileType)
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await axios.post(ADD_IMAGE_MESSAGE_ROUTE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          from: userInfo.id,
          to: currentChatUser.id,
          fileType: fileType
        },
      });
      if (response.status === 201) {
        socket.current.emit("send-msg", {
          to: currentChatUser.id,
          from: userInfo.id,
          message: response.data.message,
        });
        dispatch({
          type: reducerCases.ADD_MESSAGE,
          newMessage: {
            ...response.data.message,
          },
          fromSelf: true,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const [{ socket, currentChatUser, userInfo }, dispatch] = useStateProvider();

  const sendMessage = async () => {
    try {
      setMessage("");
      const { data } = await axios.post(ADD_MESSAGE_ROUTE, {
        to: currentChatUser.id,
        from: userInfo.id,
        message,
      });
      console.log(data.message)
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

  const handleEmojiModal = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (emoji, event) => {
    setMessage((prevMessage) => (prevMessage += emoji.emoji));
  };

  const emojiPickerRef = useRef(null); 

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (event.target.id !== "emoji-open") {
        if (
          emojiPickerRef.current && 
          !emojiPickerRef.current.contains(event.target) 
        ) {
          setShowEmojiPicker(false); 
        }
      }
    };

    document.addEventListener("click", handleOutsideClick); 

    return () => {
      document.removeEventListener("click", handleOutsideClick); 
    };
  }, []); 

  useEffect(() => {
    setMessage("");
  }, [currentChatUser]);

  useEffect(() => {
    if (grabImage) {
      const data = document.getElementById("photo-picker");
      data.click();
      document.body.onfocus = (e) => {
        setTimeout(() => {
          setGrabImage(false);
        }, 1000);
      };
    }
  }, [grabImage]);

  useEffect(() => {
    const handlePaste = (event) => {
      const items = event.clipboardData.items;
      for (let item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          handleImageUpload(file);
        }
      }
    };

    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (message.trim() !== "") { 
        sendMessage(); 
      }
    }
  };

  const blockedUser = userInfo.blockedBy.some(user => user.blockedUserId === currentChatUser.id);
  const blockedBy = userInfo.blockedUsers.some(user => user.blockedById === currentChatUser.id);
  const isBlockedUser = currentChatUser.name === "Пользователь заблокирован";

  const isBlocked = blockedUser || blockedBy || isBlockedUser;

  return (
    <div className="bg-panel-header-background h-20 px-4 flex items-center gap-6 relative">
      {!showAudioRecorder && (
        <>
          <div className="flex gap-6">
            {!isBlocked && (
              <BsEmojiSmile
                className="text-panel-header-icon cursor-pointer text-xl"
                title="Эмодзи"
                onClick={handleEmojiModal}
                id="emoji-open"
              />
            )}
            {!isBlocked && showEmojiPicker && (
              <div
                className="absolute bottom-24 left-16 z-40"
                ref={emojiPickerRef}
              >
                <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
              </div>
            )}
            {!isBlocked && (
              <ImAttachment
                className="text-panel-header-icon cursor-pointer text-xl"
                title="Прикрепить файл"
                onClick={() => setGrabImage(true)}
              />
            )}
          </div>
          <div className="w-full rounded-lg h-10 flex items-center">
            <input
              type="text"
              placeholder={
                (blockedUser ? "Пользователь заблокирован вами" : "") ||
                (blockedBy ? "Пользователь заблокировал вас" : "") ||
                (isBlockedUser ? "Пользователь заблокирован" : "") ||
                "Напиши сообщение"
              }
              className={
                "bg-input-background text-sm focus:outline-none text-white h-10 rounded-lg pl-5 pr-5 py-4 w-full" +
                (isBlocked ? " cursor-not-allowed" : "")
              }
              value={message}
              onChange={(e) => {
                const inputValue = e.target.value;
                if (inputValue.length <= 250 && !isBlocked) {
                  setMessage(inputValue);
                }
              }}
              onKeyPress={handleKeyPress}
              disabled={isBlocked}
            />
          </div>
          <div className="w-10 flex items-center justify-center">
            {message.length ? (
              <button onClick={sendMessage} disabled={isBlocked}>
                <MdSend
                  className={`text-panel-header-icon cursor-pointer text-xl ${
                    isBlocked ? "cursor-not-allowed" : ""
                  }`}
                  title="Отправить"
                />
              </button>
            ) : (
              !isBlocked && (
                <FaMicrophone
                  className="text-panel-header-icon cursor-pointer text-xl"
                  title="Запись голосового сообщения"
                  onClick={() => setShowAudioRecorder(true)}
                />
              )
            )}
          </div>
        </>
      )}
      {showAudioRecorder && <CaptureAudio hide={setShowAudioRecorder} />}
      {grabImage && <PhotoPicker onChange={photoPickerOnChange} />}
    </div>
  );
}
