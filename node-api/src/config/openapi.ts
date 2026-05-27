import swaggerJsdoc, { type Options } from 'swagger-jsdoc';
import path from 'path';

const swaggerOptions: Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'MSC-SOCCER-PROJECT API',
            version: '1.0.0',
            description: 'API for football player management and performance analytics',
            contact: {
                name: 'Pablo Gomez',
                email: 'pgr866@inlumine.ual.es'
            }
        },
        tags: [
            { name: 'Locations', description: 'Operations related to locations' },
            { name: 'Reviews', description: 'Operations related to location reviews' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            },
            schemas: {
                Location: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        id: { type: 'string', description: 'Auto-generated ID' },
                        name: { type: 'string', description: 'Name of the location' },
                        address: { type: 'string', description: 'Physical address' },
                        reviews: { type: 'array', items: { $ref: '#/components/schemas/Review' } }
                        // date: { type: 'string', format: 'date', description: 'Location date' },
                    },
                    example: {
                        id: '60c72b2f9b1d8e5a5c8f9b1a',
                        name: 'Central Park',
                        address: 'New York, NY 10022',
                        reviews: [
                            {
                                id: '60c72b2f9b1d8e5a5c8f9b1b',
                                author: 'John Doe',
                                rating: 5,
                                reviewText: 'Great place to visit!'
                            }
                        ]
                    }
                },
                Review: {
                type: 'object',
                required: ['author', 'rating', 'reviewText'],
                    properties: {
                        id: { type: 'string' },
                        author: { type: 'string' },
                        rating: { type: 'integer', minimum: 0, maximum: 5 },
                        reviewText: { type: 'string', maxLength: 1000 },
                    },
                    example: {
                        id: '60c72b2f9b1d8e5a5c8f9b1b',
                        author: 'John Doe',
                        rating: 5,
                        reviewText: 'Great place to visit!'
                    }
                }
            }
        }
    },
    apis: [
        path.join(process.cwd(), 'src/controllers/*.{js,ts}'),
        path.join(process.cwd(), 'dist/src/controllers/*.{js,ts}'),
    ],
};

export const swaggerDocs = swaggerJsdoc(swaggerOptions);
