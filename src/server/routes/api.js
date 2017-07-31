const express = require('express');

const router = express.Router();
const models = require('../models');

router.get('/:resource', (req, res) => {
  const resource = req.params.resource;
  const model = models[resource];

  model.find(req.query, (err, results) => {
    res.json(results);
  });
});

router.get('/:resource/:id', (req, res) => {
  const resource = req.params.resource;
  const id = req.params.id;
  const model = models[resource];

  model.findById(id, (err, result) => {
    res.json(result);
  });
});

module.exports = router;
