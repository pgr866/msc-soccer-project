import { type Request, type Response } from 'express';
import Loc from '../models/locations.js';

/**
 * @openapi
 * /api/locations:
 *   get:
 *     tags: [Locations]
 *     summary: Get all locations
 *     description: Retrieve a list of all locations.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of locations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Location'
 *       500:
 *         description: Server error
 */
export const locationsReadAll = async (req: Request, res: Response): Promise<Response> => {
    try {
        const locations = await Loc.find().exec();
        return res.status(200).json(locations);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'An unknown error occurred';
        return res.status(500).json({ error: message });
    }
}

/**
 * @openapi
 * /api/locations/{locationId}:
 *   get:
 *     tags: [Locations]
 *     summary: Get location by ID
 *     description: Retrieve a single location by its ID.
 *     parameters:
 *       - in: path
 *         name: locationId
 *         description: ID of the location to retrieve
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Location found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not found
 */
export const locationsReadOne = async (req: Request, res: Response): Promise<Response> => {
    try {
        const location = await Loc.findById(req.params['locationId']).exec();
        if (!location)
            return res.status(404).json({ message: "not found" });
        return res.status(200).json(location);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        console.error(message);
        if (message.includes("CastError"))
            return res.status(400).json({ message: "Bad Request" });
        return res.status(500).json({ message: "Unknown Error" });
    }
}

/**
 * @openapi
 * /api/locations:
 *   post:
 *     tags: [Locations]
 *     summary: Create new location
 *     description: Create a new location with the provided data.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Location'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema: 
 *               $ref: '#/components/schemas/Location'
 *       400:
 *         description: Validation error
 */
export const locationsCreate = async (req: Request, res: Response): Promise<Response> => {
    try {
        const location = await Loc.create(
            req.body
        );
        return res.status(201).json(location);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        return res.status(400).json({ error: message });
    }
}

/**
 * @openapi
 * /api/locations/{locationId}:
 *   put:
 *     tags: [Locations]
 *     summary: Full update location
 *     description: Update an existing location by replacing all its fields with the provided data.
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Location'
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       404:
 *         description: Not found
 */
export const locationsUpdate = async (req: Request, res: Response): Promise<Response> => {
    try {
        const location = await Loc.findByIdAndUpdate(
            req.params['locationId'],
            req.body,
            { new: true, runValidators: true }
        ).exec();

        if (!location) {
            return res.status(404).json({ message: "not found" });
        }
        return res.status(200).json(location);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        console.error(message);
        if (message.includes("CastError")) {
            return res.status(400).json({ message: "Bad Request" });
        }
        return res.status(500).json({ message: "Unknown Error" });
    }
}

/**
 * @openapi
 * /api/locations/{locationId}:
 *   patch:
 *     tags: [Locations]
 *     summary: Partial update location
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Location'
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 */
export const locationsPartialUpdate = async (req: Request, res: Response): Promise<Response> => {
    try {
        const location = await Loc.findById(req.params['locationId']).exec();
        
        if (!location) {
            return res.status(404).json({ message: "not found" });
        }

        Object.keys(req.body).forEach((key) => {
            location.set(key, req.body[key]);
        });

        await location.save();
        return res.status(200).json(location);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        console.error(message);
        if (message.includes("CastError")) {
            return res.status(400).json({ message: "Bad Request" });
        }
        return res.status(500).json({ message: "Unknown Error" });
    }
};

/**
 * @openapi
 * /api/locations/{locationId}:
 *   delete:
 *     tags: [Locations]
 *     summary: Delete location
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
export const locationsDelete = async (req: Request, res: Response): Promise<Response> => {
    try {
        const location = await Loc.findByIdAndDelete(req.params['locationId']).exec();
        
        if (!location) {
            return res.status(404).json({ message: "not found" });
        }
        return res.status(204).send();
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        console.error(message);
        if (message.includes("CastError")) {
            return res.status(400).json({ message: "Bad Request" });
        }
        return res.status(500).json({ message: "Unknown Error" });
    }
}
