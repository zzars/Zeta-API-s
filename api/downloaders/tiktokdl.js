module.exports = {
  name: "Tiktok DL",
  desc: "Download Tiktok Content",
  category: "Downloaders",
  params: ["url"],
  async run(req, res) {
  const { url } = req.query;
  if (!url || !url.startsWith("https://")) {
    return res.status(400).json({ status: false, message: "Masukkan URL yang valid!" });
  }

  try {
    const result = await scrape.tiktokDl(url);
    if (!result.status) return res.json({ status: false, message: "Gagal fetch data" });

    if (result.duration === "0 Seconds" || result.durations === 0) {
      const images = result.data.map((item, i) => ({
        index: i + 1,
        image_url: item.url
      }));
      return res.json({
        status: true,
        creator: "Zaboy",
        type: "slideshow",
        count: images.length,
        data: images
      });
    } else {
      const video = result.data.find(e => e.type === "nowatermark_hd" || e.type === "nowatermark");
      return res.json({
        status: true,
        creator: "Zaboy",
        type: "video",
        video_url: video?.url || null
      });
    }
  } catch (err) {
    res.status(500).json({ status: false, message: "Server error", error: err.message });
  }
  },
}