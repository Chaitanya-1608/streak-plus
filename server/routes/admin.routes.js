const express = require('express')
const router  = express.Router()
const { stats, dashboard } = require('../controllers/admin.controller')

router.get('/',      dashboard)
router.get('/stats', stats)

module.exports = router
