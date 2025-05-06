const QRCode = require("qrcode")
module.exports = {
  name: "Text to QR Code",
  desc: "From text to QR Code",
  category: "Tools",
  params: ["text"],
  async run(req, res) {
    const text = req.query.text

    if (!text) {
      return res.status(400).json("Text pada parameter text= diperlukan!")
    }

    try {
      const buffer = await QRCode.toBuffer(text, {
        type: "png",
        errorCorrectionLevel: "H",
        scale: 8,
      })

      res.setHeader("Content-Type", "image/png")
      res.send(buffer)
    } catch (err) {
      res.status(500).json("Gagal membuat QR Code.")
    }
  },
}
