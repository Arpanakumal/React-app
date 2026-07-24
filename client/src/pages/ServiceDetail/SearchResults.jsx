import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const SearchResults = () => {
    const location = useLocation();
    const [results, setResults] = useState([]);

    const query = new URLSearchParams(location.search).get("q");

    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        const searchServices = async () => {
            try {
                const res = await axios.get(`/api/services/search?q=${query}`);
                setResults(res.data.data);
            } catch (err) {
                console.error(err);
            }
        };

        searchServices();
    }, [query]);

    return (
        <div>
            <h2>Search results for "{query}"</h2>

            {results.length > 0 ? (
                results.map((service) => (
                    <div key={service._id}>{service.name}</div>
                ))
            ) : (
                <p>No services found</p>
            )}
        </div>
    );
};

export default SearchResults;