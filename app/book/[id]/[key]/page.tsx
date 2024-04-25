"use client";
import CardContainer from "@/app/components/CardContainer";
import {useState, useEffect} from "react";
import Markdown from "react-markdown";

export default function Page({params}: {params: {id: string, key: string}}) {
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");

    useEffect(() => {
        async function startLoading() {
            const response = await fetch("/api/leaf", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({id: params.id, key: params.key}),
            });
            const leaf = await response.json();
            setTitle(leaf.title);
            setText(leaf.text);
        }
        startLoading();
    }, [params.id, params.key]);

    const imageURL = `/api/illustration?id=${params.id}&key=${params.key}`;

    return <div className="bg-gray-300 h-screen flex justify-center items-center">
        <article className="prose md:container md:mx-auto mt-24">
            {!title && <div className="flex flex-col gap-4 w-96">
                <div className="skeleton h-32 w-56"></div>
                <div className="skeleton h-4 w-28"></div>
                <div className="skeleton h-4 w-full"></div>
                <div className="skeleton h-4 w-full"></div>
                <div className="skeleton h-4 w-full"></div>
            </div>}
            <div className="flex">
                {title && <CardContainer>
                    {title && <h1 className="mb-2">{params.key}. {title}</h1>}
                    {text && <Markdown className="mx-1.5" skipHtml={true}>{text}</Markdown>}
                </CardContainer>}
                
                {title && <CardContainer>
                        <>
                            {title && <a href={imageURL} className="block cursor-zoom-in float-right m-8 size-128" target="_blank">
                                <img className="m-0 skeleton" src={imageURL} width={512} height={512} alt={title} />
                            </a>}
                            <figcaption className="text-xs text-gray-500 italic">Illustration: {title}</figcaption>
                        </>
                </CardContainer>}
                    
            </div>
        
            
        </article>;
    </div>
}