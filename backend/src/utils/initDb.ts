import User from '../models/User';
import Feature from '../models/Feature';
import SystemSetting from '../models/SystemSetting';
import config from '../config';
import { UserRole } from '../types';
import logger from './logger';

export const initializeDatabase = async () => {
  try {
    logger.info('Initializing emergency system database seeding...');

    // 1. Seed Default Admin Account
    const adminEmail = config.admin.email;
    const adminPassword = config.admin.password;

    if (!adminEmail || !adminPassword) {
      logger.warn('⚠️ Admin email or password not configured in environment variables.');
    } else {
      const adminExists = await User.findOne({ email: adminEmail.toLowerCase() });
      if (!adminExists) {
        logger.info(`Seeding default admin user: ${adminEmail}`);
        await User.create({
          name: 'System Admin',
          email: adminEmail.toLowerCase(),
          password: adminPassword,
          role: UserRole.ADMIN,
          isEmailVerified: true
        });
        logger.info('✅ Default admin user created successfully.');
      } else {
        logger.info('Admin user already exists.');
        // Ensure admin user role is indeed ADMIN
        if (adminExists.role !== UserRole.ADMIN) {
          adminExists.role = UserRole.ADMIN;
          await adminExists.save();
          logger.info('Updated existing user role to admin.');
        }
      }
    }

    // 2. Seed Default Feature Flags
    const defaultFeatures = [
      { name: 'sos', displayName: 'Emergency SOS', isEnabled: true },
      { name: 'ai-assistant', displayName: 'AI Assistant', isEnabled: true },
      { name: 'live-map', displayName: 'Live Map', isEnabled: true },
      { name: 'nearby-services', displayName: 'Nearby Services', isEnabled: true },
      { name: 'community-reports', displayName: 'Community Reports', isEnabled: true },
      { name: 'safety-alerts', displayName: 'Safety Alerts', isEnabled: true },
      { name: 'analytics', displayName: 'Analytics', isEnabled: true }
    ];

    for (const feat of defaultFeatures) {
      const existing = await Feature.findOne({ name: feat.name });
      if (!existing) {
        await Feature.create(feat);
        logger.info(`Seeded feature flag: ${feat.name}`);
      }
    }
    logger.info('✅ Feature flags verified.');

    // 3. Seed Default System Settings
    const settingsCount = await SystemSetting.countDocuments();
    if (settingsCount === 0) {
      await SystemSetting.create({
        maintenanceMode: false,
        enableNotifications: true,
        systemLogLevel: 'info',
        backupInterval: 'weekly'
      });
      logger.info('✅ Seeded default system settings.');
    } else {
      logger.info('System settings already initialized.');
    }

    logger.info('🎉 Emergency database seeding completed successfully.');
  } catch (error) {
    logger.error('❌ Error initializing database:', error);
  }
};
