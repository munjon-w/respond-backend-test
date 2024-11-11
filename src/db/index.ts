import { Sequelize } from "sequelize"

import dotenv from "dotenv"
dotenv.config()
const database = process.env.DB_NAME || "db"
const username = process.env.DB_USER || "dbuser"
const password = process.env.DB_PASSWORD || "dbpassword"
const host = process.env.DB_HOST || "mysql"

const sequelize = new Sequelize(database, username, password, {
  host,
  dialect: "mysql",
  logging: false,
  port: 3306,
})

export default sequelize
