import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const mr = await prisma.materialRequest.findFirst();
  if (mr) {
    try {
      const updated = await prisma.materialRequest.update({
        where: { id: mr.id },
        data: {
          poId: "12345"
        }
      });
      console.log("Success update MR:", updated.poId);
    } catch (e) {
      console.error(e);
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
