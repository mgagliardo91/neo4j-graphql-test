import express from 'express';
import models from '../models';

export default (app) => {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const extensions = (await models.Extension.findAll());
      return res.json(extensions);
    } catch (e) {
      return next(e);
    }
  });

  router.get('/:name', async (req, res, next) => {
    try {
      const name = req.params.name.toLowerCase();
      const extension = (await models.Extension.findOne({ where: { name }}));
      return res.json(extension);
    } catch (e) {
      return next(e);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const { name: unformattedName, schema } = req.body;
      const extension = await models.Extension.createExtension({
        name: unformattedName.toLowerCase(),
        schema
      });
      return res.json(extension);
    } catch (e) {
      return next(e);
    }
  });

  router.put('/:name', async (req, res, next) => {
    try {
      const extension = await models.Extension.updateExtension({
        name: req.params.name.toLowerCase(),
        ...req.body
      });
      return res.json(extension);
    } catch (e) {
      return next(e);
    }
  });

  router.delete('/:name', async (req, res, next) => {
    try {
      const result = await models.Extension.destroy({ where: { name: req.params.name.toLowerCase() }});
      return res.json(result);
    } catch (e) {
      return next(e);
    }
  });

  app.use('/extensions', router);
}