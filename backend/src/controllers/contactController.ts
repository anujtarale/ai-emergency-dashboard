import { Request, Response, NextFunction } from 'express';
import * as contactService from '../services/contactService';
import logger from '../utils/logger';
import ApiError from '../utils/apiError';

export const getContacts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contacts = await contactService.getContacts(req.user._id);
    
    res.status(200).json({
      success: true,
      data: contacts
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const addContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = await contactService.addContact(req.user._id, req.body);
    
    res.status(201).json({
      success: true,
      data: contact
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const updateContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = await contactService.updateContact(
      req.user._id,
      req.params.id,
      req.body
    );
    
    if (!contact) {
      return next(new ApiError('Contact not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const deleteContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await contactService.deleteContact(req.user._id, req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};
