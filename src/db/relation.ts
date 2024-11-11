import User from "./model/user"
import Note from "./model/note"
import NoteAccess from "./model/note-access"

const relation = async () => {
  User.hasMany(Note, { foreignKey: "userId" })
  Note.hasMany(NoteAccess, { foreignKey: "noteId" })
  console.log("Relation created")
}

export { relation }
