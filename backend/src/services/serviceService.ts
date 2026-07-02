import EmergencyService from '../models/EmergencyService';

class ServiceService {
  async getNearbyServices(lat: number, lng: number, maxDistance: number = 5000, type?: string) {
    const query: any = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: maxDistance
        }
      }
    };
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    return await EmergencyService.find(query);
  }

  async getAllServices(type?: string) {
    const query: any = {};
    if (type && type !== 'all') {
      query.type = type;
    }
    return await EmergencyService.find(query);
  }

  async createService(serviceData: any) {
    return await EmergencyService.create(serviceData);
  }

  async updateService(id: string, serviceData: any) {
    return await EmergencyService.findByIdAndUpdate(id, serviceData, {
      new: true,
      runValidators: true
    });
  }

  async deleteService(id: string) {
    return await EmergencyService.findByIdAndDelete(id);
  }
}

export default new ServiceService();
