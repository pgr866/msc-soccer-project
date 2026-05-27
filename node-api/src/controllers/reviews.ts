import { type Request, type Response } from 'express';
import { type Types } from 'mongoose';
import Location, { type IReview } from '../models/locations.js';

/**
 * @openapi
 * /api/locations/{locationId}/reviews/{reviewId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Get review by ID
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *       - in: path
 *         name: reviewId
 *         required: true
 *     responses:
 *       200:
 *         description: Review found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 */
export const reviewsReadOne = async (req: Request, res: Response): Promise<Response> => {
    try {
        const location = await Location.findById(req.params['locationId'])
            .select("name reviews")
            .exec();
        if (!location) {
            return res.status(404).json({ message: "Location not found" });
        }
        const reviews = location.reviews as unknown as Types.DocumentArray<IReview & Types.Subdocument>;
        const reviewId = Array.isArray(req.params['reviewId'])
            ? req.params['reviewId'][0]
            : req.params['reviewId'];
        const review = reviews.id(reviewId ?? '');
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        return res.status(200).json(review);
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('An unknown error occurred');
        console.error(error.message);
        if ('name' in error && error.name === 'CastError') {
            return res.status(400).json({ message: 'Bad Request' });
        }
        return res.status(500).json({ message: 'Unknown Error' });
    }
};

/**
 * @openapi
 * /api/locations/{locationId}/reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Create new review
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Review'
 *     responses:
 *       200:
 *         description: Review created
 */
export const reviewsCreate = async (req: Request, res: Response): Promise<Response> => {
    try {
        const location = await Location.findById(req.params['locationId'])
            .select("name reviews")
            .exec();
        if (!location)
            return res.status(404).json({ message: "Location not found" });
        location.reviews.push({
            author: req.body.author,
            rating: req.body.rating,
            reviewText: req.body.reviewText,
            createdOn: new Date()
        });
        const savedLocation = await location.save();
        const review = savedLocation.reviews[savedLocation.reviews.length - 1];
        return res.status(200).json(review);
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('An unknown error occurred');
        console.error(error.message);
        if ('name' in error && error.name === "CastError")
            return res.status(400).json({ message: "Bad Request" });  
        return res.status(500).json({ message: "Unknown Error" });
    }
};

/**
 * @openapi
 * /api/locations/{locationId}/reviews/{reviewId}:
 *   put:
 *     tags: [Reviews]
 *     summary: Update review
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *       - in: path
 *         name: reviewId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Review'
 *     responses:
 *       200:
 *         description: Review updated
 */
export const reviewsUpdate = async (req: Request, res: Response): Promise<Response> => {
    try {
        const location = await Location.findById(req.params['locationId'])
            .select("reviews")
            .exec();
        if (!location)
            return res.status(404).json({ message: "not found" });
        const reviews = location.reviews as unknown as Types.DocumentArray<IReview & Types.Subdocument>;
        const reviewId = Array.isArray(req.params['reviewId']) ? req.params['reviewId'][0] : req.params['reviewId'];
        const review = reviews.id(reviewId ?? '');
        if (!review)
            return res.status(404).json({ message: "not found" });
        review.author = req.body.author;
        review.rating = req.body.rating;
        review.reviewText = req.body.reviewText;
        await location.save();
        return res.status(200).json(review);
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('An unknown error occurred');
        console.error(error.message);
        if ('name' in error && error.name === "CastError")
            return res.status(400).json({ message: "Bad Request" });
        return res.status(500).json({ message: "Unknown Error" });
    }
};

/**
 * @openapi
 * /api/locations/{locationId}/reviews/{reviewId}:
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete review
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *       - in: path
 *         name: reviewId
 *         required: true
 *     responses:
 *       204:
 *         description: Deleted
 */
export const reviewsDelete = async (req: Request, res: Response): Promise<Response> => {
    try {
        const location = await Location.findById(req.params['locationId'])
            .select("reviews")
            .exec();
        if (!location)
            return res.status(404).json({ message: "not found" });
        const reviews = location.reviews as unknown as Types.DocumentArray<IReview & Types.Subdocument>;
        const reviewId = Array.isArray(req.params['reviewId']) ? req.params['reviewId'][0] : req.params['reviewId'];
        const review = reviews.id(reviewId ?? '');
        if (!review)
            return res.status(404).json({ message: "not found" });
        review.deleteOne();
        await location.save();
        return res.status(204).send();
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('An unknown error occurred');
        console.error(error.message);
        if ('name' in error && error.name === "CastError")
            return res.status(400).json({ message: "Bad Request" });
        return res.status(500).json({ message: "Unknown Error" });
    }
};
