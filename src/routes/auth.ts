import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

import UserModel from "../db/model/user"

const router = express.Router()

// refresh user auth credential validity
router.get("/refresh", async (req, res): Promise<any> => {
  const { refreshToken } = req.cookies

  if (!refreshToken) {
    return res.status(400).send("Invalid or expired authentication detail.")
  }

  try {
    const validRefreshToken = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET as string
    ) as {
      id: number
      userName: UserModel["userName"]
      displayName: UserModel["displayName"]
      type: "refresh"
      iat: number
      exp: number
    }

    if (
      !validRefreshToken ||
      !validRefreshToken.userName ||
      !validRefreshToken.displayName ||
      validRefreshToken.type !== "refresh"
    ) {
      throw new Error("Invalid refresh token")
    }

    const user = await UserModel.findOne({
      where: { id: validRefreshToken.id },
    })
    if (!user) {
      throw new Error("User not found")
    }

    const accessToken = generateAccessToken(user.id, user.displayName)
    res
      .cookie("accessToken", accessToken, {
        maxAge: 1000 * 60 * 60, // would expire after 1 hour
        httpOnly: true,
      })
      .send("refreshed")
  } catch (error) {
    console.log(error)
    return res.status(400).send("Authentication failed.")
  }
})

// register user
router.put("/register", async (req, res): Promise<any> => {
  const {
    username: usernameReq,
    password: passwordReq,
    displayName: displayNameReq,
  } = req.body

  if (typeof usernameReq !== "string" || !usernameReq.trim()) {
    return res.status(400).send("Insufficient or invalid payload.")
  }

  if (typeof passwordReq !== "string" || !passwordReq.trim()) {
    return res.status(400).send("Insufficient or invalid payload.")
  }

  if (typeof displayNameReq !== "string" || !displayNameReq.trim()) {
    return res.status(400).send("Insufficient or invalid payload.")
  }

  const [username, password, displayName] = [
    usernameReq.trim(),
    passwordReq.trim(),
    displayNameReq.trim(),
  ]

  try {
    const userExisted = await UserModel.findOne({
      where: { userName: username, displayName: displayName },
    })
    if (userExisted && userExisted.userName === username) {
      return res.status(400).send("User already existed.")
    } else if (userExisted && userExisted.displayName === displayName) {
      return res.status(400).send("Display Name Taken.")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await UserModel.create({
      userName: username,
      password: hashedPassword,
      displayName: displayName,
    })
  } catch (err: any) {
    console.error(err)
    return res.status(500).send("Internal Server Error")
  }

  res.send("Created")
})

// user login
router.post("/login", async (req, res): Promise<any> => {
  const { username: usernameReq, password: passwordReq } = req.body

  if (typeof usernameReq !== "string" || !usernameReq.trim()) {
    return res.status(400).send("Insufficient or invalid payload.")
  }

  if (typeof passwordReq !== "string" || !passwordReq.trim()) {
    return res.status(400).send("Insufficient or invalid payload.")
  }

  const [username, password] = [usernameReq.trim(), passwordReq.trim()]

  const user = await UserModel.findOne({
    where: { userName: username },
  })

  if (!user || !user.password) {
    return res.status(400).send("Authentication failed.")
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(400).send("Authentication failed.")
  }

  const accessToken = generateAccessToken(user.id, user.displayName)

  const refreshToken = generateRefreshToken(
    user.id,
    user.userName,
    user.displayName
  )

  res
    .cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60, // would expire after 1 hour
      httpOnly: true,
    })
    .cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30, // would expire after 30 day
      httpOnly: true,
    })
    .json({
      displayName: user.displayName,
    })
})

// user logout
router.post("/logout", (req, res) => {
  res.clearCookie("accessToken").clearCookie("refreshToken").send("Logged out")
})

export default router

function generateAccessToken(id: number, displayName: string) {
  return jwt.sign(
    {
      id,
      displayName: displayName,
      type: "access",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  )
}

function generateRefreshToken(
  id: number,
  username: string,
  displayName: string
) {
  return jwt.sign(
    {
      id,
      userName: username,
      displayName: displayName,
      type: "refresh",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  )
}
