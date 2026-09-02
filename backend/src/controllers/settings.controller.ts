import type { Request, Response, NextFunction } from 'express';
import * as settingsService from '../services/settings.service.js';
import type { ApiResponse } from '../types/api.js';

export const getSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { category, is_public } = req.query as {
      category?: string;
      is_public?: boolean;
    };
    const settings = await settingsService.listSettings({ category, is_public });

    const response: ApiResponse<typeof settings> = {
      success: true,
      data: settings,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getPublicSettings = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const settings = await settingsService.listPublicSettings();

    const response: ApiResponse<typeof settings> = {
      success: true,
      data: settings,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getSettingByKey = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { key } = req.params as { key: string };
    const setting = await settingsService.getSettingByKey(key);

    const response: ApiResponse<typeof setting> = {
      success: true,
      data: setting,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const createSetting = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { key, value, category, description, is_public } = req.body;
    const created = await settingsService.createSetting({
      key,
      value,
      category,
      description,
      is_public,
    });

    const response: ApiResponse<typeof created> = {
      success: true,
      data: created,
      message: 'Setting created successfully.',
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateSetting = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { key } = req.params as { key: string };
    const { value, category, description, is_public } = req.body;

    const updated = await settingsService.updateSetting(key, {
      value,
      category,
      description,
      is_public,
    });

    const response: ApiResponse<typeof updated> = {
      success: true,
      data: updated,
      message: 'Setting updated successfully.',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteSetting = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { key } = req.params as { key: string };
    await settingsService.deleteSetting(key);

    const response: ApiResponse<null> = {
      success: true,
      message: 'Setting deleted successfully.',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
