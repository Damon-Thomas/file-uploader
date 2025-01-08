// Description: This file contains the queries for the database.
const { PrismaClient } = require('@prisma/client')
const { use } = require('passport')
const prisma = new PrismaClient()

const createUser = async (username, password) => {
  const user = await prisma.user.create({
    data: {
      username,
      password,
    },
  })
  return user
}

const saveFile = async (filename, authorId, fileContent) => {
    const file = await prisma.file.create({
        data: {
            filename: filename,
            content: fileContent,
            author: {
                connect: { id: authorId },
            }
            
        },
    })
    return file
}

const deleteFile = async (fileId) => {
    await prisma.file.delete({
        where: {
            id: fileId,
        },
    })
}

const getFiles = async (userid) => {
    const files = await prisma.file.findMany({
        where: {
        authorId: userid,
        },
    })
    return files
}

const getFolders = async (userid) => {
  const folders = await prisma.folder.findMany({
    where: {
      authorId: userid,
    },
  })
  return folders
}

const addFolder = async (foldername, authorId) => {
  let folder = await prisma.folder.create({
    data: {
      foldername: foldername,
    author: {
            // create: UserCreateWithoutFolderInput | UserUncheckedCreateWithoutFolderInput,
            // connectOrCreate: UserCreateOrConnectWithoutFolderInput,
            connect: {id: authorId}
           }
    }  
  })
  return folder
}

  const editFolder = async (folderId, foldername) => {
    await prisma.folder.update({
      where: {
        id: folderId,
      },
      data: {
        foldername: foldername,
      },
    })
  }

  const getFolderFiles = async (folderId) => {
    const files = await prisma.file.findMany({
      where: {
        folderId: folderId,
      },
    })
    return files
  }

  const deleteFilesInFolder = async (folderId) => {
    await prisma.file.deleteMany({
      where: {
        folderId: folderId,
      },
    })
  }

  const deleteFolder = async (folderId) => {
    deleteFilesInFolder(folderId)
    await prisma.folder.delete({
      where: {
        id: folderId,
      },
    })}

module.exports = {
  createUser,
  getFiles,
  saveFile,
  getFolders,
  addFolder,
  getFolderFiles,
  editFolder,
  deleteFolder,
  deleteFile,
}
