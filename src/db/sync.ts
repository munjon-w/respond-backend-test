import User from "./model/user"
import Note from "./model/note"
import NoteAccess from "./model/note-access"

const sync = async () => {
  await User.sync()
  console.log("User table synced")
  await Note.sync()
  console.log("Note table synced")
  await NoteAccess.sync()
  console.log("Note Access table synced")
}

export { sync }
