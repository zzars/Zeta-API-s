module.exports = {
  name: "Random Quote",
  desc: "Get a random inspirational quote",
  category: "Random",
  async run(req, res) {
    try {
      const quotes = [
        {
          quote: "The only way to do great work is to love what you do.",
          author: "Steve Jobs",
        },
        {
          quote: "Life is what happens when you're busy making other plans.",
          author: "John Lennon",
        },
        {
          quote: "The future belongs to those who believe in the beauty of their dreams.",
          author: "Eleanor Roosevelt",
        },
        {
          quote: "In the end, it's not the years in your life that count. It's the life in your years.",
          author: "Abraham Lincoln",
        },
        {
          quote: "The purpose of our lives is to be happy.",
          author: "Dalai Lama",
        },
        {
          quote: "Get busy living or get busy dying.",
          author: "Stephen King",
        },
        {
          quote: "You only live once, but if you do it right, once is enough.",
          author: "Mae West",
        },
        {
          quote:
            "Many of life's failures are people who did not realize how close they were to success when they gave up.",
          author: "Thomas A. Edison",
        },
        {
          quote: "If you want to live a happy life, tie it to a goal, not to people or things.",
          author: "Albert Einstein",
        },
        {
          quote: "Never let the fear of striking out keep you from playing the game.",
          author: "Babe Ruth",
        },
        {
          quote: "Your time is limited, don't waste it living someone else's life.",
          author: "Steve Jobs",
        },
        {
          quote: "The best way to predict the future is to create it.",
          author: "Peter Drucker",
        },
        {
          quote: "The journey of a thousand miles begins with one step.",
          author: "Lao Tzu",
        },
        {
          quote: "The only impossible journey is the one you never begin.",
          author: "Tony Robbins",
        },
        {
          quote: "The mind is everything. What you think you become.",
          author: "Buddha",
        },
      ]

      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]

      res.status(200).json({
        status: true,
        creator: "Zaboy",
        result: randomQuote,
      })
    } catch (error) {
      res.status(500).json({ status: false, error: error.message })
    }
  },
}
