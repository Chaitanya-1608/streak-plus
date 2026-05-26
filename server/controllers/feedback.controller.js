const { sendAdminFeedback } = require('../utils/email')

exports.submit = async (req, res) => {
  try {
    const { category, stars, message } = req.body
    if (!category || !stars || !message) {
      return res.status(400).json({ success: false, message: 'Missing fields' })
    }

    const userEmail = req.user?.email || req.body.userEmail || 'anonymous'

    await sendAdminFeedback({
      category,
      stars,
      message,
      userEmail,
      timestamp: new Date().toISOString(),
    })

    res.json({ success: true })
  } catch (err) {
    console.error('[feedback]', err.message)
    res.status(500).json({ success: false, message: err.message })
  }
}
