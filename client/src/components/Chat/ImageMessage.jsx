import { useStateProvider } from "@/context/StateContext";
import { HOST } from "@/utils/ApiRoutes";
import { calculateTime } from "@/utils/CalculateTime";
import React, { useRef, useEffect, useState } from "react";
import MessageStatus from "../common/MessageStatus";
import axios from "axios";
import { DELETE_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import Compressor from "compressorjs";
import { createPortal } from "react-dom";

function ImageMessage({ message }) {
  const [{ currentChatUser, userInfo, socket }, dispatch] = useStateProvider();
  const [compressedImage, setCompressedImage] = useState(null);
  const [isGif, setIsGif] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const compressImage = () => {
      const imageUrl = `${HOST}/${message.message}`;
      const extension = imageUrl.split('.').pop().toLowerCase();
      if (extension === 'gif') {
        setIsGif(true);
        setCompressedImage(imageUrl);
      } else {
        fetch(imageUrl)
          .then((res) => res.blob())
          .then((blob) => {
            new Compressor(blob, {
              quality: 1,
              success(result) {
                const reader = new FileReader();
                reader.readAsDataURL(result);
                reader.onloadend = () => {
                  setCompressedImage(reader.result);
                };
              },
              error(err) {
                console.log(err.message);
              },
            });
          });
      }
    };

    compressImage();
  }, [message.message]);

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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const closeFullscreen = (e) => {
    if (e.target === e.currentTarget) {
      setIsFullscreen(false);
    }
  };

  return (
    <>
      <div
        className={`p-1 rounded-lg ${
          message.senderId === currentChatUser.id
            ? "bg-incoming-background"
            : "bg-outgoing-background"
        }`}
      >
        <div className="relative">
          {compressedImage ? (
            <img
              ref={imgRef}
              src={compressedImage}
              className="rounded-lg shadow-sm cursor-pointer"
              alt="asset"
              height={300}
              width={300}
              loading="lazy"
              onClick={toggleFullscreen}
            />
          ) : (
            <p>Loading...</p>
          )}
          <div className="absolute bottom-1 right-1 flex items-end justify-between">
            <span className="text-bubble-meta text-[11px] pt-1 min-w-fit text-black">
              {calculateTime(message.createdAt)}
            </span>
            {message.senderId === userInfo.id && (
              <>
                <MessageStatus messageStatusId={message.messageStatusId} />
              
              </>
            )}
          </div>
        </div>
      </div>
      {isFullscreen && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 cursor-pointer"
          onClick={closeFullscreen}
        >
          <img src={compressedImage} className="max-w-full max-h-full" alt="asset-fullscreen" />
        </div>,
        document.body
      )}
    </>
  );
}

export default ImageMessage;
