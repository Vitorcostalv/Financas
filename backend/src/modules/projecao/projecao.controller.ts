import { Request, Response } from "express";
import { AppError } from "../../utils/errors";
import { sendResponse } from "../../utils/response";
import { ProjecaoService } from "./projecao.service";

export class ProjecaoController {
  static async mensal(req: Request, res: Response) {
    const userId = req.userId ?? req.user?.id;

    if (!userId) {
      throw new AppError("Nao autorizado", 401);
    }

    const { startMonth, startYear, months } = req.query as unknown as {
      startMonth: number;
      startYear: number;
      months: number;
    };

    const data = await ProjecaoService.mensal(
      userId,
      startMonth,
      startYear,
      months
    );

    return sendResponse(res, 200, "Projecao gerada com sucesso.", data);
  }
}
