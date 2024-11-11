import express from "express"

import NoteAccess from "../db/model/note-access"
import Note from "../db/model/note"
import WorkNote from "../db/model/sub-model/work-note"
import PersonalNote from "../db/model/sub-model/personal-note"
import { Op } from "sequelize"

const router = express.Router()

// Get All Note
router.get("/all", async (req, res): Promise<any> => {
  try {
    const noteDetails = await Note.findAll({
      where: { userId: req.user?.id },
      attributes: ["id", "type", "title", "content"],
    })

    return res.status(200).json(noteDetails)
  } catch (err: any) {
    console.log(err)
    return res.status(400).send("Notes retrieval failed.")
  }
})

// Get Note's detail
router.get("/:noteId", async (req, res): Promise<any> => {
  const { noteId } = req.params

  if (!noteId || typeof noteId !== "string" || isNaN(Number(noteId))) {
    return res.status(400).send("Insufficient or invalid payload.")
  }

  try {
    const noteFromCache = await req.redis.get(`note:${req.user.id}:${noteId}`)
    let noteDetail: Note

    if (noteFromCache) {
      noteDetail = JSON.parse(noteFromCache)
      res.status(200).json(noteDetail)
    } else {
      noteDetail = await Note.findOne({
        where: { id: noteId, userId: req.user?.id },
        attributes: ["type", "title", "content"],
      })

      if (!noteDetail) {
        return res.status(400).send("Note not found.")
      }

      res.status(200).json(noteDetail)
    }

    // After response
    await NoteAccess.create({
      noteId: noteId,
    })

    if (noteDetail) {
      await cacheProcess(req, noteId, noteDetail)
    }
  } catch (err: any) {
    console.log(err)
    return res.status(400).send("Note retrieval failed.")
  }
})

// Create Note
router.put("/create", async (req, res): Promise<any> => {
  const { type, title, content } = req.body
  const validNoteType = ["work", "personal"]

  if (typeof type !== "string" || !validNoteType.includes(type)) {
    return res.status(400).send("Insufficient or invalid payload.")
  }

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).send("Insufficient or invalid payload.")
  }

  if (typeof content !== "string" || !content.trim()) {
    return res.status(400).send("Insufficient or invalid payload.")
  }

  try {
    const noteTitleExist = await Note.findOne({
      where: { title, userId: req.user?.id },
    })
    if (noteTitleExist) {
      return res.status(400).send("Note title already exist.")
    }

    let createdNote

    if (type === "work") {
      createdNote = await WorkNote.create({
        userId: req.user?.id,
        type: "work",
        title,
        content,
      })
    } else if (type === "personal") {
      createdNote = await PersonalNote.create({
        userId: req.user?.id,
        type: "personal",
        title,
        content,
      })
    } else {
      throw new Error("Invalid note type.")
    }

    return res.json({
      id: createdNote.id,
    })
  } catch (err: any) {
    console.log(err)
    return res.status(400).send("Note creation failed.")
  }
})

// Update Note
router.patch("/:noteId/update", async (req, res): Promise<any> => {
  const { noteId } = req.params
  const { type, title, content } = req.body
  const validNoteType = ["work", "personal"]

  if (typeof type !== "string" || !validNoteType.includes(type)) {
    return res.status(400).send("Insufficient or invalid payload.")
  }

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).send("Insufficient or invalid payload.")
  }

  if (typeof content !== "string" || !content.trim()) {
    return res.status(400).send("Insufficient or invalid payload.")
  }

  if (!noteId || typeof noteId !== "string" || isNaN(Number(noteId))) {
    return res.status(400).send("Insufficient or invalid payload.")
  }

  try {
    const noteBelongToUser = await Note.findOne({
      where: { id: noteId, userId: req.user?.id },
    })

    if (!noteBelongToUser) {
      throw new Error(
        "User trying to update a note that does not belong to them or Note not found."
      )
    }

    await Note.update(
      {
        title,
        content,
        type,
      },
      {
        where: {
          id: noteId,
          userId: req.user?.id,
        },
      }
    )

    return res.status(200).send("Note updated.")
  } catch (err: any) {
    console.log(err)
    return res.status(400).send("Note update failed.")
  }
})

// Delete Note
router.delete("/:noteId/delete", async (req, res): Promise<any> => {
  const { noteId } = req.params

  if (!noteId || typeof noteId !== "string" || isNaN(Number(noteId))) {
    return res.status(400).send("Insufficient or invalid payload.")
  }

  try {
    const noteBelongToUser = await Note.findOne({
      where: { id: noteId, userId: req.user?.id },
    })

    if (!noteBelongToUser) {
      throw new Error(
        "User trying to delete a note that does not belong to them or Note not found."
      )
    }

    await Note.destroy({
      where: { id: noteId, userId: req.user?.id },
    })

    return res.status(200).send("Note deleted.")
  } catch (err: any) {
    console.log(err)
    return res.status(400).send("Note deletion failed.")
  }
})

export default router

async function cacheProcess(
  req: Express.Request,
  noteId: string,
  noteDetail: { type: string; title: string; content: string }
) {
  try {
    const now = new Date()
    const timeBefore = new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day before

    const previousAccess = await NoteAccess.findAll({
      where: {
        noteId: noteId,
        createdAt: {
          [Op.between]: [timeBefore, now],
        },
      },
    })

    // If the note is accessed more than 5 times in a day
    // Cache it
    if (previousAccess.length >= 5) {
      await req.redis.set(
        `note:${req.user.id}:${noteId}`,
        JSON.stringify(noteDetail),
        {
          EX: 60 * 60 * 24, // Cachce for a day
        }
      )
    }
  } catch (err: any) {
    console.log(err)
  }
}
