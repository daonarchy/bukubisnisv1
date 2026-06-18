const { GoogleGenAI } = require('@google/genai');

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { prompt, imageBase64 } = JSON.parse(event.body);

    const ai = new GoogleGenAI({});
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    let rawText = response.text.trim();
    rawText = rawText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();

    const parsedData = JSON.parse(rawText);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: Array.isArray(parsedData) ? parsedData : [parsedData] })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Gagal memproses nota: " + error.message })
    };
  }
};
