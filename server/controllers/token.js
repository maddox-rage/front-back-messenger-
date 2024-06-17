import jwt from "jsonwebtoken"

export const genToken = id =>{
    const token = jwt.sign({id}, "dasdasd", {expiresIn:"10d"})
    return token
}
