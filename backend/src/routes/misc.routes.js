import { Router } from 'express';
import { getAbout, getOpenApiJson } from '../controllers/misc.controller.js';

const router = Router();

router.get('/about', getAbout);
router.get('/openapi.json', getOpenApiJson);

export default router;
