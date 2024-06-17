import { renameSync } from "fs";
import getPrismaInstance from "../utils/PrismaClient.js";

// Функция для получения всех сообщений между пользователями
export const getMessages = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const { from, to } = req.params;
    const messages = await prisma.messages.findMany({
      where: {
        OR: [
          {
            senderId: parseInt(from),
            recieverId: parseInt(to),
          },
          {
            senderId: parseInt(to),
            recieverId: parseInt(from),
          },
        ],
      },
      orderBy: {
        id: "asc",
      },
    });
    const unreadMessages = [];

    messages.forEach((message, index) => {
      if (
        message.messageStatusId !== 3 &&
        message.senderId === parseInt(to)
      ) {
        messages[index].messageStatusId = 3;
        unreadMessages.push(message.id);
      }
    });

    await prisma.messages.updateMany({
      where: {
        id: { in: unreadMessages },
      },
      data: {
        messageStatusId: 3,
      },
    });
    res.status(200).json({ messages });
  } catch (err) {
    next(err);
  }
};
// Функция для добавления нового текстового сообщения
export const addMessage = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();

    const { message, from, to } = req.body;
    const getUser = onlineUsers.get(to);
    console.log(message, from, to)
    if (message && from && to) {
      const newMessage = await prisma.messages.create({
        data: {
          message: message,
          sender: { connect: { id: parseInt(from) } },
          reciever: { connect: { id: parseInt(to) } },
          messageStatus: getUser ? {connect:{id: 2}} : {connect:{id: 1}},
          messageType: {connect: {id: 1}}
        },
        include: { sender: true, reciever: true },
      });
      console.log(newMessage)
      return res.status(201).send({ message: newMessage });
    }
    return res.status(400).send("From, to and Message is required.");
  } catch (err) {
    next(err);
  }
};

