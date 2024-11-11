import jwt from "jsonwebtoken"
import UserModel from "../db/model/user"

export default async (req, res, next) => {
  const { accessToken } = req.cookies

  if (!accessToken) {
    return res.status(400).send("Invalid or expired authentication detail.")
  }

  try {
    const jwtData = jwt.verify(
      accessToken,
      process.env.JWT_SECRET as string
    ) as {
      id: number
      displayName: UserModel["displayName"]
      type: "access"
      iat: number
      exp: number
    }

    const user = await UserModel.findOne({
      where: { id: jwtData.id },
    })
    req.user = user
  } catch (err: any) {
    console.log(err)
    return res.status(400).send("Authentication failed.")
  }

  next()
}
