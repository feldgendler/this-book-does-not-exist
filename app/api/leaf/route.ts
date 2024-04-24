import {node, ContentLeaf} from "../../../core/book";

export async function POST(req: Request) {
    const {id, key} = await req.json();

    const child = await node(id, key, true);
    if (!child || !child.content) {
        return new Response("Chapter not found", {status: 404})
    }

    const content = await child.content as ContentLeaf;

    return Response.json({
        title: child.title,
        text: content.text,
    });
}
