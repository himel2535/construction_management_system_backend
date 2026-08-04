import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
// Trigger reload
import { PrismaService } from '../prisma/prisma.service';

const MODEL_MAP: Record<string, string> = {
  projects: 'project',
  clients: 'clientRecord',
  clientRecords: 'clientRecord',
  milestones: 'projectMilestone',
  projectMilestones: 'projectMilestone',
  materialRequests: 'materialRequest',
  purchaseOrders: 'purchaseOrder',
  goodsReceipts: 'goodsReceipt',
  suppliers: 'supplier',
  inventoryItems: 'inventoryItem',
  clientInvoices: 'clientInvoice',
  approvalQueue: 'approvalQueueRow',
  approvalQueueRows: 'approvalQueueRow',
  siteInCharges: 'siteInCharge',
  assignments: 'assignment',
  siteInChargeAssignments: 'assignment',
  materialLogs: 'materialLog',
  siteMaterialLogs: 'materialLog',
  siteSettlements: 'siteSettlement',
  siteDiaries: 'siteDiary',
  workers: 'worker',
  payrollEntries: 'payrollEntry',
  companyProfile: 'companyProfile',
  users: 'user',
  projectProgress: 'projectProgress',
  equipmentLogs: 'equipmentLog',
};

@Injectable()
export class ApiService {
  constructor(private prisma: PrismaService) {}

  private getModel(collection: string) {
    const modelName = MODEL_MAP[collection] || collection;
    const model = (this.prisma as any)[modelName];
    return model || null;
  }

  async getList(collection: string, filter: any = {}) {
    const model = this.getModel(collection);
    if (!model) return [];
    return model.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOne(collection: string, id: string) {
    const model = this.getModel(collection);
    if (!model) return null;
    const item = await model.findUnique({ where: { id } });
    return item || null;
  }

  async create(collection: string, data: any) {
    const model = this.getModel(collection);
    if (!model) {
      console.warn(`[Mock Create] Collection not implemented: ${collection}`);
      return { id: data.id || Date.now().toString() };
    }
    const cleanData = { ...data };
    delete cleanData.id;
    delete cleanData.createdAt;
    delete cleanData.updatedAt;
    
    const modelName = MODEL_MAP[collection] || collection;
    if (modelName !== 'supplier' && modelName !== 'user') {
      delete cleanData.tenantId;
    }
    if (modelName !== 'supplier') {
      delete cleanData.source;
    }
    
    try {
      return await model.create({ data: cleanData });
    } catch (error: any) {
      require('fs').appendFileSync('/tmp/backend-error.log', JSON.stringify({ collection, cleanData, error: error.message }) + '\\n');
      throw error;
    }
  }

  async update(collection: string, id: string, data: any) {
    const model = this.getModel(collection);
    if (!model) return { id };
    const cleanData = { ...data };
    delete cleanData.id;
    delete cleanData.createdAt;
    delete cleanData.updatedAt;
    
    const modelName = MODEL_MAP[collection] || collection;
    if (modelName !== 'supplier' && modelName !== 'user') {
      delete cleanData.tenantId;
    }
    if (modelName !== 'supplier') {
      delete cleanData.source;
    }
    
    return model.update({
      where: { id },
      data: cleanData,
    });
  }

  async remove(collection: string, id: string) {
    const model = this.getModel(collection);
    if (!model) return { id };
    return model.delete({ where: { id } });
  }
}
