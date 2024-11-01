import { useEffect, useState } from 'react';

function HelloWorld() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/hello/')
            .then((response) => response.json())
            .then((data) => setMessage(data.message))
            .catch((error) => console.error('Error fetching data:', error));
    }, []);

    return (
        <div>
            <h1>Message from Django API:</h1>
            <p>{message}</p>
        </div>
    );
}

export default HelloWorld;
