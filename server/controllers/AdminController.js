import getPrismaInstance from "../utils/PrismaClient.js";

export const getAllusers = async (req,res,next)=>{
    try{
      const prisma = getPrismaInstance();
      const users = await prisma.user.findMany()
      return res.json(users)
    }catch(err){
      next(err)
    }
  }

  export const getAllReports = async (req,res,next)=>{
    try{
      const prisma = getPrismaInstance();
      const reports = await prisma.userReport.findMany({
        include:{
            reportedBy:true, reportedUser:true
        }
      })
      return res.json(reports)
    }catch(err){
      next(err)
    }
  }
  
  export const getAllMessages = async (req,res,next)=>{
    try{
        const prisma = getPrismaInstance();
        const messages = await prisma.messages.findMany({
            include:{
                sender:true, reciever:true
            }
        })
        return res.json(messages)
    }catch(err){
      next(err)
    }
  }

  export const getAllBlockedUsers = async (req,res,next)=>{
    try{
        const prisma = getPrismaInstance();
        const blockedUsers = await prisma.userBlock.findMany({
            include:{
                blockedBy:true, blockedUser:true
            }
        })
        return res.json(blockedUsers)
    }catch(err){
      next(err)
    }
  }

  export const getAllBlockedUsersByAdmin = async (req,res,next)=>{
    try{
        const prisma = getPrismaInstance();
        const blockedUsers = await prisma.blockedUser.findMany({})
        return res.json(blockedUsers)
    }catch(err){
      next(err)
    }
  }

  export const blockUserByAdmin = async (req,res,next)=>{
    try{
        const prisma = getPrismaInstance();
        const {id,blockReason} = req.body
        const reports = await prisma.blockedUser.create({
            data:{
                blockReason,
                user:{connect:{id:parseInt(id)}}
            }
        })
        const user = await prisma.user.findUnique({
          where:{
            id
          }
        })
        const changed = await prisma.user.update({
          where:{
            id
          },
          data:{
            name:"Пользователь заблокирован"
          }

        })
        return res.json({reports})
    }catch(err){
      next(err)
    }
  }
  
  export const getCounts = async (req, res, next) => {
    try {
      const prisma = getPrismaInstance();
  
      const usersCount = await prisma.user.count();
      const messagesCount = await prisma.messages.count();
      const reportsCount = await prisma.userReport.count();
      const blockedUsersCount = await prisma.userBlock.count();
      const blockedUsersByAdminCount = await prisma.blockedUser.count();
  
      return res.json({
        usersCount,
        messagesCount,
        reportsCount,
        blockedUsersCount,
        blockedUsersByAdminCount,
      });
    } catch (err) {
      next(err);
    }
  };