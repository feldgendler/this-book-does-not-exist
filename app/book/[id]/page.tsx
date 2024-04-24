"use client";
import {useState, useEffect} from "react";
import Link from "next/link";

type TOC = {
    key: string;
    title: string;
    leaf: boolean;
    nested?: TOC;
}[];

export default function Book({params}: {params: {id: string}}) {
    const [title, setTitle] = useState("");
    const [overview, setOverview] = useState("");
    const [contents, setContents] = useState<TOC|undefined>();

    useEffect(() => {
        async function startLoading() {
            const response = await fetch("/api/book", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({id: params.id}),
            });
            const book = await response.json();
            if (!ignore) {
                setTitle(book.title);
                setOverview(book.overview);
                setContents(book.children);
            }
        }

        let ignore = false;
        startLoading();
        return () => { ignore = true; };
    }, []) // start only once

    return <article className="prose">
        {!title && <div className="flex flex-col gap-4 w-52">
            <div className="skeleton h-32 w-full"></div>
            <div className="skeleton h-4 w-28"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
        </div>}
        {title && <h1>{title}</h1>}
        {overview && <p>{overview}</p>}
        {contents && <h2>Table of Contents</h2>}
        {contents && contents.map(({key, title, leaf}, i) => leaf
            ? <p key={key}>{key}. <Link href={`/book/${params.id}/${key}`}>{title}</Link></p>
            : <p key={key}>{key}. {title}</p>
        )}
    </article>;
}