import { OpenAI } from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { functions, runFunction } from "./functions";

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "edge";

export async function POST(req: Request) {

  const { messages } = await req.json();

  // check if the conversation requires a function call to be made
  const initialResponse = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
    messages,
    stream: true,
    functions,
    function_call: "auto",
  });

  const stream = OpenAIStream(initialResponse, {
    experimental_onFunctionCall: async (
      { name, arguments: args },
      createFunctionCallMessages,
    ) => {
      const result = await runFunction(name, args);
      const newMessages = createFunctionCallMessages(result);
      return openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        stream: true,
        messages: [...messages, ...newMessages],
        temperature: 0.5,
        max_tokens: 25,
      });
    },
  });

  return new StreamingTextResponse(stream);
}
