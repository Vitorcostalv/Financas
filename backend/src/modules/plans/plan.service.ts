import { prisma } from "../../utils/prisma";
import { AppError } from "../../utils/errors";
import { splitInstallmentsExact } from "../../shared/utils/money";

type PlanItemInput = {
  name: string;
  description: string;
  amountCents: number;
  purchaseType: "ONE_TIME" | "INSTALLMENTS";
  dueDate?: Date;
  installmentsCount?: number;
  firstInstallmentDate?: Date;
  entryAmountCents?: number;
};

export class PlanService {
  static async create(
    userId: string,
    data: {
      title: string;
      description: string;
      minBudgetCents?: number;
      maxBudgetCents?: number;
      status?: string;
      items?: PlanItemInput[];
    }
  ) {
    return prisma.$transaction(async (tx) => {
      const plan = await tx.plan.create({
        data: {
          title: data.title,
          description: data.description,
          minBudgetCents: data.minBudgetCents,
          maxBudgetCents: data.maxBudgetCents,
          status: data.status ?? "ACTIVE",
          userId
        }
      });

      if (data.items?.length) {
        for (const item of data.items) {
          const planItem = await tx.planItem.create({
            data: {
              planId: plan.id,
              name: item.name,
              description: item.description,
              amountCents: item.amountCents,
              purchaseType: item.purchaseType,
              dueDate: item.dueDate,
              installmentsCount: item.installmentsCount,
              firstInstallmentDate: item.firstInstallmentDate,
              entryAmountCents: item.entryAmountCents
            }
          });

          if (item.purchaseType === "INSTALLMENTS") {
            if (!item.installmentsCount || !item.firstInstallmentDate) {
              throw new AppError("Dados de parcelamento invalidos.", 400);
            }

            const entryAmount = item.entryAmountCents ?? 0;
            const remaining = item.amountCents - entryAmount;

            if (remaining < 0) {
              throw new AppError("Valor de entrada nao pode exceder o total.", 400);
            }

            const installments = splitInstallmentsExact(
              remaining,
              item.installmentsCount
            );

            const installmentsToCreate: {
              installmentNumber: number;
              dueDate: Date;
              amountCents: number;
              status: string;
              planItemId: string;
            }[] = [];

            if (entryAmount > 0) {
              installmentsToCreate.push({
                installmentNumber: 1,
                dueDate: item.firstInstallmentDate,
                amountCents: entryAmount,
                status: "PENDING",
                planItemId: planItem.id
              });
            }

            installments.forEach((amountCents, index) => {
              const dueDate = new Date(item.firstInstallmentDate as Date);
              const offset = entryAmount > 0 ? index + 1 : index;
              dueDate.setMonth(dueDate.getMonth() + offset);

              installmentsToCreate.push({
                installmentNumber: entryAmount > 0 ? index + 2 : index + 1,
                dueDate,
                amountCents,
                status: "PENDING",
                planItemId: planItem.id
              });
            });

            if (installmentsToCreate.length) {
              await tx.installment.createMany({
                data: installmentsToCreate
              });
            }
          }
        }
      }

      return plan;
    });
  }

  static async list(userId: string) {
    return prisma.plan.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            installments: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  static async getById(userId: string, id: string) {
    const plan = await prisma.plan.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: {
            installments: true
          }
        }
      }
    });

    if (!plan) {
      throw new AppError("Plano nao encontrado", 404);
    }

    return plan;
  }

  static async update(
    userId: string,
    id: string,
    data: {
      title?: string;
      description?: string;
      minBudgetCents?: number;
      maxBudgetCents?: number;
      status?: string;
    }
  ) {
    const existing = await prisma.plan.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      throw new AppError("Plano nao encontrado", 404);
    }

    return prisma.plan.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        minBudgetCents: data.minBudgetCents,
        maxBudgetCents: data.maxBudgetCents,
        status: data.status
      }
    });
  }

  static async delete(userId: string, id: string) {
    const existing = await prisma.plan.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      throw new AppError("Plano nao encontrado", 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.installment.deleteMany({
        where: { planItem: { planId: id } }
      });

      await tx.planItem.deleteMany({
        where: { planId: id }
      });

      await tx.plan.delete({
        where: { id }
      });
    });
  }
}
