// Description: This file contains the queries for the database.
const { PrismaClient } = require('@prisma/client')
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

const getFiles = async (userid) => {
    const files = await prisma.file.findMany({
        where: {
        authorId: userid,
        },
    })
    return files
}

module.exports = {
  createUser,
  getFiles
}
