import { type Request, type Response } from 'express';
import { ChatGroq } from '@langchain/groq';
import { DreamTeamService } from '../services/dreamTeam.service.js';
import DreamTeam from '../models/dreamTeams.js';
import Player from '../models/players.js';
import configuration from '../config/configuration.js';
import type { User } from '../models/user.js';

/**
 * @openapi
 * /api/dream-teams:
 *   get:
 *     tags:
 *       - Dream Teams
 *     summary: Get my dream teams
 *     description: Retrieves all dream teams belonging to the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's dream teams obtained
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DreamTeam'
 *       401:
 *         description: Error - Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               message: "No token provided"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 */
export const getAllDreamTeams = async (req: Request & { user?: User }, res: Response): Promise<Response> => {
    try {
        const userId = req.user?.uid;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        const dreamTeams = await DreamTeam.find({ userId });
        const response = await Promise.all(dreamTeams.map(async (dt) => {
            const playerNames = await Promise.all(dt.playerIds.map(async (id) => {
                try {
                    const player = await Player.findById(id).select('name').exec();
                    return { id, name: player ? player.name : 'Unknown Player' };
                } catch (e) {
                    return { id, name: 'Unknown Player' };
                }
            }));
            return {
                id: dt._id,
                name: dt.name,
                userId: dt.userId,
                players: playerNames
            };
        }));
        return res.status(200).json(response);
    } catch (e: unknown) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * @openapi
 * /api/dream-teams:
 *   post:
 *     tags:
 *       - Dream Teams
 *     summary: Generate a new Dream Team with AI
 *     description: Uses an AI model to analyze the list of players and automatically select the 11 best players to form an ideal starting lineup.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Dream Team generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DreamTeam'
 *       422:
 *         description: Error - Could not generate a valid team
 *       401:
 *         description: Error - Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               message: "No token provided"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 */
export const createDreamTeamWithAI = async (req: Request & { user?: User }, res: Response): Promise<Response> => {
    try {
        const userId = req.user?.uid;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        const players = await Player.find().limit(50);
        const service = new DreamTeamService(new ChatGroq({
            apiKey: configuration.groq.apiKey,
            model: 'llama-3.1-8b-instant'
        }));
        const savedTeam = await service.generateDreamTeam(players, userId);
        if (!savedTeam.playerIds || savedTeam.playerIds.length === 0) {
            return res.status(422).json({ error: "Could not generate a valid team" });
        }
        const playerDetails = await Promise.all(savedTeam.playerIds.map(async (id: any) => {
            const p = await Player.findById(id).select('name');
            return { id, name: p ? p.name : 'Unknown' };
        }));
        return res.status(201).json({
            id: savedTeam._id,
            name: savedTeam.name,
            userId: savedTeam.userId,
            players: playerDetails
        });
    } catch (e: unknown) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
