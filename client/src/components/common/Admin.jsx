import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  GET_ALL_BLOCKED_USERS,
  GET_ALL_MESSAGES,
  GET_ALL_REPORTS,
  GET_ALL_USERS,
  BLOCK_USER_ROUTE,
  DELETE_MESSAGE_ROUTE,
  GET_ALL_COUNTS
} from "@/utils/ApiRoutes";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ArcElement, Tooltip, Legend);

const UserProfile = ({ userInfo, onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [activeTabChild, setActiveTabChild] = useState('Blocking');

  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userBlock, setUserBlock] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [blockReason, setBlockReason] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [counts, setCounts] = useState([]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleTabClickChild = (tab) => {
    setActiveTabChild(tab);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: reports } = await axios.get(GET_ALL_REPORTS);
        const { data: users } = await axios.get(GET_ALL_USERS);
        const { data: messages } = await axios.get(GET_ALL_MESSAGES);
        const { data: userBlock } = await axios.get(GET_ALL_BLOCKED_USERS);
        const { data: counts } = await axios.get(GET_ALL_COUNTS);
        setReports(reports);
        setUsers(users);
        setMessages(messages);
        setUserBlock(userBlock);
        setCounts(counts);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);
  
  console.log(counts);

  useEffect(() => {
    if (searchQuery) {
      const filteredUsers = users.filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const userIds = filteredUsers.map(user => user.id);
      const filteredMsgs = messages.filter(message => userIds.includes(message.senderId));
      setFilteredMessages(filteredMsgs);
    } else {
      setFilteredMessages([]);
    }
  }, [searchQuery, users, messages]);

  const handleBlockUser = async () => {
    if (!selectedUserId || !blockReason) return;

    try {
      const response = await axios.post(BLOCK_USER_ROUTE, {
        id: selectedUserId,
        blockReason,
      });

      setSelectedUserId(null);
      setBlockReason("");

      alert("Пользователь успешно заблокирован");
    } catch (err) {
      console.log(err);
      alert("Ошибка при блокировке пользователя");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`${DELETE_MESSAGE_ROUTE}/${messageId}`);
      setMessages(messages.filter(message => message.id !== messageId));
      setFilteredMessages(filteredMessages.filter(message => message.id !== messageId));
      alert("Сообщение успешно удалено");
    } catch (err) {
      console.log(err);
      alert("Ошибка при удалении сообщения");
    }
  };

  const barChartData = {
    labels: ['Пользователи', 'Сообщения', 'Жалобы', 'Блокировки', 'Блокировки Админом'],
    datasets: [
      {
        label: 'Количество',
        data: [
          counts.usersCount,
          counts.messagesCount,
          counts.reportsCount,
          counts.blockedUsersCount,
          counts.blockedUsersByAdminCount
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(255, 99, 132, 0.2)',
          'rgba(153, 102, 255, 0.2)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  

  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-panel-header-background rounded-lg p-8 shadow-md text-white w-full max-w-screen-md h-3/4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex mb-4">
          <button className={`mr-4 ${activeTab === 'profile' ? 'text-blue-500' : 'text-gray-500'}`} onClick={() => handleTabClick('profile')}>Активности</button>
          <button className={`mr-4 ${activeTab === 'settings' ? 'text-blue-500' : 'text-gray-500'}`} onClick={() => handleTabClick('settings')}>Жалобы</button>
          <button className={`mr-4 ${activeTab === 'users' ? 'text-blue-500' : 'text-gray-500'}`} onClick={() => handleTabClick('users')}>Пользователи</button>
          <button className={activeTab === 'messages' ? 'text-blue-500' : 'text-gray-500'} onClick={() => handleTabClick('messages')}>Сообщения</button>
        </div>

        {activeTab === 'profile' && (
          <div className="h-full flex flex-col">
            <div className="flex mb-4">
              <button className={`mr-4 ${activeTabChild === 'Blocking' ? 'text-blue-500' : 'text-gray-500'}`} onClick={() => handleTabClickChild('Blocking')}>Блокировки</button>
              <button className={`mr-4 ${activeTabChild === 'totalMessage' ? 'text-blue-500' : 'text-gray-500'}`} onClick={() => handleTabClickChild('totalMessage')}>Статистика</button>
            </div>
            {activeTabChild === 'Blocking' && (
              <div className="flex-grow overflow-y-auto">
                <ul>
                  {userBlock?.map((user) => (
                    <li key={user.id}>
                      <p>Пользователь {user.blockedBy.name} заблокировал {user.blockedUser.name}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {activeTabChild === 'totalMessage' && (
              <div className="flex-grow overflow-y-auto">
                <h3 className="mb-4">Общая статистика</h3>
                <div className="mb-4">
                  <Bar data={barChartData} options={{ responsive: true }} />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="h-full flex-grow overflow-y-auto">
            <ul>
              {reports?.map((report) => (
                <li key={report.id}>
                  <p>Пользователь: {report.reportedUser.name}</p>
                  <p>Причина: {report.reportReason}</p>
                  <hr />
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="flex flex-col h-full">
            <input
              type="text"
              placeholder="Поиск по имени пользователя"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4 p-2 rounded bg-input-background text-white"
            />
            <div className="flex-grow overflow-y-auto">
              <ul>
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((message) => (
                    <li key={message.id} className="mb-4">
                      <p>Отправитель: {users.find(user => user.id === message.senderId)?.name}</p>
                      <p>Сообщение: {message.message}</p>
                      <p>Отправлено: {new Date(message.createdAt).toLocaleString()}</p>
                      <button onClick={() => handleDeleteMessage(message.id)} className="text-red-500">Удалить сообщение</button>
                      <hr />
                    </li>
                  ))
                ) : (
                  <p>Сообщения не найдены</p>
                )}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="flex flex-col h-full">
            <div className="flex-grow overflow-y-auto">
              <ul>
                {users
                  .filter(user => user.name !== "Пользователь заблокирован")
                  .map((user) => (
                    <li key={user.id}>
                      <p>Пользователь: {user.name}</p>
                      <p>Email: {user.email}</p>
                      <button onClick={() => setSelectedUserId(user.id)} className="text-red-500">Заблокировать</button>
                      {selectedUserId === user.id && (
                        <div className="mt-2">
                          <input
                            type="text"
                            placeholder="Причина блокировки"
                            value={blockReason}
                            onChange={(e) => setBlockReason(e.target.value)}
                            className="mb-2 p-2 rounded bg-input-background text-white w-full"
                          />
                          <button onClick={handleBlockUser} className="text-white bg-red-500 p-2 rounded">Подтвердить блокировку</button>
                        </div>
                      )}
                      <hr />
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
