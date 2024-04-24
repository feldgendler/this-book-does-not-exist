import {node, ContentNode} from "../../../core/book";
import {request} from "../../../core/chat";

export async function POST(req: Request) {
    const {id, key} = await req.json();
    const depth = key.split(".").length;

    const child = await node(id, key, false);
    if (!child || !child.content) {
        return new Response("Chapter not found", {status: 404})
    }

    const content = await child.content as ContentNode;

    return Response.json({
        children: content.children.map(({key, title}) => ({key, title, leaf: depth>=3})),
    });
}
