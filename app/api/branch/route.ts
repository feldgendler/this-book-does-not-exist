import {branch} from "../../../core/book";
import {request} from "../../../core/chat";

export async function POST(req: Request) {
    const {id, key} = await req.json();
    const depth = key.split(".").length;

    const node = await branch(id, key);
    if (!node) {
        return new Response("Book not found", {status: 404})
    }

    return Response.json({
        children: node.children.map(({key, title}) => ({key, title, leaf: depth>=3})),
    });
}
