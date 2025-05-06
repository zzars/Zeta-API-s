const axios = require("axios")

module.exports = {
  name: "Lumin AI",
  desc: "Chat AI. Lumin AI",
  category: "AI",
  params: ["text"],
  async run(req, res) {
    async function chatLumin(content) {
      try {
        const response = await axios.post("https://luminai.my.id/", { content })
        return response.data
      } catch (error) {
        console.error("Error fetching content from LuminAI:", error)
        throw error
      }
    }

    try {
      const { text } = req.query
      if (!text) return res.status(400).json({ status: false, error: "Text is required" })

      const zab = await chatLumin(text)

      res.status(200).json({
        status: true,
        creator: "Zaboy",
        result: zab.result,
      })
    } catch (error) {
      res.status(500).json({ status: false, error: error.message })
    }
  },
}
