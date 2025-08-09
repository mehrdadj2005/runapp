import { useEffect, useRef, useState } from 'react';

function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371000;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    return d;
}

export default function StepCounter() {
    const [steps, setSteps] = useState(0);
    const [distance, setDistance] = useState(0);
    const [error, setError] = useState(null);

    const prevPosition = useRef(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation پشتیبانی نمی‌شود.');
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;

                if (prevPosition.current) {
                    const dist = haversineDistance(
                        prevPosition.current.latitude,
                        prevPosition.current.longitude,
                        latitude,
                        longitude
                    );

                    if (dist > 0) {
                        setDistance((prevDist) => {
                            const newDist = prevDist + dist;
                            // هر 10 متر، 13 قدم
                            setSteps(Math.floor((newDist / 10) * 13));
                            return newDist;
                        });
                    }
                }

                prevPosition.current = { latitude, longitude };
            },
            (err) => {
                setError(err.message);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 1000,
                timeout: 15000,
            }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>قدم‌شمار با GPS (Next.js)</h1>
            {error ? (
                <p style={{ color: 'red' }}>خطا: {error}</p>
            ) : (
                <>
                    <p>مسافت طی شده: {distance.toFixed(2)} متر</p>
                    <p>تعداد قدم‌ها: {steps}</p>
                </>
            )}
        </div>
    );
}
