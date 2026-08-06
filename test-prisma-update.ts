import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const po = await prisma.purchaseOrder.create({
    data: {
      projectId: "test_project",
      status: "draft"
    }
  });
  console.log("Created PO:", po.id);
  
  const updatedPo = await prisma.purchaseOrder.update({
    where: { id: po.id },
    data: {
      status: "approved",
      approvedBy: "demo-user",
      approvedAt: Date.now()
    }
  });
  console.log("Updated PO:", updatedPo.id, "approvedBy:", updatedPo.approvedBy);
  
  await prisma.purchaseOrder.delete({ where: { id: po.id } });
}
main().catch(console.error).finally(() => prisma.$disconnect());
