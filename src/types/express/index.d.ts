declare namespace Express {
  interface Request {
    db: import("sequelize").Sequelize
    user?: import("../../db/model/user").default
    redis: import("redis").RedisClientType
  }
}
