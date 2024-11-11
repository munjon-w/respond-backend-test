import { DataTypes, Model } from "sequelize"
import sequelize from "../index"

export default class User extends Model {
  declare id: number
  declare userName: string
  declare password: string
  declare displayName: string
}

User.init(
  {
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    indexes: [
      {
        fields: ["id"],
      },
      {
        fields: ["userName"],
      },
    ],
  }
)
