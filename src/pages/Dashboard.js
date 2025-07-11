import React, { useState } from "react";
import axios from "../api/axiosInstance";

export default function Dashboard() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");

  const shorten = async () => {
    try {
      const res = await axios.post("/url/shorten", { fullUrl: url });
      setShortUrl(`http://localhost:5000/api/url/${res.data.shortId}`);
    } catch {
      alert("URL shortening failed");
    }
  };

  return (
    <div>
      <h2>Shorten URL</h2>
      <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Enter long URL" />
      <button onClick={shorten}>Shorten</button>
      {shortUrl && <p>Shortened: <a href={shortUrl}>{shortUrl}</a></p>}
    </div>
  );
}
