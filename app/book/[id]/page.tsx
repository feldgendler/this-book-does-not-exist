"use client";
import {useState, useEffect} from "react";
import Link from "next/link";

type Item = {
    key: string;
    title: string;
    leaf: boolean;
};

export default function Book({params}: {params: {id: string}}) {
    const [title, setTitle] = useState("");
    const [overview, setOverview] = useState("");
    const [contents, setContents] = useState<Item[]|undefined>();

    useEffect(() => {
        async function startLoading() {
            const response = await fetch("/api/book", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({id: params.id}),
            });
            const book = await response.json();
            setTitle(book.title);
            setOverview(book.overview);
            setContents(book.children);
        }
        startLoading();
    }, [params.id]);

    return <article className="prose md:container md:mx-auto mt-24">
        {!title && <div className="flex flex-col gap-4 w-96">
            <div className="skeleton h-32 w-56"></div>
            <div className="skeleton h-4 w-28"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
        </div>}
        {title && <h1 className="mb-2">{title}</h1>}
        {title && <aside>
            <span className="italic">This book does not exist.</span>
            <Link href="/" className="btn btn-xs btn-outline mx-2">Hallucinate another</Link>
        </aside>}
        {overview && <p>{overview}</p>}
        {contents && <h2 className="mb-0">Table of Contents</h2>}
        {contents && <aside className="italic">Click on the chapters to explore</aside>}
        {contents && <ol className="list-none">{contents.map((it) => <ContentNode key={it.key} bookID={params.id} item={it} />)}</ol>}
    </article>;
}

function ContentNode({bookID, item}: {bookID: string, item: Item}) {
    let [expanded, setExpanded] = useState(false);
    let [nested, setNested] = useState<Item[]|undefined>();

    useEffect(() => {
        async function startLoading() {
            const response = await fetch("/api/branch", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({id: bookID, key: item.key}),
            });
            const {children} = await response.json();
            setNested(children);
        }
        if (expanded && !nested)
            startLoading();
    }, [bookID, item, nested, expanded])

    if (item.leaf) {
        return <li>
            {item.key}. <Link href={`/book/${bookID}/${item.key}`} className="no-underline hover:underline font-normal">{item.title}</Link>
        </li>;
    }

    return <li>
        <span className="cursor-pointer" onClick={() => setExpanded(!expanded)}>{item.key}. {item.title}</span>
        {expanded && !nested && <div className="flex flex-col gap-4 w-48 ml-8">
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
        </div>}
        {expanded && nested && <ol className="list-none">{nested.map((it) => <ContentNode key={it.key} bookID={bookID} item={it} />)}</ol>}
    </li>;
}