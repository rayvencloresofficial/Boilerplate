import type { Request, Response, NextFunction } from 'express';
import * as cryptoService from '../services/crypto.service.js';
import type { ApiResponse } from '../types/api.js';

export const encryptData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data } = req.body;
    const result = cryptoService.encryptPayload(data);

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
      message: 'Data encrypted successfully.',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const decryptData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { ciphertext } = req.body;
    const result = cryptoService.decryptPayload(ciphertext);

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
      message: 'Data decrypted successfully.',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
