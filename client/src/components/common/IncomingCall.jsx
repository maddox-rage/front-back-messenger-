import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import Image from "next/image";
import React, { useEffect, useState } from "react";

function IncomingCall() {
  const [{ incomingVoiceCall, socket }, dispatch] = useStateProvider();
  const [audioElement, setAudioElement] = useState(null);

  useEffect(() => {
    const audio = new Audio("/call-sound.mp3");
    audio.loop = true;
    setAudioElement(audio);
  }, []);

  useEffect(() => {
    if (audioElement) {
      console.log({ audioElement });
      audioElement.play();

      return () => {
        audioElement.pause();
        audioElement.currentTime = 0;
      };
    }
  }, [audioElement]);

  const acceptCall = () => {
    const call = incomingVoiceCall;
    dispatch({
      type: reducerCases.SET_INCOMING_VOICE_CALL,
      incomingVoiceCall: undefined,
    });
    dispatch({
      type: reducerCases.SET_VOICE_CALL,
      voiceCall: { ...call, type: "in-coming" },
    });
    socket.current.emit("accept-incoming-call", { id: incomingVoiceCall.id });
  };

  const rejectCall = () => {
    const call = incomingVoiceCall;
    dispatch({
      type: reducerCases.SET_INCOMING_VOICE_CALL,
      incomingVoiceCall: undefined,
    });
    socket.current.emit("reject-voice-call", {
      from: call.id,
    });
  };

  return (
    <div className="h-24 w-80 fixed bottom-8 mb-0 right-6 z-50 rounded-sm flex gap-5 items-center justify-start p-4 bg-conversation-panel-background text-white drop-shadow-2xl border-icon-green border-2 py-14">
      <div>
        <Image
          src={incomingVoiceCall.profilePicture}
          alt="avatar"
          width={70}
          height={70}
          className="rounded-full"
        />
      </div>
      <div>
        <div>{incomingVoiceCall.name}</div>
        <div className="text-xs">Входящий аудио звонок</div>
        <div className="flex gap-2 mt-2">
          <button
            className="bg-red-500 p-1 px-3 text-sm rounded-full"
            onClick={rejectCall}
          >
            Отклонить
          </button>
          <button
            className="bg-green-500 p-1 px-3 text-sm rounded-full"
            onClick={acceptCall}
          >
            Принять
          </button>
        </div>
      </div>
    </div>
  );
}

export default IncomingCall;
