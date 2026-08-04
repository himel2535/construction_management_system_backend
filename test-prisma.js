const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const res = await prisma.siteInCharge.create({
      data: {
        name: "Test User",
        phone: "",
        address: "",
        nid: "",
        status: "active",
        monthlyRate: 0,
        notes: "",
      }
    });
    console.log("Success:", res);
  } catch (err) {
    console.error("Prisma error:", err);
  } finally {
    await prisma.$disconnect();
  }
}
main();
