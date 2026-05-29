import { type Request, type Response } from 'express';
import mongoose from 'mongoose';
import Player from '../models/players.js';
import { importAndSavePlayer, searchPlayers } from '../services/externalPlayer.service.js';

/**
 * @openapi
 * /api/players:
 *   get:
 *     tags:
 *       - Players
 *     summary: Get players by filters
 *     description: Retrieves a list of players filtered by name, team, league, and creation date range
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search term for player name, team, or league
 *       - in: query
 *         name: dateStart
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter (yyyy-MM-dd)
 *       - in: query
 *         name: dateEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter (yyyy-MM-dd)
 *     responses:
 *       200:
 *         description: Players list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Player'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 */
export const playersReadAll = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { query, dateStart, dateEnd } = req.query;
        const filter: any = {};
        if (query) {
            const regex = { $regex: query as string, $options: 'i' };
            filter.$or = [
                { name: regex },
                { team: regex },
                { league: regex }
            ];
        }
        if (dateStart || dateEnd) {
            filter.createdAt = {};
            if (dateStart) filter.createdAt.$gte = new Date(dateStart as string);
            if (dateEnd) {
                const end = new Date(dateEnd as string);
                end.setUTCHours(23, 59, 59, 999);
                filter.createdAt.$lte = end;
            }
        }
        const players = await Player.find(filter).select('-comments').exec();
        return res.status(200).json(players);
    } catch (e: unknown) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * @openapi
 * /api/players/summary:
 *   get:
 *     tags:
 *       - Players
 *     summary: Get player summary list
 *     description: Retrieves a lightweight list of all players containing only essential information.
 *     responses:
 *       200:
 *         description: Summary list obtained
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlayerSummary'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 */
export const playersReadSummary = async (req: Request, res: Response): Promise<Response> => {
    try {
        const players = await Player.find().select('name position team league age height weight').exec();
        const summary = players.map((p: any) => ({
            id: p._id,
            name: p.name,
            position: p.position,
            team: p.team,
            league: p.league,
            age: p.age,
            height: p.height,
            weight: p.weight
        }));
        return res.status(200).json(summary);
    } catch (e: unknown) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * @openapi
 * /api/players/{id}:
 *   get:
 *     tags:
 *       - Players
 *     summary: Get player by ID with comments
 *     description: Retrieves a player's details along with all associated comments.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the player to retrieve
 *     responses:
 *       200:
 *         description: Player and comments found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlayerWithComments'
 *       404:
 *         description: Error - Player not found
 *         content:
 *           application/json:
 *             example:
 *               timestamp: "2026-05-27 12:00:00"
 *               error: "Player not found with id: 1"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 */
export const playersReadOne = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                error: `Player not found with id: ${id}`
            });
        }
        const player = await Player.findById(id).exec();
        if (!player) {
            return res.status(404).json({
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                error: `Player not found with id: ${id}`
            });
        }
        const playerData = player.toJSON();
        const comments = playerData.comments;
        delete playerData.comments;
        return res.status(200).json({
            player: playerData,
            comments: comments 
        });
    } catch (e: unknown) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * @openapi
 * /api/players/name/{id}:
 *   get:
 *     tags:
 *       - Players
 *     summary: Get player name by ID
 *     description: Retrieves the ID and name of a player. Useful for other services that only need basic player info without all details.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the player to retrieve
 *     responses:
 *       200:
 *         description: Player name found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlayerName'
 *       404:
 *         description: Error - Player not found
 *         content:
 *           application/json:
 *             example:
 *               timestamp: "2026-05-27 12:00:00"
 *               error: "Player not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 */
export const playersReadName = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                error: "Player not found"
            });
        }
        const player = await Player.findById(id).select('name').exec();
        if (!player) {
            return res.status(404).json({
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                error: "Player not found"
            });
        }
        return res.status(200).json({
            id: player._id,
            name: player.name
        });
    } catch (e: unknown) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * @openapi
 * /api/players:
 *   post:
 *     tags:
 *       - Players
 *     summary: Create a new player
 *     description: Registers a new player in the system. The 'createdAt' field is set automatically by the server.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Player object to be created
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Player'
 *           example:
 *             name: "Neymar"
 *             firstName: "Neymar"
 *             lastName: "da Silva Santos Júnior"
 *             age: 34
 *             birthdate: "1992-02-05"
 *             nationality: "Brazil"
 *             height: 1.75
 *             weight: 68
 *             number: 10
 *             team: "Santos"
 *             league: "Serie A"
 *             position: "Attacker"
 *             photoUrl: "https://media.api-sports.io/football/players/276.png"
 *             latitude: -23.944841
 *             longitude: -46.330376
 *     responses:
 *       201:
 *         description: Player created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
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
export const playersCreate = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { comments, ...playerData } = req.body;
        playerData.createdAt = new Date();
        const newPlayer = new Player(playerData);
        await newPlayer.save();
        const playerObj = newPlayer.toJSON();
        delete playerObj.comments;
        return res.status(201).json(playerObj);
    } catch (e: unknown) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * @openapi
 * /api/players/{id}:
 *   put:
 *     tags:
 *       - Players
 *     summary: Update an existing player
 *     description: Updates all fields of a player. The `createdAt` field is preserved.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique ID of the player to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       description: Updated player object
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Player'
 *           example:
 *             name: "Neymar"
 *             firstName: "Neymar"
 *             lastName: "da Silva Santos Júnior"
 *             age: 34
 *             birthdate: "1992-02-05"
 *             nationality: "Brazil"
 *             height: 1.75
 *             weight: 68
 *             number: 10
 *             team: "Santos"
 *             league: "Serie A"
 *             position: "Attacker"
 *             photoUrl: "https://media.api-sports.io/football/players/276.png"
 *             latitude: -23.944841
 *             longitude: -46.330376
 *     responses:
 *       200:
 *         description: Player updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       404:
 *         description: Player not found
 *         content:
 *           application/json:
 *             example:
 *               timestamp: "2026-05-27 12:00:00"
 *               error: "Player not found with id: 1"
 *       401:
 *         description: Error - Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               message: "No token provided"
 *       403:
 *         description: Error - Forbidden
 *         content:
 *           application/json:
 *             example:
 *               message: "Insufficient permissions"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 */
