import { isArgumentsObject } from "util/types";
import getPrismaInstance from "../utils/PrismaClient.js";
import { generateToken04 } from "../utils/TokenGenerator.js";
import { genToken } from "./token.js"
import jwt from 'jsonwebtoken'

// Функция для проверки наличия пользователя по электронной почте
export const checkUser = async (req, res, next) => {
  try {
    const { email, password, token} = req.body;
    if(token){
      const decoded = jwt.verify(token, "dasdasd")
      const prisma = getPrismaInstance();
      const user = await prisma.user.findUnique({where:{id:decoded.id}})
      if (!user) {
        return res.json({ msg: "User not found", status: false });
      }else{
        return res.json({ msg: "User Found", status: true, data: user });
      }
    }
    if (password) {
      const prisma = getPrismaInstance();
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.json({ msg: "User not found", status: false });
      } else {
        const isValidPass = await argon.verify(user.password, password)
        if(isValidPass){
          const token = genToken(user.id)
          return res.json({ msg: "User Found", status: true, data: user, token});
        }
      }
    }else{
      if (!email) {
        return res.json({ msg: "Email is required", status: false });
      }
      const prisma = getPrismaInstance();
      const user = await prisma.user.findUnique({ where: { email },
        include: {
        blockedBy:{include: { blockedBy: true }},
        blockedUsers:{include: { blockedUser: true }} 
      }});
      const block = await prisma.userBlock.findMany({
        include:{
          blockedUser:true
        }
      })
      console.log(user)
      if (!user) {
        return res.json({ msg: "User not found", status: false });
      } else {
        const banned = await prisma.blockedUser.findUnique({
          where:{
           userId: user.id
          }
        })
        if(banned){
          return res.json({ msg: "User Found", status: true, data: user, block:block, banned:true});
        }else{
          return res.json({ msg: "User Found", status: true, data: user, block:block});
        }
        
      }
    }
  } catch (error) {
    next(error);
  }
};

// Функция для добавления нового пользователя
export const onBoardUser = async (req, res, next) => {
  try {
    const { email, name, about = "Available", image: profilePicture, password } = req.body;
    if (password) {
        const prisma = getPrismaInstance();
        const user = await prisma.user.create({
          data: { email, name, about, profilePicture, password: await argon.hash(password), role:{connect: {id: 1}} },
        });
        const token = genToken(user.id)
        return res.json({ msg: "Success", status: true, token});
    }else{
      if (!email || !name || !profilePicture) {
        return res.json({
          msg: "Email, Name and Image are required",
        });
      } else {
        const prisma = getPrismaInstance();
        await prisma.user.create({
          data: { email, name, about, profilePicture, role:{connect: {id: 1}}},
        });
        return res.json({ msg: "Success", status: true });
      }
    }
  } catch (error) {
    next(error);
  }
};

// Функция для получения всех пользователей, сгруппированных по первой букве имени
export const getAllUsers = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        email: true,
        name: true,
        profilePicture: true,
        about: true,
      },
    });
    const usersGroupedByInitialLetter = {};
    users.forEach((user) => {
      const initialLetter = user.name.charAt(0).toUpperCase();
      if (!usersGroupedByInitialLetter[initialLetter]) {
        usersGroupedByInitialLetter[initialLetter] = [];
      }
      usersGroupedByInitialLetter[initialLetter].push(user);
    });

    return res.status(200).send({ users: usersGroupedByInitialLetter });
  } catch (error) {
    next(error);
  }
};

// Функция для генерации токена для звонков
export const generateToken = (req, res, next) => {
  try {
    const appID = parseInt(process.env.ZEGO_APP_ID);
    const serverSecret = process.env.ZEGO_APP_SECRET;
    const userId = req.params.userId;
    const effectiveTimeInSeconds = 3600;
    const payload = "";
    if (appID && serverSecret && userId) {
      const token = generateToken04(
        appID,
        userId,
        serverSecret,
        effectiveTimeInSeconds,
        payload
      );
      res.status(200).json({ token });
    }
    return res.status(400).send("User id, app id and server secret is required");
  } catch (err) {
    console.log({ err });
    next(err);
  }
};

export const changeEmail = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const {currentEmail, updatedUserInfo} = req.body
    // console.log(currentEmail, updatedUserInfo.email)
    const user = await prisma.user.findUnique({
      where:{
        email:currentEmail
      }
    })
    console.log(user)
    const checkEmail = await prisma.user.findUnique({
      where:{
        email:updatedUserInfo.email
      }
    })
    const updated = await prisma.user.update({
      where:{
        id:user.id
      },
      data:{
        email:updatedUserInfo.email
      }
    })
    return res.json({currentEmail, user, updated})
  } catch (err) {
    console.log({ err });
    next(err);
  }
};

export const changeOtherInfo = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const {updatedUserInfo, image} = req.body
    console.log(req.body)
    console.log(updatedUserInfo.status, updatedUserInfo.name, updatedUserInfo.email, image)
    const user = await prisma.user.findUnique({
      where:{
        email:updatedUserInfo.email
      }
    })
    const updatedUser = await prisma.user.update({
      where:{
        id:user.id
      },
      data:{
        about: updatedUserInfo.status,
        name:updatedUserInfo.name,
        profilePicture: image
      }
    })
    return res.json({updatedUser})
  } catch (err) {
    console.log({ err });
    next(err);
  }
};