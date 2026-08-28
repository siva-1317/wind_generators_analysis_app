import { Router } from 'express';
import { generatorsController } from '../controllers/generators.controller';

const router = Router();

router.get('/', generatorsController.getAllGenerators);
router.get('/:id', generatorsController.getGeneratorById);
router.post('/', generatorsController.createGenerator);
router.delete('/:id', generatorsController.deleteGenerator);

export default router;
