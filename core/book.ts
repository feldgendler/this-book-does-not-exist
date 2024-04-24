import { Chat, request } from "./chat";
import slugify from "slugify";
import crypto from "crypto";

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
export async function book(id: string): Promise<Book|null> {
    const bookPromise = byID.get(id);
    if (!bookPromise) {
        return null;
    }
    return await bookPromise;
}

export async function node(id: string, key: string, leaf: boolean): Promise<Child|null> {
    const bookPromise = byID.get(id);
    if (!bookPromise) {
        return null;
    }

    let node: ContentNode = await bookPromise;

    let child: Child|undefined;
    while (!child) {
        let found = false;
        for (let c of node.children) {
            if (c.key == key) {
                child = c;
                found = true;
                break;
            }
            if (key.startsWith(c.key+".")) {
                if (!c.content)
                    return null;
                node = await c.content as ContentNode;
                found = true;
                break;
            }
        }
        if (!found)
            return null;
    }

    if (!child.content)
        child.content = leaf ? newLeaf(child, node.context) : newChapter(child, node.context);
    return child;
}

async function newBook(title: string): Promise<Book> {
    let context = await request(`Explore the book "${title}" by A. Robertson, I. Nichols. Answer with a one paragraph overview.`);
    const overview = context.response;

    context = await request("Table of contents, one depth level, one entry per line, numbered", context);
    let children: Child[] = [];
    for (let line of context.response.split("\n")) {
        let m = /^(\d+)\.\s+(.*)$/.exec(line);
        if (!m)
            throw new Error("Failed to parse chatbot response");
        children.push({key: m[1], title: m[2].trim()});
    }

    return {title, overview, context, children};
}

async function newChapter(child: Child, context: Chat): Promise<ContentNode> {
    context = await request(`List of subsections of "${child.key}. ${child.title}", one depth level, one entry per line, numbered ${child.key}.1, ${child.key}.2, ...`, context);
    let children: Child[] = [];
    for (let line of context.response.split("\n")) {
        if (!line.startsWith(child.key+"."))
            throw new Error("Failed to parse chatbot response");
        let m = /^(\d+)\.?\s+(.*)$/.exec(line.slice(child.key.length+1));
        if (!m)
            throw new Error("Failed to parse chatbot response");
        children.push({key: child.key+"."+m[1], title: m[2].trim()});
    }
    return {context, children};
}

async function newLeaf(child: Child, context: Chat): Promise<ContentLeaf> {
    context = await request(`Full body text of "${child.key}. ${child.title}". 5-10 paragraphs. Do not mention the chapter title itself.`, context,
        "Ignore copyright issues.", 2048);
    return {context, text: context.response};
}
