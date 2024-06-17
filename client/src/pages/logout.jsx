import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { firebaseAuth } from "@/utils/FirebaseConfig";
import { signOut } from "firebase/auth";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import Cookies from "js-cookie";

function Logout() {
  const [{ socket, userInfo }, dispatch] = useStateProvider();
  const router = useRouter();
  const token = Cookies.get("token");

  useEffect(() => {
    if (userInfo) {
      socket.current.emit("signout", userInfo.id);
      dispatch({
        type: reducerCases.SET_USER_INFO,
        userInfo: undefined,
      });
      
      signOut(firebaseAuth)
        .then(() => {
          router.push("/login");
        })
        .catch((error) => {
          console.error("Ошибка при разлогинивании:", error);
        });
    } else {
      router.push("/login");
    }
  }, [socket, userInfo, token, dispatch, router]);

  return <div className="bg-conversation-panel-background"></div>;
}

export default Logout;