export const playersUpdate = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                error: `Player not found with id: ${id}`
            });
        }
        const { createdAt, comments, ...updateData } = req.body;
        const updatedPlayer = await Player.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-comments').exec();
        if (!updatedPlayer) {
            return res.status(404).json({
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                error: `Player not found with id: ${id}`
            });
        }
        return res.status(200).json(updatedPlayer);
    } catch (e: unknown) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * @openapi
 * /api/players/{id}:
 *   delete:
 *     tags:
 *       - Players
 *     summary: Delete a player
 *     description: Removes a player from the system by its unique identifier.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the player to delete
 *     responses:
 *       204:
 *         description: Player deleted successfully
 *       404:
 *         description: Error - Player not found
 *         content:
 *           application/json:
 *             example:
 *               timestamp: "2026-05-27 12:00:00"
 *               error: "Player not found with id: 1"
 *       401:
 *         description: Error - Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               message: "No token provided"
 *       403:
 *         description: Error - Forbidden
 *         content:
 *           application/json:
 *             example:
 *               message: "Insufficient permissions"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 */
export const playersDelete = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                error: `Player not found with id: ${id}`
            });
        }
        const deletedPlayer = await Player.findByIdAndDelete(id).exec();
        if (!deletedPlayer) {
            return res.status(404).json({
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                error: `Player not found with id: ${id}`
            });
        }
        return res.status(204).send();
    } catch (e: unknown) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * @openapi
 * /api/players/search:
 *   get:
 *     tags:
 *       - Players
 *     summary: Search players in external API
 *     description: Searches for players in the external football API. Requires a minimum of 3 characters for the query.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         description: Search term (min. 3 characters)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of external players found
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExternalPlayerDTO'
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
export const playersSearch = async (req: Request, res: Response): Promise<Response> => {
    try {
        const query = req.query.query as string;
        const searchParam = (query && query.length >= 3) ? query : null;
        const results = await searchPlayers(searchParam);
        return res.status(200).json(results);
    } catch (e: unknown) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * @openapi
 * /api/players/import:
 *   post:
 *     tags:
 *       - Players
 *     summary: Import players from external API
 *     description: Fetches details of multiple players by their IDs from an external API, resolves their current active team and league, and saves them into the local database.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: List of player IDs to import with coordinates
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlayersImportRequest'
 *           example:
 *             playerIds: [276, 874]
 *             latitude: -23.944841
 *             longitude: -46.330376
 *     responses:
 *       201:
 *         description: Players imported and created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Player'
 *             example:
 *               - id: "1"
 *                 name: "Neymar"
 *                 firstName: "Neymar"
 *                 lastName: "da Silva Santos Júnior"
 *                 age: 34
 *                 birthdate: "1992-02-05"
 *                 nationality: "Brazil"
 *                 height: 1.75
 *                 weight: 68
 *                 number: 10
 *                 team: "Santos"
 *                 league: "Serie A"
 *                 position: "Attacker"
 *                 photoUrl: "https://media.api-sports.io/football/players/276.png"
 *                 latitude: -23.944841
 *                 longitude: -46.330376
 *                 createdAt: "2026-05-27T12:00:00Z"
 *               - id: "2"
 *                 name: "Cristiano Ronaldo"
 *                 firstName: "Cristiano Ronaldo"
 *                 lastName: "dos Santos Aveiro"
 *                 age: 41
 *                 birthdate: "1985-02-05"
 *                 nationality: "Portugal"
 *                 height: 1.87
 *                 weight: 83
 *                 number: 7
 *                 team: "Al-Nassr"
 *                 league: "Pro League"
 *                 position: "Attacker"
 *                 photoUrl: "https://media.api-sports.io/football/players/874.png"
 *                 latitude: -23.944841
 *                 longitude: -46.330376
 *                 createdAt: "2026-05-27T12:00:00Z"
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
export const playersImport = async (req: Request, res: Response): Promise<Response> => {
    const { playerIds, latitude, longitude } = req.body;
    try {
        const results = await Promise.all(
            playerIds.map((id: number) => importAndSavePlayer(id, latitude, longitude))
        );
        return res.status(201).json(results);
    } catch (e: unknown) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
