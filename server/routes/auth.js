const express = require('express')

const router = express.Router()

const User =
require('../models/User')

router.post('/register', async(req,res)=>{

  const exists =
    await User.findOne({

      email: req.body.email

    })

  if(exists){

    return res.status(400).json({

      message:
      'User already exists'

    })

  }

  const user =
    await User.create(req.body)

  res.json(user)

})

module.exports = router