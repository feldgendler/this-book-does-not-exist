"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  return <main>
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <form className="max-w-2xl" onSubmit={async (e)=>{
          e.preventDefault();
          setLoading(true);
          const response = await fetch("/api/create", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({title}),
          });
          const {id} = await response.json();
          router.push(`/book/${id}`);
        }}>
          <h1 className="text-5xl font-bold">This Book Does Not Exist</h1>
          <p className="py-6">Artificial intelligence will hallucinate the book you always wanted to read.</p>
          <input
            type="text"
            placeholder="Book title"
            className="input w-full max-w-xs"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button type="submit" className="btn btn-primary mx-1" disabled={!title || loading}>
            {loading && <span className="loading loading-spinner absolute" />}
            <span className={loading ? "invisible" : ""}>Hallucinate!</span>
          </button>
        </form>
      </div>
    </div>
  </main>;
}
