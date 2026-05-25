const express = require('express')

const router = express.Router()

const Habit =
require('../models/Habit')

router.post('/', async(req,res)=>{

  const habit =
    await Habit.create(req.body)

  res.json(habit)

})

router.get('/:userId', async(req,res)=>{

  const habits =
    await Habit.find({

      userId: req.params.userId

    })

  res.json(habits)

})

module.exports = router