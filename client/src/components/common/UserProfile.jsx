import React, { useState } from "react";
import Avatar from "./Avatar";
import axios from "axios";
import { UNBLOCK_USER, CHANGE_USER_INFO, CHANGE_USER_EMAIL } from "@/utils/ApiRoutes";
import { EmailAuthProvider, reauthenticateWithCredential, updateEmail, updatePassword } from "firebase/auth";
import { firebaseAuth } from "../../utils/FirebaseConfig";
import Resizer from "react-image-file-resizer";


const UserProfile = ({ userInfo, onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [activeTabChild, setActiveTabChild] = useState('currentUserInfo');
  const [currentPassword, setCurrentPassword] = useState(""); 
  const [newPassword, setNewPassword] = useState(""); 
  const [updatedUserInfo, setUpdatedUserInfo] = useState({
    name: userInfo.name,
    email: userInfo.email,
    status: userInfo.status,
    image: userInfo.profileImage
  });
  const currentEmail = userInfo.email
  const [image, setImage] = useState(userInfo.profileImage);
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const resizeFile = (file) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        10000,
        10000,
        "PNG",
        80,
        0,
        (uri) => {
          resolve(uri);
        },
        "base64"
      );
    });

  const handleTabClickChild = (tab) => {
    setActiveTabChild(tab);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUserInfo({
      ...updatedUserInfo,
      [name]: value,
    });
  };



  const reauthenticateUser = async () => {
    const user = firebaseAuth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    try {
      await reauthenticateWithCredential(user, credential);
      return true;
    } catch (error) {
      console.error("Error re-authenticating user:", error);
      alert("Re-authentication failed. Please check your password.");
      return false;
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert("Пароль должен содержать минимум 6 символов");
      return;
    }
    
    const reauthenticated = await reauthenticateUser();
    if (reauthenticated) {
      try {
        const user = firebaseAuth.currentUser;
        await updatePassword(user, newPassword);
        alert("Пароль успешно обновлен");
        setNewPassword("");
        setCurrentPassword("");
      } catch (error) {
        console.error("Error updating password:", error);
        alert("Ошибка обновления пароля");
      }
    }
  };
  

  const handleEmailChange = async (e) => {
    e.preventDefault();
    const reauthenticated = await reauthenticateUser();
    if (reauthenticated) {
      try {
        const user = firebaseAuth.currentUser;
        await updateEmail(user, updatedUserInfo.email);
        await axios.post(CHANGE_USER_EMAIL, {updatedUserInfo, currentEmail});
        alert("Электронная почта успешно обновлена");
      } catch (error) {
        console.error("Error updating email:", error);
        alert("Ошибка обновления электронной почты");
      }
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const base64Response = await fetch(`${image}`);
      const blob = await base64Response.blob();
      setImage(await resizeFile(blob));
      console.log(updatedUserInfo, image)
      await axios.post(CHANGE_USER_INFO, {updatedUserInfo, image});
      alert("Информация пользователя успешно обновлена");
    } catch (error) {
      console.error("Error updating user info:", error);
    }
  };

  const handleUnblockUser = async (id) => {
    try {
      const { data } = await axios.post(`${UNBLOCK_USER}`, { id: id });
      alert("Пользователь успешно разблокирован");
    } catch (error) {
      console.error("Error unblocking user:", error);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-panel-header-background rounded-lg p-8 shadow-md text-white w-full max-w-screen-md h-3/4 " onClick={(e) => e.stopPropagation()}>
        <div className="flex mb-4">
          <button className={`mr-4 ${activeTab === 'profile' ? 'text-blue-500' : 'text-gray-500'}`} onClick={() => handleTabClick('profile')}>Профиль</button>
          <button className={activeTab === 'blockedUser' ? 'text-blue-500' : 'text-gray-500'} onClick={() => handleTabClick('blockedUser')}>Заблокированные пользователи</button>
        </div>
      
        {activeTab === 'profile' && (
          <div>
            <div className="flex mb-4">
              <button className={`mr-4 ${activeTabChild === 'currentUserInfo' ? 'text-blue-500' : 'text-gray-500'}`} onClick={() => handleTabClickChild('currentUserInfo')}>Информация о пользователе</button>
              {/* <button className={`mr-4 ${activeTabChild === 'changeEmail' ? 'text-blue-500' : 'text-gray-500'}`} onClick={() => handleTabClickChild('changeEmail')}>Сменить Email</button> */}
              <button className={`mr-4 ${activeTabChild === 'changePassword' ? 'text-blue-500' : 'text-gray-500'}`} onClick={() => handleTabClickChild('changePassword')}>Сменить пароль</button>
              <button className={`mr-4 ${activeTabChild === 'changeOtherInfo' ? 'text-blue-500' : 'text-gray-500'}`} onClick={() => handleTabClickChild('changeOtherInfo')}>Изменить другую информацию</button>
            </div>
           
            {activeTabChild === 'currentUserInfo' && (
              <div>
                <Avatar type="lg" image={userInfo?.profileImage} />
                <p>Имя: {userInfo.name}</p>
                <p>Электронная почта: {userInfo.email}</p>
                <p>О себе: {userInfo.status}</p>
              </div>
            )}

            {activeTabChild === 'changeEmail' && (
              <form onSubmit={handleEmailChange}>
                <div>
                  <label>
                    Текущий пароль:
                    <input className="flex items-center justify-center bg-outgoing-background hover:bg-outgoing-hover text-white py-2 px-4 rounded-lg" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                  </label>
                </div>
                <div>
                  <label>
                    Новая электронная почта:
                    <input className="flex items-center justify-center bg-outgoing-background hover:bg-outgoing-hover text-white py-2 px-4 rounded-lg" type="email" name="email" value={updatedUserInfo.email} onChange={handleInputChange} required />
                  </label>
                </div>
                <button className="flex items-center justify-center bg-outgoing-background hover:bg-outgoing-hover text-white py-2 px-4 rounded-lg mt-4"  type="submit">Сменить электронную почту</button>
              </form>
            )}

            {activeTabChild === 'changePassword' && (
              <form onSubmit={handlePasswordChange}>
                <div>
                  <label>
                    Текущий пароль:
                    <input className="flex items-center justify-center bg-outgoing-background hover:bg-outgoing-hover text-white py-2 px-4 rounded-lg" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                  </label>
                </div>
                <div>
                  <label>
                    Новый пароль:
                    <input className="flex items-center justify-center bg-outgoing-background hover:bg-outgoing-hover text-white py-2 px-4 rounded-lg" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                  </label>
                </div>
                <button className="flex items-center justify-center bg-outgoing-background hover:bg-outgoing-hover text-white py-2 px-4 rounded-lg mt-4" type="submit">Сменить пароль</button>
              </form>
            )}

            {activeTabChild === 'changeOtherInfo' && (
              <div className="flex gap-6 mt-6 items-center justify-center">
                <form onSubmit={handleProfileUpdate} className="flex flex-col items-center justify-between mt-5 gap-6">
              
                <div>
                  <label>
                    Имя:
                    <input className="flex items-center justify-center bg-outgoing-background hover:bg-outgoing-hover text-white py-2 px-4 rounded-lg" type="text" name="name" value={updatedUserInfo.name} onChange={handleInputChange} required />
                  </label>
                </div>
                <div>
                  <label>
                    О себе:
                    <input className="flex items-center justify-center bg-outgoing-background hover:bg-outgoing-hover text-white py-2 px-4 rounded-lg" type="text" name="status" value={updatedUserInfo.status} onChange={handleInputChange} required />
                  </label>
                </div>
                <button className="flex items-center justify-center bg-outgoing-background hover:bg-outgoing-hover text-white py-2 px-4 rounded-lg " type="submit">Сохранить изменения</button>
              </form>
              <div>
                  <Avatar type="xl" image={image} setImage={setImage} />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'blockedUser' && (
          <div>
            <ul>
              {userInfo.blockedBy.length > 0 ? (
                userInfo.block.map((user) => {
                  if (userInfo.id === user.blockedById) {
                    return (
                      <li key={user.id}>
                        {user.blockedUser.name}
                        <button onClick={() => handleUnblockUser(user.id)}>Разблокировать</button>
                      </li>
                    );
                  }
                })
              ) : (
                <li>Нет заблокированных пользователей</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
