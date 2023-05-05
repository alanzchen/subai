#! /usr/bin/env node

const fs = require('fs');
const { Configuration, OpenAIApi } = require("openai");
const { encode } = require('gpt-3-encoder');
const cliProgress = require('cli-progress');

// create a new progress bar instance and use shades_classic theme
const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

const apiKey = process.env.OPENAI_API_KEY;

const configuration = new Configuration({
  apiKey: apiKey,
});
const openai = new OpenAIApi(configuration);

const maxToken = process.env.OPENAI_API_MAX_TOKENS || 2048;
const prompt = 'You are a helpful assistant. Below is a raw trasncript for a meeting. Please turn the following transcript into paragraphs, correct the spelling if needed. Each paragraph should begin with the speaker, then a colon, then the cleaned quotes from the speaker. The results should be ready to be published, but should be as close as the original quote.';
const promptToken = countToken(prompt);

function countToken(text) {
  const encoded = encode(text)
  return encoded.length
}

const segmentAndProcess = async (inputFile, outputFile) => {
  const rawData = fs.readFileSync(inputFile, 'utf8');
  const totalTokens = countToken(rawData);
  const chunks = tokenizeText(rawData, maxToken - promptToken);
  const responses = [];
  let processedTokens = 0;
  console.log("Your transcript is divided into", chunks.length, "chunks with a total of", totalTokens, "tokens.");
  console.log("Each chunk may take some time to process.");
  bar.start(totalTokens, 0);
  for (const chunk of chunks) {
    // show progress
    bar.update(processedTokens);
    try {
      const result = await sendToOpenAI(chunk);
      responses.push(result);
      processedTokens += countToken(chunk);
    } catch (error) {
      console.error('Error in OpenAI API:', error);
      console.log('Interrupted due to OpenAI error.');
      return;
    }
  }

  const markdown = responses.join('\n\n');
  fs.writeFileSync(outputFile, markdown);
  bar.stop();
  console.log(`File saved: ${outputFile}`);
};

const tokenizeText = (text, maxTokensPerChunk) => {
  const chunks = [];
  const lines = text.split('\n');

  let currentChunk = '';
  let currentTokens = 0;

  for (const line of lines) {
    const tokenCount = countToken(line);
    if (currentTokens + tokenCount <= maxTokensPerChunk) {
      currentChunk += line + '\n';
      currentTokens += tokenCount;
    } else {
      chunks.push(currentChunk.trim());
      currentChunk = line + '\n';
      currentTokens = tokenCount;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};

const sendToOpenAI = async (chunk) => {
  const completion = await openai.createChatCompletion({
    model: process.env.OPENAI_API_MODEL || "gpt-3.5-turbo",
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: chunk }
    ],
  });
  return completion.data.choices[0].message.content;
};

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: ai-process input.txt output.md');
    console.log('Use "export OPENAI_API_KEY=sk-***" to provide your API key.');
    console.log('Use "export OPENAI_API_MODEL=<model-code-name>" to specify GPT model.');
    console.log('Use "export OPENAI_API_MAX_TOKENS=<max-tokens-per-chunk>" to specify max tokens per chunk.');
  } else {
    segmentAndProcess(args[0], args[1]);
  }
}

module.exports = { segmentAndProcess };