// Функция для получения исходных контактов с сообщениями
export const getInitialContactsWithMessages = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.from);
    const prisma = getPrismaInstance();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        sentMessages: {
          include: { reciever: true, sender: true },
          orderBy: { createdAt: "desc" },
        },
        recievedMessages: {
          include: { reciever: true, sender: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    const messages = [...user.sentMessages, ...user.recievedMessages];
    messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const users = new Map();
    const messageStatusChange = [];

    messages.forEach((msg) => {
      const isSender = msg.senderId === userId;
      const calculatedId = isSender ? msg.recieverId : msg.senderId;
      if (msg.messageStatusId === 1) {
        messageStatusChange.push(msg.id);
      }
      if (!users.get(calculatedId)) {
        const {
          id,
          messageTypeId,
          message,
          messageStatusId,
          createdAt,
          senderId,
          recieverId,
        } = msg;
        let user = {
          messageId: id,
          messageTypeId,
          message,
          messageStatusId,
          createdAt,
          senderId,
          recieverId,
        };
        if (isSender) {
          user = {
            ...user,
            ...msg.reciever,
            totalUnreadMessages: 0,
          };
        } else {
          user = {
            ...user,
            ...msg.sender,
            totalUnreadMessages: messageStatusId !== 3 ? 1 : 0,
          };
        }
        users.set(calculatedId, {
          ...user,
        });
      } else if (msg.messageStatus !== 3 && !isSender) {
        const user = users.get(calculatedId);
        users.set(calculatedId, {
          ...user,
          totalUnreadMessages: user.totalUnreadMessages + 1,
        });
      }
    });

    if (messageStatusChange.length) {
      await prisma.messages.updateMany({
        where: {
          id: { in: messageStatusChange },
        },
        data: {
          messageStatusId: 2,
        },
      });
    }

    return res.status(200).json({
      users: Array.from(users.values()),
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  } catch (err) {
    next(err);
  }
};
// Функция для добавления аудио-сообщения
export const addAudioMessage = async (req, res, next) => {
  try {
    if (req.file) {
      const date = Date.now();
      let fileName = "uploads/recordings/" + date + req.file.originalname;
      renameSync(req.file.path, fileName);
      const prisma = getPrismaInstance();
      const { from, to } = req.query;
      if (from && to) {
        const message = await prisma.messages.create({
          data: {
            message: fileName,
            sender: { connect: { id: parseInt(from) } },
            reciever: { connect: { id: parseInt(to) } },
            messageType: {connect:{id:3 }},
            messageStatus:{connect: {id:1}},
          },
        });
        return res.status(201).json({ message });
      }
      return res.status(400).send("From, to is required.");
    }
    return res.status(400).send("Audio is required.");
  } catch (err) {
    next(err);
  }
};
// Функция для добавления сообщения с изображением
export const addImageMessage = async (req, res, next) => {
  try {
    if (req.file) {
      const date = Date.now();
      const prisma = getPrismaInstance();
      const { from, to, fileType } = req.query;
      console.log(fileType)
      if(fileType === "image"){
        if (from && to) {
          let fileName = "uploads/images/" + date + req.file.originalname;
          renameSync(req.file.path, fileName);
          const message = await prisma.messages.create({
            data: {
              message: fileName,
              sender: { connect: { id: parseInt(from) } },
              reciever: { connect: { id: parseInt(to) } },
              messageType:{connect: {id: 2}},
              messageStatus:{connect: {id:1}},
            },
          });
          return res.status(201).json({ message });
        }
      }else if (fileType === "archive"){
        let fileName = "uploads/archives/" + date + req.file.originalname;
        renameSync(req.file.path, fileName);
        console.log(fileType)
        const message = await prisma.messages.create({
          data: {
            message: fileName,
            sender: { connect: { id: parseInt(from) } },
            reciever: { connect: { id: parseInt(to) } },
            messageType:{connect: {id: 6}},
            messageStatus:{connect: {id:1}},
          },
        });
        return res.status(201).send({message});

      }else if (fileType === "office"){
        let fileName = "uploads/offices/" + date + req.file.originalname;
        renameSync(req.file.path, fileName);
        console.log(fileType)
        const message = await prisma.messages.create({
          data: {
            message: fileName,
            sender: { connect: { id: parseInt(from) } },
            reciever: { connect: { id: parseInt(to) } },
            messageType:{connect: {id: 4}},
            messageStatus:{connect: {id:1}},
          },
        });
        console.log(message)
        return res.status(201).send({message});

      }else if (fileType === "multimedia"){
        let fileName = "uploads/multimedias/" + date + req.file.originalname;
        renameSync(req.file.path, fileName);
        console.log(fileType)
        const message = await prisma.messages.create({
          data: {
            message: fileName,
            sender: { connect: { id: parseInt(from) } },
            reciever: { connect: { id: parseInt(to) } },
            messageType:{connect: {id: 5}},
            messageStatus:{connect: {id:1}},
          },
        });
        return res.status(201).send({message});
      }
      return res.status(400).send("From, to is required.");
    }
    return res.status(400).send("Image is required.");
  } catch (err) {
    next(err);
  }
};
// Функция для удаления сообщения по id
export const deleteMessage = async (req, res, next) => {
  try{
    const id = parseInt(req.params.id);
    console.log(id)
    const prisma = getPrismaInstance();
    const message = await prisma.messages.delete({
      where:{
        id
      }
    })
    console.log(message)
    res.status(200).json({message:message})
  }catch (err){
    next(err);
  }
}

export const deleteAllMessage = async (req, res, next) => {
  try{
    const {to, from, isBlock, blocker, blocked} = req.body
    const prisma = getPrismaInstance();
    if(isBlock){
      const deleteMess = await prisma.messages.deleteMany({
        where:{
         OR:[
           {senderId:from, recieverId:to},
           {senderId:to, recieverId:from}, 
         ]
        }})
      const block = await prisma.userBlock.create({
        data:{
          blockedById:blocker,
          blockedUserId:blocked,
        }
      })
      return res.json({msg:"Messages is deleted and user blocked"})
    }else{
      const deleteMess = await prisma.messages.deleteMany({
        where:{
         OR:[
           {senderId:from, recieverId:to},
           {senderId:to, recieverId:from}, 
         ]
        }})
      console.log(to, from,deleteMess )
    }
  
    return res.json({msg:"Messages is deleted"})
  }catch (err){
    next(err);
  }
}

export const unBlockUser = async (req,res,next)=>{
  try{
    const {id} = req.body
    const prisma = getPrismaInstance();
    await prisma.userBlock.delete({
      where:{
        id:id
      }
    })
    return res.json({msg:"user is available"})
  }catch(err){
    next(err)
  }
}

export const reportUser = async(req, res, next)=>{
  try{
    const {reportedBy, reportedUser, reportReason} = req.body
    const prisma = getPrismaInstance();
    await prisma.userReport.create({
      data:{
        reportReason,
        reportedBy:{connect:{id: parseInt(reportedBy)}},
        reportedUser:{connect:{id:parseInt(reportedUser)}}
      }
    })
    return res.json({status:true})
  }catch(err){
    next(err)
  }
}

export const deleteMessageByReciever = async (req, res, next) => {
  try{
    const id = parseInt(req.params.id);
    console.log(id)
    const prisma = getPrismaInstance();
    const message = await prisma.messages.update({
      where:{
        id
      },
      data:{
        deleteByReciever:true
      }
    })
    console.log(message)
    res.status(200).json({message:message})
  }catch (err){
    next(err);
  }
}
