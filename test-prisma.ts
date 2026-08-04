import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const aq = await prisma.approvalQueueRow.create({
    data: {
      entityType: "test",
      entityId: "123",
      title: "test",
      path: "test/123",
      submittedAt: Date.now()
    }
  });
  console.log("Success ApprovalQueueRow:", aq.id);
  await prisma.approvalQueueRow.delete({ where: { id: aq.id } });
}
main().catch(console.error).finally(() => prisma.$disconnect());
