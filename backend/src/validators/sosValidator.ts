import { body } from 'express-validator';

export const createSOSValidator = [
  body('latitude')
    .notEmpty().withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude (must be between -90 and 90)'),
  body('longitude')
    .notEmpty().withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude (must be between -180 and 180)'),
  body('address')
    .optional()
    .isString()
    .trim()
    .withMessage('Address must be a string'),
  body('emergencyType')
    .optional()
    .isString()
    .trim()
    .withMessage('Emergency type must be a string'),
  body('description')
    .optional()
    .isString()
    .trim()
    .withMessage('Description must be a string')
];
