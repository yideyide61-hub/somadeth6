import multer from "multer";
import nextConnect from "next-connect";
import fetch from "node-fetch";

const upload = multer({ storage: multer.memoryStorage() });

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ error: `Something went wrong: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.use(upload.single("file"));

apiRoute.post(async (req, res) => {
  try {
    const { title } = req.body;

    // 🔑 Telegram credentials (set in Vercel → Project Settings → Environment Variables)
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      return res.status(500).json({ error: "Missing Telegram credentials" });
    }

    // Build message
    const message = `📌 New Upload\nTitle: ${title}`;

    // Send text message
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
      }),
    });

    // If file uploaded, send photo to Telegram
    if (req.file) {
      const formData = new FormData();
      formData.append("chat_id", CHAT_ID);
      formData.append("photo", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: "POST",
        body: formData,
      });
    }

    res.status(200).json({ success: true, title });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export const config = {
  api: {
    bodyParser: false, // Disables Next.js body parsing, required for multer
  },
};

export default apiRoute;
