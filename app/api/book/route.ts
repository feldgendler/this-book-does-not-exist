import {root} from "../../../core/book";
import {request} from "../../../core/chat";

export async function POST(req: Request) {
    const {id} = await req.json();

    const book = await root(id);
    if (!book) {
        return new Response("Book not found", {status: 404})
    }
    return Response.json({
        title: book.title,
        overview: book.overview,
        children: book.children.map(({key, title}) => ({key, title, leaf: false})),
    });
}
