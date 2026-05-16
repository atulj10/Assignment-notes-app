const { Router } = require('express');
const { getAbout, getOpenApiJson } = require('../controllers/misc.controller');

const router = Router();

router.get('/about', getAbout);
router.get('/openapi.json', getOpenApiJson);

module.exports = router;
