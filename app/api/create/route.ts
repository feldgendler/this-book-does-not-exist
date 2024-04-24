import {create} from "../../../core/book";
import {request} from "../../../core/chat";

export async function POST(req: Request) {
    const {title} = await req.json();

    const id = await create(title);
    return Response.json({id});
}
