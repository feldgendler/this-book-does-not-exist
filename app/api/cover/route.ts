import {book} from "../../../core/book";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id)
        return new Response("Bad request", {status: 400})

    const root = await book(id);
    if (!root) {
        return new Response("Book not found", {status: 404})
    }

    const image = await root.cover;
    const url = await image.url;

    return Response.redirect(url)
}
