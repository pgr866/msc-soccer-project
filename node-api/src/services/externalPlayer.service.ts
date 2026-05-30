import axios from 'axios';
import Player from '../models/players.js';

const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY;
const BASE_URL = 'https://v3.football.api-sports.io';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: { 'x-rapidapi-key': FOOTBALL_API_KEY as string }
});

const parseExternalDate = (dateStr: string | null | undefined): string | null => {
    if (!dateStr || dateStr.trim() === '') return null;
    try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) return dateStr;
    } catch (e) { /* fall through */ }
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    const year = parts[0];
    const month = parts[1]!.padStart(2, '0');
    const day = parts[2]!.padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const searchPlayers = async (query: string | null) => {
    const response = await apiClient.get('/players/profiles', { params: { search: query } });
    const data = response.data.response;
    return data.map((item: any) => {
        const p = item.player;
        const height = p.height ? parseFloat(p.height.replace(/\D/g, '')) / 100.0 : null;
        const weight = p.weight ? parseFloat(p.weight.replace(/\D/g, '')) : null;
        return {
            id: p.id,
            name: p.name,
            firstName: p.firstname || null,
            lastName: p.lastname || null,
            age: p.age ?? null,
            birthdate: parseExternalDate(p.birth?.date),
            nationality: p.nationality || null,
            height,
            weight,
            number: p.number ?? null,
            position: p.position || null,
            photoUrl: p.photo || null
        };
    });
};

export const importAndSavePlayer = async (playerId: number, latitude: number, longitude: number) => {
    const currentYear = new Date().getFullYear();
    const { data: profileData } = await apiClient.get('/players/profiles', { params: { player: playerId } });
    const playerItem = profileData.response[0];
    if (!playerItem) throw new Error(`Player with ID ${playerId} not found`);
    const p = playerItem.player;
    const height = p.height ? parseFloat(p.height.replace(/\D/g, '')) / 100.0 : null;
    const weight = p.weight ? parseFloat(p.weight.replace(/\D/g, '')) : null;
    const birthdate = (p.birth?.date) ? new Date(p.birth.date) : null;
    const { data: teamsData } = await apiClient.get('/players/teams', { params: { player: playerId } });
    const teamsResponse = teamsData.response;
    let teamName = null, leagueName = null, teamId = null;
    const yearsToTry = [currentYear, currentYear - 1];
    for (const year of yearsToTry) {
        let foundInYear = false;
        for (const t of teamsResponse) {
            const teamNode = t.team;
            const seasonsNode = t.seasons;
            const hasYear = seasonsNode.includes(year);
            
            if (hasYear && !teamNode.name.includes(p.nationality)) {
                teamName = teamNode.name;
                teamId = teamNode.id;
                foundInYear = true;
                break;
            }
        }
        if (foundInYear) break;
    }
    if (teamId) {
        const { data: leaguesData } = await apiClient.get('/leagues', { params: { team: teamId } });
        const leaguesResponse = leaguesData.response;
        let maxDuration = -1;
        for (const l of leaguesResponse) {
            const league = l.league;
            if (league.type === 'League' && l.country.name !== 'World') {
                for (const s of l.seasons) {
                    if (s.year === currentYear || s.year === currentYear - 1) {
                        const start = new Date(s.start).getTime();
                        const end = new Date(s.end).getTime();
                        const duration = end - start;
                        if (duration > maxDuration) {
                            maxDuration = duration;
                            leagueName = league.name;
                        }
                    }
                }
            }
        }
    }
    const player = new Player({
        name: p.name,
        firstName: p.firstname,
        lastName: p.lastname,
        age: p.age ?? null,
        birthdate: birthdate,
        nationality: p.nationality,
        height: height,
        weight: weight,
        number: p.number ?? null,
        position: p.position,
        photoUrl: p.photo,
        team: teamName,
        league: leagueName,
        latitude: latitude,
        longitude: longitude,
        createdAt: new Date()
    });
    const savedPlayer = await player.save();
    const playerObj = savedPlayer.toJSON();
    const { comments: _, ...playerWithoutComments } = playerObj;
    return playerWithoutComments;
};
