import { DataTypes, Model } from "sequelize"
import sequelize from "../index"

export default class NoteAccess extends Model {
  declare id: number
  declare slug: string
  declare userId: number
  declare type: string
  declare title: string
  declare content: string
}

NoteAccess.init(
  {
    noteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "NoteAccess",
    tableName: "notes_access",
    indexes: [
      {
        fields: ["noteId"],
      },
    ],
  }
)
