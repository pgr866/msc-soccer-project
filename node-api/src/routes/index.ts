import express from 'express';
import * as ctrlLocations from '../controllers/locations.js';
import * as ctrlReviews from '../controllers/reviews.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRole } from '../middlewares/role.middleware.js';

const router = express.Router();

router.get('/players', authenticate, authorizeRole('ADMIN'), ctrlLocations.locationsReadAll);
router.get('/locations/:locationId', ctrlLocations.locationsReadOne);
router.post('/locations', ctrlLocations.locationsCreate);
router.put('/locations/:locationId', ctrlLocations.locationsUpdate);
router.patch('/locations/:locationId', ctrlLocations.locationsPartialUpdate);
router.delete('/locations/:locationId', ctrlLocations.locationsDelete);

router.get('/locations/:locationId/reviews/:reviewId', ctrlReviews.reviewsReadOne);
router.post('/locations/:locationId/reviews', ctrlReviews.reviewsCreate);
router.put('/locations/:locationId/reviews/:reviewId', ctrlReviews.reviewsUpdate);
router.delete('/locations/:locationId/reviews/:reviewId', ctrlReviews.reviewsDelete);

export default router;
