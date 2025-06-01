import express from 'express';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
import FormData from 'form-data';

dotenv.config();
const router = express.Router();

router.post("/generate", async (req, res) => {
  try {
    const { userPrompt } = req.body;
    if (!userPrompt) {
      throw new Error("Prompt is required.");
    }

    console.log("Received user prompt:", userPrompt);

    const form = new FormData();
    form.append('prompt', userPrompt);

    const formHeaders = form.getHeaders();
    formHeaders['x-api-key'] = process.env.CLIPDROP_API_KEY;

    const clipDropResponse = await fetch(
      "https://clipdrop-api.co/text-to-image/v1",
      {
        method: "POST",
        headers: formHeaders,
        body: form,
      }
    );

    if (!clipDropResponse.ok) {
      const errorData = await clipDropResponse.json();
      console.error("ClipDrop API error:", errorData);
      return res.status(clipDropResponse.status).json({ error: errorData.error || "Unknown error" });
    }

    const imageBuffer = await clipDropResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");

    console.log("Generated image successfully");
    res.status(200).json({ photo: imageBase64 });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

