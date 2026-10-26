import { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import StatsCard from "../components/StatsCard";
import ApplicationFunnel from "../components/ApplicationFunnel";
import ApplicationsOverTime from "../components/ApplicationsOverTime";
import TopCompaniesChart from "../components/TopCompaniesChart";
import { apiUrl } from "../api";
import Loader from "./components/Loader";

function Dashboard() {
    const { token } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");
    const [monthlyData, setMonthlyData] = useState([]);
    const [topCompanies, setTopCompanies] = useState([]);
    const [companiesLoading, setCompaniesLoading] = useState(true);
    const [companiesError, setCompaniesError] = useState("");


    useEffect(() => {
        const fetchstats = async () => {
            try {
                const response = await fetch(apiUrl("/dashboard/stats"), {
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



    useEffect(() => {
        if (!token) return;

        const fetchMonthlyApplications = async () => {
            try {
                const response = await fetch(apiUrl("/dashboard/applications-over-time"), {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.detail || "Failed to fetch monthly applications"
                    );
                }

                setMonthlyData(data);
            } catch (error) {
                console.error("Monthly applications error:", error);
            }
        };

        fetchMonthlyApplications();
    }, [token]);
    useEffect(() => {
        if (!token) {
            setCompaniesLoading(false);
            return;
        }

        const fetchTopCompanies = async () => {
            try {
                const response = await fetch(apiUrl("/dashboard/top-companies"), {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.detail || "Failed to fetch top companies"
                    );
                }

                setTopCompanies(data);
            } catch (error) {
                console.error("Top companies error:", error);
                setCompaniesError(error.message);
            } finally {
                setCompaniesLoading(false);
            }
        };

        fetchTopCompanies();
    }, [token]);

    if (loading) {
  return <Loader message="Loading your dashboard..." />;
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
                    value={stats.interviews}
                />

                <StatsCard
                    title="Offers"
                    value={stats.offers}
                />

                <StatsCard
                    title="Accepted"
                    value={stats.accepted}
                />
            </div>
            <ApplicationFunnel stats={stats} />
            <ApplicationsOverTime data={monthlyData} />
            <TopCompaniesChart
                data={topCompanies}
                loading={companiesLoading}
                error={companiesError}
            />

        </div>
    );
}

export default Dashboard;