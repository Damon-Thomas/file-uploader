// Description: This file contains the queries for the database.
const { PrismaClient, Prisma } = require('@prisma/client')
const { use } = require('passport')
const prisma = new PrismaClient()

const createUser = async (username, password) => {
  try {
    const user = await prisma.user.create({
      data: {
        username,
        password,
      },
    });
    return user;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Handle unique constraint violation
        throw new Error('Username already exists');
      }
    }
    // Handle other errors
    throw error;
  }
};

const saveFile = async (filename, authorId, fileLink, size, folderId, filePath) => {
  console.log('in saveFile', 'shareLink Final:', fileLink);
    const file = await prisma.file.create({
        data: {
            filename: filename,
            size: size,
            content: fileLink,
            filePath: filePath,
            author: {
                connect: { id: authorId },
            },
            folder: {
                connect: { id: folderId }, 
            },
            
        },
    })
    return file
}

const deleteFile = async (fileId) => {
  try {
    await prisma.file.delete({
        where: {
            id: fileId,
        },
    })
  }
  catch (error) {
    console.error('Error deleting file:', error)
  }
}

const getFiles = async (userid) => {
    const files = await prisma.file.findMany({
        where: {
        authorId: userid,
        },
    })
    return files
}

const getFilesByFolder = async (userid, folderId) => {
    const files = await prisma.file.findMany({
        where: {
        authorId: userid,
        folderId: folderId,
        },
    })
    return files
}

const getFolders = async (userid) => {
  const folders = await prisma.folder.findMany({
    where: {
      authorId: userid,
    },
    orderBy: {
      foldername: 'asc',
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

const getFolderById = async (folderId) => {
  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId,
    },
  })
  return folder
}

const getFileById = async (fileId) => {
  const file = await prisma.file.findUnique({
    where: {
      id: fileId,
    },
  })
  return file}

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
    await deleteFilesInFolder(folderId)
    await prisma.folder.delete({
      where: {
        id: folderId,
      },
    })}

    const updateFolderName = async (folderId, folderName) => {
      const updatedFolder = await prisma.folder.update({
        where: { id: folderId },
        data: { foldername: folderName },
      });
      return updatedFolder;
    };

  

   

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
  updateFolderName,
  getFolderById,
  getFilesByFolder,
  getFileById,
  
}
