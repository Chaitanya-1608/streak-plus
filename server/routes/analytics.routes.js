const express = require('express')

const router = express.Router()

const analyticsController =
  require('../controllers/analytics.controller')

console.log(analyticsController)

router.get(
  '/overview',
  analyticsController.getOverview
)

module.exports = router