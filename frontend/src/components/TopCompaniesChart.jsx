import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function TopCompaniesChart({ data, loading, error }) {
  return (
    <div className="chart-card">
      <h2>Top 5 Companies</h2>

      {loading ? (
        <p>Loading companies...</p>
      ) : error ? (
        <p>{error}</p>
      ) : data.length === 0 ? (
        <p>No company applications available yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis type="number" allowDecimals={false} />

            <YAxis
              dataKey="company"
              type="category"
              width={110}
            />

            <Tooltip />

            <Bar
              dataKey="applications"
              fill="#75a9ee"
              radius={[0, 5, 5, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default TopCompaniesChart;