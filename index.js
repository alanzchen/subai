#! /usr/bin/env node

const { segmentAndProcess } = require('./openAIProcessor');
const { parseVttFile } = require('./vttParser');
const fs = require('fs');

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: npx subai input.vtt output.md');
  console.log('Use "export OPENAI_API_KEY=sk-***" to provide your API key.');
  console.log('Use "export OPENAI_API_MODEL=<model-code-name>" to specify GPT model.');
  console.log('Use "export OPENAI_API_MAX_TOKENS=<max-tokens-per-chunk>" to specify max tokens per chunk.');
} else {
  console.log(args[0], args[1])
  parseVttFile(args[0], args[1] + ".tmp")
  console.log("Parsing complete. Now processing with OpenAI...");
  segmentAndProcess(args[1] + ".tmp", args[1]).then(() => {
    fs.unlinkSync(args[1] + ".tmp");
  });
}