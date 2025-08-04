const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkResourceTypes() {
  const resourceTypes = await prisma.resourceType.findMany();
  console.log('Existing Resource Types:');
  resourceTypes.forEach(rt => {
    console.log(`- ${rt.slug}: ${rt.name}`);
  });
  await prisma.$disconnect();
}

checkResourceTypes();