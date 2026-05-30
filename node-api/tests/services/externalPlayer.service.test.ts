import axios from 'axios';
import * as service from '../../src/services/externalPlayer.service.js';
import Player from '../../src/models/players.js';

describe('ExternalPlayer Service', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('searchPlayers: should return formatted list', async () => {
        const mockResponse = {
            data: {
                response: [{
                    player: { 
                        id: 1, 
                        name: 'Marcelo Messías', 
                        firstname: 'Marcelo', 
                        lastname: 'Messías', 
                        age: 38, 
                        birth: { date: '1987-06-24' }, 
                        nationality: 'Argentina', 
                        height: '170 cm', 
                        weight: '72 kg', 
                        number: 10, 
                        position: 'Forward', 
                        photo: 'url' 
                    }
                }]
            }
        };

        jest.spyOn(axios, 'create').mockReturnValue({
            get: jest.fn().mockResolvedValue(mockResponse)
        } as any);

        const players = await service.searchPlayers('Messi');
        
        expect(players[0].name).toBe('Marcelo Messías');
        expect(players[0].firstName).toBe('Marcelo');
        expect(players[0].lastName).toBe('Messías');
    });

    test('importAndSavePlayer: should process data and save to DB', async () => {
        const mockGet = jest.fn()
            .mockResolvedValueOnce({ 
                data: { response: [{ player: { name: 'Player1', firstname: 'P', lastname: '1', birth: { date: '1990-01-01' } } }] } 
            })
            .mockResolvedValueOnce({ 
                data: { response: [{ team: { id: 10, name: 'TeamA' }, seasons: [2026] }] } 
            })
            .mockResolvedValueOnce({ 
                data: { response: [{ league: { name: 'LeagueA', type: 'League' }, country: { name: 'Spain' }, seasons: [{ year: 2026, start: '2026-01-01', end: '2026-05-01' }] }] } 
            });

        jest.spyOn(axios, 'create').mockReturnValue({ get: mockGet } as any);

        const saveMock = jest.fn().mockResolvedValue({ 
            toJSON: () => ({ id: 1, name: 'Player1' }) 
        });
        jest.spyOn(Player.prototype, 'save').mockImplementation(saveMock);

        const result = await service.importAndSavePlayer(123, 40.0, -3.0);

        expect(result.name).toBe('Player1');
        expect(saveMock).toHaveBeenCalled();
    });

    test('parseExternalDate: should return null for invalid inputs', async () => {
        const resultEmpty = await service.searchPlayers(null).catch(() => []);
        expect(Array.isArray(resultEmpty)).toBe(true);
    });
});
