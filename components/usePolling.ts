import { useEffect, useState } from 'react';

export default function usePolling(url:string, intervalTime:number = 5000) {
    const [data, setData] = useState<unknown>();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(url);
                const newData = await response.json();
                setData(newData);
            } catch (err:unknown) {
                console.error(err);
                setData(null);
            }
        };
        fetchData(); // Initial fetch
        const interval = setInterval(fetchData, intervalTime); // Start polling
        return () => clearInterval(interval); // Cleanup on unmount
    }, [url, intervalTime]);
    
    return data;
};