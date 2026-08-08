import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
// Trigger reload 5
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
  supplierBills: 'supplierBill',
  supplierPayments: 'supplierPayment',
  supplierProducts: 'supplierProduct',
  supplierDocuments: 'supplierDocument',
  supplierNotes: 'supplierNote',
  inventoryItems: 'inventoryItem',
  inventoryMaterials: 'inventoryItem',
  inventoryStockIn: 'inventoryStockIn',
  inventoryStockOut: 'inventoryStockOut',
  clientInvoices: 'clientInvoice',
  workerAdvances: 'workerAdvance',
  workerSalaryPayments: 'workerSalaryPayment',
  workerAttendance: 'workerAttendance',
  workerTransfers: 'workerTransfer',
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
    
    const cleanFilter = { ...filter };
    if (cleanFilter.parentId) {
      const modelName = MODEL_MAP[collection] || collection;
      const isProjectNested = ['projectMilestone', 'materialRequest', 'purchaseOrder', 'goodsReceipt', 'clientInvoice', 'assignment', 'materialLog', 'siteSettlement', 'siteDiary', 'projectProgress', 'equipmentLog'].includes(modelName);
      
      if (isProjectNested) {
        cleanFilter.projectId = cleanFilter.parentId;
      }
      delete cleanFilter.parentId;
    }

    return model.findMany({
      where: cleanFilter,
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
    delete cleanData.parentId;
    
    for (const key of ['rate', 'amount', 'quantity', 'total', 'paid', 'due', 'price', 'value', 'balance', 'openingBalance']) {
      if (cleanData[key] !== undefined && cleanData[key] !== null) {
        cleanData[key] = Number(cleanData[key]);
      }
    }
    
    const modelName = MODEL_MAP[collection] || collection;
    if (modelName !== 'supplier' && modelName !== 'user') {
      delete cleanData.tenantId;
    }
    if (modelName !== 'supplier') {
      delete cleanData.source;
    }
    if (modelName === 'inventoryItem') {
      delete cleanData.status;
      delete cleanData.createdBy;
      delete cleanData.updatedBy;
    }
    if (modelName === 'worker') {
      delete cleanData.updatedBy;
      delete cleanData.createdBy;
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
    delete cleanData.parentId;
    
    for (const key of ['rate', 'amount', 'quantity', 'total', 'paid', 'due', 'price', 'value', 'balance', 'openingBalance']) {
      if (cleanData[key] !== undefined && cleanData[key] !== null) {
        cleanData[key] = Number(cleanData[key]);
      }
    }
    
    const modelName = MODEL_MAP[collection] || collection;
    if (modelName !== 'supplier' && modelName !== 'user') {
      delete cleanData.tenantId;
    }
    if (modelName !== 'supplier') {
      delete cleanData.source;
    }
    if (modelName === 'inventoryItem') {
      delete cleanData.status;
      delete cleanData.createdBy;
      delete cleanData.updatedBy;
    }
    if (modelName === 'worker') {
      delete cleanData.updatedBy;
      delete cleanData.createdBy;
    }
    
    try {
      return await model.update({
        where: { id },
        data: cleanData,
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        try {
          return await model.create({
            data: { id, ...cleanData }
          });
        } catch (createError: any) {
          require('fs').appendFileSync('/tmp/backend-error.log', JSON.stringify({ action: "update_create", collection, id, cleanData, error: createError.message }) + '\n');
          throw createError;
        }
      }
      require('fs').appendFileSync('/tmp/backend-error.log', JSON.stringify({ action: "update", collection, id, cleanData, error: error.message }) + '\n');
      throw error;
    }
  }

  async remove(collection: string, id: string) {
    const model = this.getModel(collection);
    if (!model) return { id };
    return model.delete({ where: { id } });
  }
}
