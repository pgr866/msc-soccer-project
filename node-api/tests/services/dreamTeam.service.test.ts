import { DreamTeamService } from '../../src/services/dreamTeam.service.js';
import DreamTeam from '../../src/models/dreamTeams.js';
import { ChatGroq } from '@langchain/groq';

jest.mock('../../src/models/dreamTeams.js');

describe('DreamTeamService', () => {
    let dreamTeamService: DreamTeamService;
    let mockModel: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockModel = {} as ChatGroq;
        dreamTeamService = new DreamTeamService(mockModel);
    });

    test('generateDreamTeam: should generate a team and save it', async () => {
        const mockPlayers = [{ _id: '1', name: 'Messi' }, { _id: '2', name: 'Ronaldo' }];
        const mockResponse = { name: 'Equipo Galáctico', playerIds: ['1', '2'] };

        (dreamTeamService as any).chain = {
            invoke: jest.fn().mockResolvedValue(mockResponse)
        };

        const saveMock = jest.fn().mockResolvedValue({ ...mockResponse, userId: 'user1' });
        (DreamTeam as any).mockImplementation(() => ({ save: saveMock }));

        const result = await dreamTeamService.generateDreamTeam(mockPlayers, 'user1');

        expect(result.name).toBe('Equipo Galáctico');
        expect(saveMock).toHaveBeenCalled();
    });

    test('generateDreamTeam: should handle empty player list', async () => {
        const mockResponse = { name: 'Equipo Vacío', playerIds: [] };

        (dreamTeamService as any).chain = {
            invoke: jest.fn().mockResolvedValue(mockResponse)
        };

        const saveMock = jest.fn().mockResolvedValue(mockResponse);
        (DreamTeam as any).mockImplementation(() => ({ save: saveMock }));

        const result = await dreamTeamService.generateDreamTeam([], 'user1');
        
        expect(result.playerIds).toEqual([]);
        expect(saveMock).toHaveBeenCalled();
    });
});
