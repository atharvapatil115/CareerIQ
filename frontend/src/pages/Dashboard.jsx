import { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import StatsCard  from "../components/StatsCard";

function Dashboard() {
    const { token } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    useEffect(() => {
        const fetchstats = async () => {
            try {
                const response = await fetch(
                    "http://127.0.0.1:8000/dashboard/stats",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.detail || "Failed to fetch dashboard stats"
                    );

                }
                setStats(data);


            }
            catch (error) {
                console.error("Dashboard stats error", error);
                setError(error.message);
            }
            finally {
                setLoading(false);
            }

        };
        if (token) {
            fetchstats();
        }
    }, [token]);
    if (loading) {
        return <p>Loading dashboard...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }
    return (
        <div >
            <h1>Dashboard</h1>

            <div className="stats-grid">
                <StatsCard
                    title="Total Applications"
                    value={stats.total_applications}
                />

                <StatsCard
                    title="Interviews"
                    value = {stats.interviews}
                />

                <StatsCard
                    title = "Offers"
                    value={stats.offers}
                />

                <StatsCard
                    title="Accepted"
                    value = {stats.accepted}
                />
            </div>
        </div>
    );
}

export default Dashboard;