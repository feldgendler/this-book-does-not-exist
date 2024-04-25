import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: process.env.OPENAI_BASE_URL,
    apiKey: process.env.OPENAI_API_KEY,
});

const chatModel = "gpt-3.5-turbo";
const imageModel = "dall-e-3";
const imageQuality = "hd";
const imageSize = "1024x1024";

export type Chat = {
    readonly parent?: Chat;
    readonly request: string;
    readonly response: string;
}

export async function chatRequest(request: string, parent?: Chat, system?: string, max_tokens: number = 256): Promise<Chat> {
    // recreate chat history in reverse order
    let messages: OpenAI.ChatCompletionMessageParam[] = [{role: "user", content: request}];
    for (let chat = parent; chat; chat = chat.parent) {
        messages.push({role: "assistant", content: chat.response}, {role: "user", content: chat.request});
    }
    if (system) {
        messages.push({role: "system", content: system});
        console.log(`SYSTEM> ${system}`);
    }
    console.log(`USER> ${request}`);
    const res = await openai.chat.completions.create({
        model: chatModel,
        messages: messages.reverse(),
        max_tokens,
    });
    const response = res.choices[0].message.content;
    if (!response)
        throw new Error("Chat completion failed");
    console.log(`ASSISTANT> ${response}`);
    return {request, response};
}

export async function generateImage(prompt: string): Promise<string> {
    const res = await openai.images.generate({
        prompt,
        model: imageModel,
        quality: imageQuality,
        size: imageSize,
    });
    const url = res.data[0].url;
    if (!url)
        throw new Error("Image generation failed")
    console.log(`DALL-E> ${url}`);
    return url;
}