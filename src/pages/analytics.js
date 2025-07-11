import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axiosInstance";

export default function Analytics() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`/url/analytics/${id}`)
      .then(res => setData(res.data))
      .catch(() => alert("Failed to fetch analytics"));
  }, [id]);

  return (
    <div>
      <h2>Analytics for {id}</h2>
      {data ? (
        <div>
          <p>Total Clicks: {data.totalClicks}</p>
          <ul>
            {data.details.map((click, idx) => (
              <li key={idx}>
                Time: {new Date(click.timestamp).toLocaleString()}, IP: {click.ip}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Loading analytics...</p>
      )}
    </div>
  );
}
