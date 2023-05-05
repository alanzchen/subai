#! /usr/bin/env node

const fs = require('fs');
const { WebVTTParser } = require('webvtt-parser');

const parseVttFile = (inputFile, outputFile) => {
  console.log("Parsing", inputFile, "to", outputFile, "...")
  const data = fs.readFileSync(inputFile, 'utf8');
  const parser = new WebVTTParser();
  const parsedVtt = parser.parse(data, 'metadata');
  const cleanedText = extractAndCleanText(parsedVtt);
  fs.writeFileSync(outputFile, cleanedText);
  console.log(`Cleaned subtitle saved: ${outputFile}`);
};


const extractAndCleanText = (parsedVtt) => {
  let result = '';
  let currentSpeaker = '';
  let currentLines = '';

  for (const cue of parsedVtt.cues) {
    const line = cue.text.trim();
    const speakerMatch = line.match(/^(.+):/);

    if (speakerMatch) {
      const speaker = speakerMatch[1];
      if (currentSpeaker === speaker) {
        currentLines += ' ' + line.replace(speaker + ':', '').trim();
      } else {
        if (currentSpeaker) {
          result += `${currentSpeaker}: ${currentLines}\n`;
          currentLines = '';
        }
        currentSpeaker = speaker;
        currentLines = line.replace(speaker + ':', '').trim();
      }
    } else {
      currentLines += ' ' + line;
    }
  }

  if (currentSpeaker) {
    result += `${currentSpeaker}: ${currentLines}\n`;
  }

  return result;
};


if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: npx vtt-clean input.vtt output.txt');
  } else {
    parseVttFile(args[0], args[1]);
  }
}

module.exports = { parseVttFile };