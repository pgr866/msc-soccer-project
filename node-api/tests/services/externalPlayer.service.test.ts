import * as service from '../../src/services/externalPlayer.service.js';
import { apiClient } from '../../src/services/externalPlayer.service.js';
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
                        id: 1, name: 'Neymar', firstname: 'Neymar', lastname: 'Santos',
                        age: 34, birth: { date: '1992-02-05' }
                    }
                }]
            }
        };
        const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce(mockResponse);
        const results = await service.searchPlayers('Neymar');

        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Neymar');
        expect(getSpy).toHaveBeenCalledWith('/players/profiles', { params: { search: 'Neymar' } });
    });

    test('importAndSavePlayer: should process data and save to DB', async () => {
        const getSpy = jest.spyOn(apiClient, 'get');

        getSpy
            .mockResolvedValueOnce({ data: { response: [{ player: { id: 1, name: 'Neymar', firstname: 'Neymar', lastname: 'Santos', birth: { date: '1992-02-05' } } }] } })
            .mockResolvedValueOnce({ data: { response: [{ team: { id: 1, name: 'Santos' }, seasons: [2026] }] } })
            .mockResolvedValueOnce({ data: { response: [{ league: { id: 1, name: 'Serie A', type: 'League' }, country: { name: 'Brazil' }, seasons: [{ year: 2026, start: '2026-01-01', end: '2026-05-01' }] }] } });

        const saveMock = jest.fn().mockResolvedValue({ toJSON: () => ({ name: 'Neymar' }) });
        jest.spyOn(Player.prototype, 'save').mockImplementation(saveMock);

        const result = await service.importAndSavePlayer(1, -23.9, -46.3);

        expect(result.name).toBe('Neymar');
        expect(saveMock).toHaveBeenCalled();
    });
});
