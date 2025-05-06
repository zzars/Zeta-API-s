const axios = require("axios")
module.exports = {
  name: "Waifu",
  desc: "Random Waifu Image",
  category: "Random",
  async run(req, res) {
    async function getWaifuBest() {
      const { data } = await axios.get("https://nekos.best/api/v2/waifu")
      return data.results[0].url
    }

    try {
      const waifuUrl = await getWaifuBest()
      const istriZaboy = await axios.get(waifuUrl, { responseType: "arraybuffer" })
      const istri = Buffer.from(istriZaboy.data)

      res.writeHead(200, {
        "Content-Type": "image/png",
        "Content-Length": istri.length,
      })
      res.end(istri)
    } catch (e) {
      res.status(500).json("Terjadi error: " + e.message)
    }
  },
}
