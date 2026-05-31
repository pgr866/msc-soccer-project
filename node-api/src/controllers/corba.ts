import { type Request, type Response } from 'express';
import axios from 'axios';

const CORBA_URL = process.env.CORBA_APP_URL || 'http://localhost:8084';

/**
 * @openapi
 * /api/corba/send:
 *   post:
 *     tags:
 *       - Corba
 *     summary: Send news item
 *     description: Sends a new news item to the buffer
 *     parameters:
 *       - in: query
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: player
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: description
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: labels
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: News item sent successfully
 *       500:
 *         description: Internal Server Error
 */
export const sendNews = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { title, player, description, labels } = req.query;
        const params = new URLSearchParams({
            title: title as string,
            player: player as string,
            description: description as string,
            labels: labels as string,
            action: 'Enviar',
            format: 'json'
        });
        const response = await axios.post(CORBA_URL, params.toString());
        return res.status(200).json(response.data);
    } catch (e) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * @openapi
 * /api/corba/read:
 *   post:
 *     tags:
 *       - Corba
 *     summary: Read news item
 *     description: Reads the current news item from the buffer
 *     responses:
 *       200:
 *         description: News item read successfully
 *       500:
 *         description: Internal Server Error
 */
export const readNews = async (req: Request, res: Response): Promise<Response> => {
    try {
        const params = new URLSearchParams({ action: 'Leer', format: 'json' });
        const response = await axios.post(CORBA_URL, params.toString());
        return res.status(200).json(response.data);
    } catch (e) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * @openapi
 * /api/corba/receive:
 *   post:
 *     tags:
 *       - Corba
 *     summary: Receive news item
 *     description: Receives and removes the news item from the buffer
 *     responses:
 *       200:
 *         description: News item received successfully
 *       500:
 *         description: Internal Server Error
 */
export const receiveNews = async (req: Request, res: Response): Promise<Response> => {
    try {
        const params = new URLSearchParams({ action: 'Recibir', format: 'json' });
        const response = await axios.post(CORBA_URL, params.toString());
        return res.status(200).json(response.data);
    } catch (e) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * @openapi
 * /api/corba/limit:
 *   post:
 *     tags:
 *       - Corba
 *     summary: Set buffer limit
 *     description: Updates the buffer limit
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Buffer limit updated successfully
 *       500:
 *         description: Internal Server Error
 */ 
export const setLimit = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { limit } = req.query;
        const params = new URLSearchParams({
            limit: limit as string,
            action: 'Limitar',
            format: 'json'
        });
        const response = await axios.post(CORBA_URL, params.toString());
        return res.status(200).json(response.data);
    } catch (e) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
