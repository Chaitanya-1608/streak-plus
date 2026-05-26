const express = require('express')
const { protect } = require('../middleware/auth.middleware')
const { push, pull } = require('../controllers/sync.controller')

const router = express.Router()

router.post('/', protect, push)
router.get('/',  protect, pull)

module.exports = router
