
/// On initalise notre base de données
const { PrismaClient } = require ('@prisma/client')
const prisma = new PrismaClient()

module.exports = { prisma }