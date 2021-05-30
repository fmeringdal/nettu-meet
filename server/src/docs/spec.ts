import express from 'express';
import swaggerUi from 'swagger-ui-express';
const docsRouter = express.Router();
const YAML = require('yamljs'); // eslint-disable-line

const swaggerDocument = YAML.load(__dirname + '/swagger.yaml');

const options = {
    explorer: false,
};

docsRouter.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

export { docsRouter };
