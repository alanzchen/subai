# SubtitleAI

Seamlessly clean up and convert Zoom's VTT subtitles to Markdown with the power of OpenAI.

This command-line tool converts VTT files (used by Zoom for subtitles) into a human-readable format, utilizing the power of OpenAI's GPT model. It makes the transcript much more coherent and ready for subsequent tasks (e.g., summarization).

## Prerequisites

Before using this tool, make sure you have the following:

- [Node.js](https://nodejs.org) installed on your system.

## Usage

To process a VTT file, use the following command:

```shell
export OPENAI_API_KEY=sk-***
npx subai input.vtt output.md
```

Make sure to replace `sk-***` with your OpenAI API key,`input.vtt` with the path to your VTT file, and `output.md` with the desired path for the generated Markdown file.
The API key will be saved temporarily for each shell session, so you only need to re-provide the API for each new shell session (e.g., you opened a new terminal window).

### Environment Variables

SubAI can be customized with the following environment variables:

- `OPENAI_API_MODEL` (defaults to `gpt-3.5-turbo`): The code name of the GPT model to use. You can find available models in the [OpenAI API documentation](https://platform.openai.com/docs/models).
- `OPENAI_API_MAX_TOKENS` (defaults to `2048`): The maximum number of tokens per chunk. You can set this variable to limit the size of the generated Markdown chunks. If not provided, the default value will be used.
- `SUBAI_PROMPT`: Custom prompt for AI. The default prompt is designed to make minimal changes to the original transcript. See `openAIProcessor.js` for the default prompt.

To set an environment variable, run:

```shell
export VARIABLE=VALUE
```

### Additional Commands

In addition to the main `vtt2md` command, this tool provides the following commands:

- `npx --package=subai vtt-clean`: Cleans a VTT file by removing redundant data and timestamps to save tokens. This will be used by `ai-process` below.
- `npx --package=subai ai-process`: Processes the cleaned file with OpenAI, generating a Markdown file.

`npx subai` essentially chains these two commands together.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue on the [GitHub repository](https://github.com/alanzchen/subai).

## License

This tool is licensed under the ISC License. See the [LICENSE](LICENSE) file for more information.

## Author

This tool was created by Zenan (Alan) Chen. You can find more of his work on his [homepage](https://zenan.ch).