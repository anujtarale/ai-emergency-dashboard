import { Request, Response, NextFunction } from 'express';
import serviceService from '../services/serviceService';
import { protect, authorize } from '../middleware/auth';
import logger from '../utils/logger';
import ApiError from '../utils/apiError';

export const getNearbyServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng, maxDistance, type } = req.query;
    
    if (!lat || !lng) {
      return next(new ApiError('Latitude and longitude are required', 400));
    }

    const services = await serviceService.getNearbyServices(
      parseFloat(lat as string),
      parseFloat(lng as string),
      maxDistance ? parseFloat(maxDistance as string) : 5000,
      type as string
    );

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    logger.error('Get nearby services error:', error);
    next(error);
  }
};

export const getAllServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.query;
    const services = await serviceService.getAllServices(type as string);

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    logger.error('Get all services error:', error);
    next(error);
  }
};

export const createService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = await serviceService.createService(req.body);

    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    logger.error('Create service error:', error);
    next(error);
  }
};

export const updateService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = await serviceService.updateService(req.params.id, req.body);

    if (!service) {
      return next(new ApiError('Service not found', 404));
    }

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    logger.error('Update service error:', error);
    next(error);
  }
};

export const deleteService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = await serviceService.deleteService(req.params.id);

    if (!service) {
      return next(new ApiError('Service not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    logger.error('Delete service error:', error);
    next(error);
  }
};
