module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    res.status(500).json({
      ok: false,
      error: "Missing Telegram environment variables"
    });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (error) {
      body = { message: body };
    }
  }

  const message = body && typeof body.message === "string" ? body.message : "";
  const trimmed = message.trim();

  if (!trimmed) {
    res.status(400).json({ ok: false, error: "Message is required" });
    return;
  }

  const safeMessage = trimmed.slice(0, 4096);

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: safeMessage
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.ok) {
      res.status(502).json({ ok: false, error: "Telegram error", details: data });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Telegram request failed:", error);
    res.status(502).json({ ok: false, error: "Telegram request failed" });
  }
};
