import swaggerJsdoc from 'swagger-jsdoc';
import config from './index';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Emergency Assistant Dashboard API',
      version: '1.0.0',
      description: 'Production-ready API for AI Emergency Assistant Dashboard'
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/${config.apiVersion}`
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['src/routes/*.ts']
};

const specs = swaggerJsdoc(options);

export default specs;
