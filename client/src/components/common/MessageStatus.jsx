import React from "react";
import { BsCheck, BsCheckAll } from "react-icons/bs";

function MessageStatus({ messageStatusId }) {
  return (
    <>
      {messageStatusId === 1 && <BsCheck className="text-lg" />}
      {messageStatusId === 2 && <BsCheckAll className="text-lg" />}
      {messageStatusId === 3 && (
        <BsCheckAll className="text-lg text-icon-ack" />
      )}
    </>
  );
}

export default MessageStatus;
