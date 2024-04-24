import { Chat, request } from "./chat";
import slugify from "slugify";
import crypto from "crypto";
import { Butterfly_Kids } from "next/font/google";

export type Book = {
    title: string;
    overview: string;
} & ContentNode;

export type ContentNode = {
    context: Chat;
    children: Child[];
};

export type ContentLeaf = {
    context: Chat;
    text: string;
};

export type Child = {
    key: string; // section path like 1.2.3
    title: string;
    content?: Promise<ContentNode | ContentLeaf>;
};


const titleToID = new Map<string, string>();
const byID = new Map<string, Promise<Book>>();

export function create(title: string): string {
    let id = titleToID.get(title);
    if (!id) {
        // unique ID even for different titles with the same slug
        id = slugify(title, {lower: true, strict: true})+"-"+crypto.createHash("sha1").update(title).digest("hex").slice(0, 8);
        titleToID.set(title, id);
        byID.set(id, newBook(title)); // start generating asynchronously
    }
    return id;
}

export async function root(id: string): Promise<Book|null> {
    const bookPromise = byID.get(id);
    if (!bookPromise) {
        return null;
    }
    return await bookPromise;
}

async function newBook(title: string): Promise<Book> {
    let context = await request(`Explore the book "${title}" by A. Robertson, I. Nichols. Answer with a one paragraph overview.`);
    const overview = context.response;

    context = await request("Table of contents, one depth level, one entry per line, numbered", context);
    let children: Child[] = [];
    for (let line of context.response.split("\n")) {
        let m = /^(\d+)\.\s+(.*)$/.exec(line);
        if (!m)
            throw new Error("Failed to parse chatbot response\n"+context.response);
        children.push({key: m[1], title: m[2]});
    }

    return {title, overview, context, children};
}
