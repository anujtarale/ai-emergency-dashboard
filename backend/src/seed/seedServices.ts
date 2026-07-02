import mongoose from 'mongoose';
import dotenv from 'dotenv';
import EmergencyService from '../models/EmergencyService';
import config from '../config';
import logger from '../utils/logger';

dotenv.config();

const sampleServices = [
  // ── HOSPITALS ──────────────────────────────────────────────
  {
    type: 'hospital',
    name: 'Ahmedabad Civil Hospital',
    address: 'Asarwa, Ahmedabad, Gujarat',
    phone: '+91 79 2268 1001',
    location: { type: 'Point', coordinates: [72.6020, 23.0339] }
  },
  {
    type: 'hospital',
    name: 'Apollo Hospitals',
    address: 'Plot No. 1A, Bhat GIDC, SG Highway, Ahmedabad',
    phone: '+91 79 6670 1800',
    location: { type: 'Point', coordinates: [72.5263, 23.0872] }
  },
  {
    type: 'hospital',
    name: 'Sterling Hospital',
    address: 'Memnagar Road, Ahmedabad, Gujarat',
    phone: '+91 79 2698 5000',
    location: { type: 'Point', coordinates: [72.5491, 23.0454] }
  },
  {
    type: 'hospital',
    name: 'SAL Hospital',
    address: 'Drive in Road, Ahmedabad, Gujarat',
    phone: '+91 79 2680 0200',
    location: { type: 'Point', coordinates: [72.5460, 23.0530] }
  },
  {
    type: 'hospital',
    name: 'IKDRC (Kidney Disease Research Centre)',
    address: 'Civil Hospital Campus, Asarwa, Ahmedabad',
    phone: '+91 79 2268 3721',
    location: { type: 'Point', coordinates: [72.6042, 23.0368] }
  },
  {
    type: 'hospital',
    name: 'Shalby Hospitals',
    address: 'Opp. Karnavati Club, SG Highway, Ahmedabad',
    phone: '+91 79 4020 3000',
    location: { type: 'Point', coordinates: [72.5190, 23.0375] }
  },
  {
    type: 'hospital',
    name: 'HCG Cancer Centre',
    address: 'Mithakhali, Ahmedabad, Gujarat',
    phone: '+91 79 4040 4040',
    location: { type: 'Point', coordinates: [72.5579, 23.0290] }
  },

  // ── POLICE STATIONS ────────────────────────────────────────
  {
    type: 'police',
    name: 'Ahmedabad Police Headquarters',
    address: 'Shahibaug, Ahmedabad, Gujarat',
    phone: '+91 79 2550 8500',
    location: { type: 'Point', coordinates: [72.6011, 23.0583] }
  },
  {
    type: 'police',
    name: 'Navrangpura Police Station',
    address: 'Navrangpura, Ahmedabad, Gujarat',
    phone: '+91 79 2647 4440',
    location: { type: 'Point', coordinates: [72.5573, 23.0265] }
  },
  {
    type: 'police',
    name: 'Vastrapur Police Station',
    address: 'Vastrapur, Ahmedabad, Gujarat',
    phone: '+91 79 2674 2100',
    location: { type: 'Point', coordinates: [72.5280, 23.0400] }
  },
  {
    type: 'police',
    name: 'Bopal Police Station',
    address: 'Bopal, Ahmedabad, Gujarat',
    phone: '+91 79 2680 2100',
    location: { type: 'Point', coordinates: [72.4670, 23.0355] }
  },
  {
    type: 'police',
    name: 'Maninagar Police Station',
    address: 'Maninagar, Ahmedabad, Gujarat',
    phone: '+91 79 2544 0600',
    location: { type: 'Point', coordinates: [72.6178, 22.9948] }
  },

  // ── FIRE STATIONS ──────────────────────────────────────────
  {
    type: 'fire',
    name: 'Ahmedabad Fire Station – Paldi',
    address: 'Paldi, Ahmedabad, Gujarat',
    phone: '+91 79 2656 0111',
    location: { type: 'Point', coordinates: [72.5634, 23.0097] }
  },
  {
    type: 'fire',
    name: 'Fire Station – Ellisbridge',
    address: 'Ellisbridge, Ahmedabad, Gujarat',
    phone: '+91 79 2657 2101',
    location: { type: 'Point', coordinates: [72.5700, 23.0240] }
  },
  {
    type: 'fire',
    name: 'Fire Station – Bapunagar',
    address: 'Bapunagar, Ahmedabad, Gujarat',
    phone: '+91 79 2281 0101',
    location: { type: 'Point', coordinates: [72.6320, 23.0550] }
  },
  {
    type: 'fire',
    name: 'Fire Station – Sabarmati',
    address: 'Sabarmati, Ahmedabad, Gujarat',
    phone: '+91 79 2760 2101',
    location: { type: 'Point', coordinates: [72.5855, 23.0837] }
  },

  // ── PHARMACIES ─────────────────────────────────────────────
  {
    type: 'pharmacy',
    name: 'Apollo Pharmacy – C.G. Road',
    address: 'C.G. Road, Navrangpura, Ahmedabad',
    phone: '+91 79 2640 2020',
    location: { type: 'Point', coordinates: [72.5629, 23.0155] }
  },
  {
    type: 'pharmacy',
    name: 'MedPlus Pharmacy – Satellite',
    address: 'Satellite Road, Ahmedabad, Gujarat',
    phone: '+91 79 2693 4512',
    location: { type: 'Point', coordinates: [72.5285, 23.0290] }
  },
  {
    type: 'pharmacy',
    name: 'Fortis Pharmacy – SG Highway',
    address: 'SG Highway, Ahmedabad, Gujarat',
    phone: '+91 79 4020 5000',
    location: { type: 'Point', coordinates: [72.5200, 23.0480] }
  },
  {
    type: 'pharmacy',
    name: '1mg Pharmacy – Bopal',
    address: 'Bopal, Ahmedabad, Gujarat',
    phone: '+91 1800 843 0304',
    location: { type: 'Point', coordinates: [72.4720, 23.0330] }
  },
  {
    type: 'pharmacy',
    name: 'PharmEasy Pharmacy – Nikol',
    address: 'Nikol, Ahmedabad, Gujarat',
    phone: '+91 79 2281 9999',
    location: { type: 'Point', coordinates: [72.6450, 23.0510] }
  },
  {
    type: 'pharmacy',
    name: 'Netmeds Pharmacy – Bapunagar',
    address: 'Bapunagar, Ahmedabad, Gujarat',
    phone: '+91 79 2281 0101',
    location: { type: 'Point', coordinates: [72.6320, 23.0530] }
  },
  {
    type: 'pharmacy',
    name: 'Apollo Pharmacy – Nikol Ring Road',
    address: 'Nikol Ring Road, Ahmedabad, Gujarat',
    phone: '+91 79 2282 3030',
    location: { type: 'Point', coordinates: [72.6510, 23.0490] }
  },
  {
    type: 'pharmacy',
    name: 'Wellness Forever – Vastrapur',
    address: 'Vastrapur, Ahmedabad, Gujarat',
    phone: '+91 79 2680 1212',
    location: { type: 'Point', coordinates: [72.5350, 23.0380] }
  },

  // ── SHELTERS ───────────────────────────────────────────────
  {
    type: 'shelter',
    name: 'Ahmedabad Emergency Shelter – Vastrapur',
    address: 'Vastrapur, Ahmedabad, Gujarat',
    phone: '+91 79 2675 0000',
    location: { type: 'Point', coordinates: [72.5470, 23.0258] }
  },
  {
    type: 'shelter',
    name: 'Red Cross Emergency Shelter',
    address: 'Usmanpura, Ahmedabad, Gujarat',
    phone: '+91 79 2754 5200',
    location: { type: 'Point', coordinates: [72.5809, 23.0582] }
  },
  {
    type: 'shelter',
    name: 'AMC Relief Centre – Chandkheda',
    address: 'Chandkheda, Ahmedabad, Gujarat',
    phone: '+91 79 2760 1234',
    location: { type: 'Point', coordinates: [72.5932, 23.1075] }
  },
  {
    type: 'shelter',
    name: 'Disaster Management Shelter – Narol',
    address: 'Narol, Ahmedabad, Gujarat',
    phone: '+91 79 2573 0100',
    location: { type: 'Point', coordinates: [72.6418, 22.9640] }
  }
];

const seedServices = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    logger.info('MongoDB connected');

    await EmergencyService.deleteMany({});
    logger.info('Old services cleared');

    await EmergencyService.insertMany(sampleServices);
    logger.info(`${sampleServices.length} emergency services seeded successfully!`);

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedServices();
