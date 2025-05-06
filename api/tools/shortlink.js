const axios = require("axios")

module.exports = {
  name: "Shortlink",
  desc: "Shorten any URL using TinyURL",
  category: "Tools",
  params: ["url"],
  async run(req, res) {
    const { url } = req.query
    if (!url) return res.status(400).json({ status: false, message: "Parameter 'url' is required" })

    try {
      const { data } = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`)
      res.status(200).json({
        status: true,
        creator: "Zaboy",
        original: url,
        short: data,
      })
    } catch (err) {
      res.status(500).json({ status: false, message: "Failed to shorten URL", error: err.message })
    }
  },
}
