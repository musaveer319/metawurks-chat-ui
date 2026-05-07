/* eslint-disable @typescript-eslint/no-require-imports */
const fetch = require('node-fetch'); // we can just use native fetch in node >= 18

async function run() {
  try {
    const res = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'What is the current weather in Paris?' }],
        provider: 'groq-llama',
        model: 'llama-3.1-8b-instant'
      })
    });
    
    // read stream
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      process.stdout.write(decoder.decode(value));
    }
    console.log('\n[Done]');
  } catch(e) {
    console.error(e);
  }
}
run();
