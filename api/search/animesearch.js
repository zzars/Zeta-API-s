module.exports = {
  name: "Anime Search",
  desc: "Search Anime From Anilist.",
  category: "Search",
  params: ["q"],
  async run(req, res) {
    const q = req.query.q
    if (!q) {
      return res.status(500).json("query is required!")
    }

    try {
      const resoeld = await scrape.searchAnime(q)
      res.status(200).json({
        status: true,
        creator: "Zaboy",
        data: resoeld,
      })
    } catch (err) {
      res.status(500).json("Gagal mengambil data: " + err.message)
    }
  },
}
