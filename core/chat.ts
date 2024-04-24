import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: process.env.OPENAI_BASE_URL,
    apiKey: process.env.OPENAI_API_KEY,
});

const model = "gpt-3.5-turbo";

export type Chat = {
    readonly parent?: Chat;
    readonly request: string;
    readonly response: string;
}

export async function request(request: string, parent?: Chat, system?: string, max_tokens: number = 256): Promise<Chat> {
    // recreate chat history in reverse order
    let messages: OpenAI.ChatCompletionMessageParam[] = [{role: "user", content: request}];
    for (let chat = parent; chat; chat = chat.parent) {
        messages.push({role: "assistant", content: chat.response}, {role: "user", content: chat.request});
    }
    if (system)
        messages.push({role: "system", content: system});
    console.log(`USER> ${request}`);
    const res = await openai.chat.completions.create({
        model,
        messages: messages.reverse(),
        max_tokens,
    });
    const response = res.choices[0].message.content;
    if (!response)
        throw new Error("OpenAI request failed");
    console.log(`ASSISTANT> ${response}`);
    return {request, response};
}