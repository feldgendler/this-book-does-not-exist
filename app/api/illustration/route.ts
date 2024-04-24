import {node, ContentLeaf} from "../../../core/book";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const key = searchParams.get("key");
    if (!id || !key)
        return new Response("Bad request", {status: 400})

    const child = await node(id, key, true);
    if (!child || !child.content) {
        return new Response("Chapter not found", {status: 404})
    }

    const content = await child.content as ContentLeaf;
    const image = await content.illustration;
    const url = await image.url;

    return Response.redirect(url)
}
