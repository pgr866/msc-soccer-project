import { type Request, type Response } from 'express';
import mongoose from 'mongoose';
import Player from '../models/players.js';
import { type User } from '../models/user.js';

/**
 * @openapi
 * /api/comments/player/{id}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get comments by player ID
 *     description: Retrieves a list of all comments associated with a specific player.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the player to retrieve comments for
 *     responses:
 *       200:
 *         description: Comments list obtained
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 */
export const commentsReadByPlayer = async (req: Request, res: Response): Promise<Response> => {
    try {
        const playerId = req.params.id as string;
        if (!mongoose.Types.ObjectId.isValid(playerId)) {
            return res.status(404).json({ 
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                error: `Player not found with id: ${playerId}` 
            });
        }
        const player = await Player.findById(playerId).select('comments').exec();
        if (!player) {
            return res.status(404).json({ 
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                error: `Player not found with id: ${playerId}` 
            });
        }
        const comments = player.comments.map((c: any) => {
            const commentObj = c.toObject();
            const { _id, ...commentWithoutId } = commentObj;
            const finalComment = { ...commentWithoutId, id: _id };
            return finalComment;
        });
        return res.status(200).json(comments);
    } catch (e: unknown) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * @openapi
 * /api/comments/player/{id}:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Create a new comment
 *     description: Creates a comment for a player. If not authenticated, user is set as null and author as 'anonymous'.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the player to comment on
 *     requestBody:
 *       required: true
 *       description: Comment content
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentRequest'
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
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
export const commentsCreate = async (req: Request & { user?: User }, res: Response): Promise<Response> => {
    try {
        const playerId = req.params.id as string;
        if (!mongoose.Types.ObjectId.isValid(playerId)) {
            return res.status(404).json({
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                error: `Player not found with id: ${playerId}`
            });
        }
        const player = await Player.findById(playerId).exec();
        if (!player) {
            return res.status(404).json({
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                error: `Player not found with id: ${playerId}`
            });
        }
        const { text, rating, latitude, longitude } = req.body;
        const newComment = {
            userId: req.user?.uid || null,
            author: req.user?.email || "anonymous",
            text,
            rating,
            latitude,
            longitude,
            createdAt: new Date()
        };
        player.comments.push(newComment as any);
        await player.save();
        const commentDoc = player.comments[player.comments.length - 1];
        if (!commentDoc) {
            throw new Error("Comment not created");
        }
        const commentObj = commentDoc.toObject();
        const { _id, ...commentWithoutId } = commentObj;
        const finalComment = { ...commentWithoutId, id: _id };
        return res.status(201).json(finalComment);
    } catch (e: unknown) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * @openapi
 * /api/comments/{id}:
 *   delete:
 *     tags:
 *       - Comments
 *     summary: Delete a comment
 *     description: Removes a comment from the system by its unique identifier.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the comment to delete
 *     responses:
 *       204:
 *         description: Comment deleted successfully
 *       404:
 *         description: Error - Comment not found
 *         content:
 *           application/json:
 *             example:
 *               timestamp: "2026-05-27 12:00:00"
 *               error: "Comment not found with id: 1"
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
export const commentsDelete = async (req: Request, res: Response): Promise<Response> => {
    try {
        const commentId = req.params.id as string;
        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(404).json({
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                error: `Comment not found with id: ${commentId}`
            });
        }
        const result = await Player.findOneAndUpdate(
            { "comments._id": commentId },
            { $pull: { comments: { _id: commentId } } },
            { new: true }
        ).exec();
        if (!result) {
            return res.status(404).json({
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                error: `Comment not found with id: ${commentId}`
            });
        }
        return res.status(204).send();
    } catch (e: unknown) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
