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
            { name: 'Players', description: 'Operations related to football players' },
            { name: 'Comments', description: 'Operations related to player comments' },
            { name: 'Dream Teams', description: 'Operations related to ideal football teams' }
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
                Player: {
                    type: 'object',
                    required: ['id', 'name', 'latitude', 'longitude', 'created_at'],
                    properties: {
                        id: { type: 'string', description: 'Auto-generated ID' },
                        name: { type: 'string', description: 'Name of the player', maxLength: 100 },
                        firstName: { type: 'string', maxLength: 100 },
                        lastName: { type: 'string', maxLength: 100 },
                        age: { type: 'integer', minimum: 0 },
                        birthdate: { type: 'string', format: 'date' },
                        nationality: { type: 'string', maxLength: 100 },
                        height: { type: 'number', format: 'float' },
                        weight: { type: 'number', format: 'float' },
                        number: { type: 'integer', minimum: 0, maximum: 99 },
                        team: { type: 'string', maxLength: 150 },
                        league: { type: 'string', maxLength: 150 },
                        position: { type: 'string', maxLength: 50 },
                        photoUrl: { type: 'string', maxLength: 255 },
                        latitude: { type: 'number', format: 'float', minimum: -90, maximum: 90 },
                        longitude: { type: 'number', format: 'float', minimum: -180, maximum: 180 },
                        createdAt: { type: 'string', format: 'date-time' }
                    },
                    example: {
                        id: "1", name: "Neymar", firstName: "Neymar", lastName: "da Silva Santos Júnior",
                        age: 34, birthdate: "1992-02-05", nationality: "Brazil", height: 1.75, weight: 68,
                        number: 10, team: "Santos", league: "Serie A", position: "Attacker",
                        photoUrl: "https://media.api-sports.io/football/players/276.png", latitude: -23.944841,
                        longitude: -46.330376, createdAt: "2026-05-27T12:00:00Z"
                    }
                },
                PlayerSummary: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        position: { type: 'string' },
                        team: { type: 'string' },
                        league: { type: 'string' },
                        age: { type: 'integer' },
                        height: { type: 'number', format: 'float' },
                        weight: { type: 'number', format: 'float' }
                    },
                    example: {
                        id: "1", name: "Neymar", position: "Attacker", team: "Santos", league: "Serie A",
                        age: 34, height: 1.75, weight: 68
                    }
                },
                PlayerName: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' }
                    },
                    example: {
                        id: "1",
                        name: "Neymar"
                    }
                },
                PlayerWithComments: {
                    type: 'object',
                    properties: {
                        player: { $ref: '#/components/schemas/Player' },
                        comments: { type: 'array', items: { $ref: '#/components/schemas/Comment' } }
                    },
                    example: {
                        player: {
                            id: "1", name: "Neymar", firstName: "Neymar", lastName: "da Silva Santos Júnior",
                            age: 34, birthdate: "1992-02-05", nationality: "Brazil", height: 1.75, weight: 68,
                            number: 10, team: "Santos", league: "Serie A", position: "Attacker",
                            photoUrl: "https://media.api-sports.io/football/players/276.png",
                            latitude: -23.944841, longitude: -46.330376, createdAt: "2026-05-27T12:00:00Z"
                        },
                        comments: [{
                            id: "1", userId: null, playerId: "1", author: "anonymous",
                            text: "Amazing player!", rating: 5, latitude: -23.944841,
                            longitude: -46.330376, createdAt: "2026-05-27T12:00:00Z"
                        }]
                    }
                },
                ExternalPlayerDTO: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        first_name: { type: 'string' },
                        last_name: { type: 'string' },
                        age: { type: 'integer' },
                        birthdate: { type: 'string', format: 'date' },
                        nationality: { type: 'string' },
                        height: { type: 'number' },
                        weight: { type: 'number' },
                        number: { type: 'integer' },
                        position: { type: 'string' },
                        photo_url: { type: 'string' }
                    },
                    example: {
                        id: 276, name: "Neymar", first_name: "Neymar", last_name: "da Silva Santos Júnior",
                        age: 34, birthdate: "1992-02-05", nationality: "Brazil", height: 1.75, weight: 68,
                        number: 10, position: "Attacker", photo_url: "https://media.api-sports.io/football/players/276.png"
                    },
                },
                PlayersImportRequest: {
                    type: 'object',
                    required: ['playerIds', 'latitude', 'longitude'],
                    properties: {
                        playerIds: { type: 'array', items: { type: 'integer' } },
                        latitude: { type: 'number' },
                        longitude: { type: 'number' }
                    },
                    example: {
                        playerIds: [276, 874],
                        latitude: -23.944841,
                        longitude: -46.330376
                    }
                },
                Comment: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        userId: { type: 'string', nullable: true },
                        playerId: { type: 'string' },
                        author: { type: 'string' },
                        text: { type: 'string' },
                        rating: { type: 'integer', minimum: 0, maximum: 5 },
                        latitude: { type: 'number' },
                        longitude: { type: 'number' },
                        createdAt: { type: 'string', format: 'date-time' }
                    },
                    example: {
                        id: "1", userId: null, playerId: "1", author: "anonymous",
                        text: "Amazing player!", rating: 5, latitude: -23.944841,
                        longitude: -46.330376, createdAt: "2026-05-27T12:00:00Z"
                    }
                },
                CommentRequest: {
                    type: 'object',
                    required: ['text', 'rating', 'latitude', 'longitude'],
                    properties: {
                        text: { type: 'string', maxLength: 1000 },
                        rating: { type: 'integer', minimum: 0, maximum: 5 },
                        latitude: { type: 'number' },
                        longitude: { type: 'number' }
                    },
                    example: {
                        text: "Amazing player!", rating: 5, latitude: -23.944841, longitude: -46.330376
                    }
                },
                DreamTeam: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        userId: { type: 'string' },
                        players: { 
                            type: 'array', 
                            items: { $ref: '#/components/schemas/PlayerName' } 
                        }
                    },
                    example: {
                        id: "1",
                        name: "Champions XI",
                        userId: "user_123",
                        players: [
                            { id: "1", name: "Neymar" },
                            { id: "4", name: "Cristiano Ronaldo" }
                        ]
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
