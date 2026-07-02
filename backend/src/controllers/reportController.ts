import { Request, Response, NextFunction } from 'express';
import * as reportService from '../services/reportService';
import { logAuditFromRequest } from '../services/auditService';
import { AuditAction } from '../types';
import logger from '../utils/logger';
import ApiError from '../utils/apiError';

export const createReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`[Report] Creating emergency report for user: ${req.user._id}`);
    const report = await reportService.createReport(req.user._id, req.body);
    const reportId = (report as any)?._id || (report as any)?.id || 'unknown';
    logger.info(`[Report] Report created successfully: ${reportId}`, {
      userId: req.user._id,
      reportId,
      type: report.type,
      severity: report.severity,
      location: (report as any)?.location || report.location
    });

    // Log audit event
    await logAuditFromRequest(req, AuditAction.EMERGENCY_REPORT_CREATED, {
      reportId,
      type: report.type,
      severity: report.severity,
      location: report.location,
      title: report.title
    });
    
    const io = req.app.get('io');
    if (io) {
      logger.info(`[Report] Broadcasting new-report to admin-dashboard room`, {
        reportId,
        timestamp: new Date().toISOString()
      });
      io.to('admin-dashboard').emit('new-report', report);
    }
    
    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error: any) {
    logger.error(`[Report] Error creating report:`, error);
    next(error);
  }
};

export const getReportById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await reportService.getReportById(req.params.id);
    
    if (!report) {
      return next(new ApiError('Report not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const getUserReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reports = await reportService.getUserReports(req.user._id);
    
    res.status(200).json({
      success: true,
      data: reports
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const updateReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let report;
    if (req.user.role === 'admin' || req.user.role === 'moderator') {
      report = await reportService.adminUpdateReport(req.params.id, req.body);

      // Log admin audit event
      await logAuditFromRequest(req, AuditAction.EMERGENCY_REPORT_UPDATED, {
        reportId: req.params.id,
        updateData: req.body
      });

      const io = req.app.get('io');
      if (io && report) {
        io.to('admin-dashboard').emit('report-updated', report);
      }
    } else {
      report = await reportService.updateReport(
        req.user._id,
        req.params.id,
        req.body
      );
    }
    
    if (!report) {
      return next(new ApiError('Report not found or unauthorized to update', 404));
    }
    
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const deleteReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await reportService.deleteReport(req.user._id, req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const getAllReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reports = await reportService.getAllReports();
    
    res.status(200).json({
      success: true,
      data: reports
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const getNearbyReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng, maxDistance } = req.query;
    
    if (!lat || !lng) {
      return next(new ApiError('Latitude and longitude are required', 400));
    }

    const reports = await reportService.getNearbyReports(
      parseFloat(lat as string),
      parseFloat(lng as string),
      maxDistance ? parseFloat(maxDistance as string) : 10000
    );
    
    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};
