import express from 'express';

import ItemsController from './controllers/itemsController';
import PointsController from './controllers/pointsController';

const routes = express.Router();
const pointsController = new PointsController();
const indexController = new ItemsController();

routes.get('/items', indexController.index);

routes.post('/points', pointsController.create);
routes.get('/points/:id', pointsController.show);
routes.get('/points', pointsController.index);


export default routes;