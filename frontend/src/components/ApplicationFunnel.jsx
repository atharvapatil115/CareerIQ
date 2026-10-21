import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function ApplicationFunnel({ stats }) {
  const chartData = [
    { status: "Applied", value: stats.total_applications },
    { status: "Interview", value: stats.interviews },
    { status: "Offer", value: stats.offers },
    { status: "Accepted", value: stats.accepted },
  ];

  return (
    <div className="chart-card">
      <h2>Application Funnel</h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="status" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ApplicationFunnel;