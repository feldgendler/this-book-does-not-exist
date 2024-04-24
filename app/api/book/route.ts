import {book} from "../../../core/book";

export async function POST(req: Request) {
    const {id} = await req.json();

    const root = await book(id);
    if (!root) {
        return new Response("Book not found", {status: 404})
    }
    return Response.json({
        title: root.title,
        overview: root.overview,
        children: root.children.map(({key, title}) => ({key, title, leaf: false})),
    });
}
