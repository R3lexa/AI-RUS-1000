import ZAI from '/home/z/.bun/install/global/node_modules/z-ai-web-dev-sdk/dist/index.js';
import fs from 'fs';

const videoPath = process.argv[2];
const promptPath = process.argv[3];
const prompt = fs.readFileSync(promptPath, 'utf-8');

async function main() {
  try {
    const zai = await ZAI.create();
    const buf = fs.readFileSync(videoPath);
    const b64 = buf.toString('base64');
    const dataUri = `data:video/mp4;base64,${b64}`;

    const response = await zai.chat.completions.createVision({
      model: 'glm-4.6v',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'video_url', video_url: { url: dataUri } }
          ]
        }
      ],
      thinking: { type: 'disabled' }
    });

    const reply = response.choices?.[0]?.message?.content;
    console.log(reply ?? JSON.stringify(response, null, 2));
  } catch (err) {
    console.error('FAILED:', err?.message || err);
    process.exit(1);
  }
}

main();
