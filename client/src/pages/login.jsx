import axios from "axios";
import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { firebaseAuth } from "../utils/FirebaseConfig";
import { useStateProvider } from "@/context/StateContext";
import { useRouter } from "next/router";
import { reducerCases } from "@/context/constants";
import { CHECK_USER_ROUTE } from "@/utils/ApiRoutes";

export default function Login() {
  const router = useRouter();
  const [{ userInfo, newUser }, dispatch] = useStateProvider();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Пожалуйста, заполните все поля");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;
      const { data } = await axios.post(CHECK_USER_ROUTE, {
        email: user.email,
      });
      if (data?.banned) {
        alert("Вы были заблокированы");
        return;
      }
      if (!data.status) {
        dispatch({ type: reducerCases.SET_NEW_USER, newUser: true });
        dispatch({
          type: reducerCases.SET_USER_INFO,
          userInfo: {
            name: "",
            email: user.email,
            status: "Available",
          },
        });
        router.push("/onboarding");
      } else {
        dispatch({
          type: reducerCases.SET_USER_INFO,
          userInfo: {
            id: data.data.id,
            email: data.data.email,
            name: data.data.name,
            profileImage: data.data.profilePicture,
            status: data.data.about,
            blockedBy: data?.data?.blockedBy,
            blockedUsers: data?.data?.blockedUsers,
            block: data?.block,
            role: data?.data?.roleId,
          },
        });
        router.push("/");
      }
    } catch (signInError) {
      if (signInError) {
        try {
          const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
          const user = userCredential.user;
          const { data } = await axios.post(CHECK_USER_ROUTE, {
            email: user.email,
          });

          dispatch({ type: reducerCases.SET_NEW_USER, newUser: true });
          dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo: {
              name: "",
              email: user.email,
              status: "Available",
              profileImage: "",
              blockedBy: data?.data?.blockedBy,
              blockedUsers: data?.data?.blockedUsers,
              block: data?.block,
              role: data?.data?.roleId,
            },
          });
          router.push("/onboarding");
        } catch (createUserError) {
          console.error(createUserError);
          alert("invalid email or pass");
        }
      } else {
        console.error(signInError);
        alert("Invalid email or pass");
      }
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const {
      user: { displayName: name, email: googleEmail, photoURL: profileImage },
    } = await signInWithPopup(firebaseAuth, provider);

    try {
      if (googleEmail) {
        const { data } = await axios.post(CHECK_USER_ROUTE, {
          email: googleEmail,
        });

        if (!data.status) {
          dispatch({ type: reducerCases.SET_NEW_USER, newUser: true });
          dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo: {
              name,
              email: googleEmail,
              profileImage,
              status: "Available",
              blockedBy: data?.data?.blockedBy,
              blockedUsers: data?.data?.blockedUsers,
              block: data?.block,
              role: data?.data?.roleId,
            },
          });
          router.push("/onboarding");
        } else {
          dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo: {
              id: data.data.id,
              email: data.data.email,
              name: data.data.name,
              profileImage: data.data.profilePicture,
              status: data.data.about,
              blockedBy: data?.data?.blockedBy,
              blockedUsers: data?.data?.blockedUsers,
              block: data?.block,
              role: data?.data?.roleId,
            },
          });
          router.push("/");
        }
      }
    } catch (error) {
      console.log({ error });
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      alert("Пожалуйста, введите вашу электронную почту для восстановления пароля");
      return;
    }
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
      alert("Письмо для восстановления пароля было отправлено на вашу электронную почту");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className="flex justify-center items-center bg-panel-header-background h-screen w-screen flex-col gap-6">
      <div className="flex items-center justify-center gap-2 text-white">
        <span className="text-7xl">Messenger</span>
      </div>
      <form onSubmit={handleFormSubmit} className="flex flex-col items-center gap-4">
        <input
          type="email"
          placeholder="Электронная почта"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-input-background text-sm focus:outline-none text-white h-10 rounded-lg pl-5 pr-5 py-4 w-full"
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-input-background text-sm focus:outline-none text-white h-10 rounded-lg pl-5 pr-5 py-4 w-full"
        />
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="flex items-center justify-center bg-outgoing-background hover:bg-outgoing-hover text-white py-2 px-4 rounded-lg"
          >
            Отправить
          </button>
          <span className="text-gray-400">или</span>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-2 bg-outgoing-background text-white py-2 px-4 rounded-lg hover:bg-outgoing-hover"
          >
            <FcGoogle className="text-2xl" />
            Google
          </button>
        </div>
        <button
          type="button"
          onClick={handlePasswordReset}
          className="text-blue-500 hover:underline mt-4"
        >
          Восстановить пароль
        </button>
      </form>
    </div>
  );
}
