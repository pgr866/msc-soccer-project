import express from 'express';
// import * as ctrlPlayers from '../controllers/players.js';
// import * as ctrlComments from '../controllers/comments.js';
// import * as ctrlDreamTeams from '../controllers/dreamTeams.js';
// import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware.js';
// import { authorizeRole } from '../middlewares/role.middleware.js';

const router = express.Router();

// router.get('/players/search', authenticate, ctrlPlayers.playersSearch);
// router.post('/players/import', authenticate, ctrlPlayers.playersImport);
// router.get('/players/summary', ctrlPlayers.playersReadSummary);
// router.get('/players/name/:id', ctrlPlayers.playersReadName);
// router.get('/players/:id', ctrlPlayers.playersReadOne);
// router.put('/players/:id', authenticate, authorizeRole('ADMIN'), ctrlPlayers.playersUpdate);
// router.delete('/players/:id', authenticate, authorizeRole('ADMIN'), ctrlPlayers.playersDelete);
// router.get('/players', ctrlPlayers.playersReadAll);
// router.post('/players', authenticate, ctrlPlayers.playersCreate);

// router.get('/comments/player/:id', ctrlComments.commentsReadByPlayer);
// router.post('/comments/player/:id', optionalAuthenticate, ctrlComments.commentsCreate);
// router.delete('/comments/:id', authenticate, authorizeRole('ADMIN'), ctrlComments.commentsDelete);

// router.get('/dream-teams', authenticate, ctrlDreamTeams.getAllDreamTeams);
// router.post('/dream-teams', authenticate, ctrlDreamTeams.createDreamTeamWithAI);

export default router;
