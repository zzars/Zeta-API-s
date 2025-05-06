const yts = require("yt-search")

module.exports = {
  name: "Youtube Search",
  desc: "Search Youtube Video",
  category: "Search",
  params: ["q"],
  async run(req, res) {
    const { q } = req.query

    if (!q) {
      return res.status(400).json({ status: false, message: 'Parameter "q" (query) diperlukan!' })
    }

    try {
      const searchResult = await yts(q)
      const results = searchResult.videos.map((video) => ({
        title: video.title,
        url: video.url,
        timestamp: video.timestamp,
        duration: video.duration.seconds,
        views: video.views,
        author: video.author.name,
        thumbnail: video.thumbnail,
      }))

      res.status(200).json({
        status: true,
        creator: "Zaboy",
        result: results,
      })
    } catch (err) {
      res.status(500).json({ status: false, message: "Gagal mencari video", error: err.message })
    }
  },
}
