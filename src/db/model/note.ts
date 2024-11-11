import { DataTypes, Model } from "sequelize"
import sequelize from "../index"

export default class Note extends Model {
  declare id: number
  declare userId: number
  declare type: string
  declare title: string
  declare content: string
}

Note.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Note",
    tableName: "notes",
    indexes: [
      {
        fields: ["userId"],
      },
    ],
  }
)
