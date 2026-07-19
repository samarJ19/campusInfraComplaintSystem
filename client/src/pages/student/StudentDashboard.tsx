import StudentDashboardCard from "../../components/dashboard/StudentDashboardCard";

import { useStudentDashboard } from "../../hooks/useStudentDashboard";

export default function StudentDashboard() {
  const {
    data,

    isLoading,

    isError,
  } = useStudentDashboard();

  if (isLoading) {
    return <h2>Loading...</h2>;
  }

  if (isError || !data) {
    return <h2>Error loading dashboard.</h2>;
  }

  return (
    <div>
      <h1>Student Dashboard</h1>

      <StudentDashboardCard
        title="Total Complaints"
        value={data.stats.totalComplaints}
      />

      <StudentDashboardCard
        title="Pending"
        value={data.stats.pendingApproval}
      />

      <StudentDashboardCard
        title="Assigned"
        value={data.stats.assigned}
      />

      <StudentDashboardCard
        title="In Progress"
        value={data.stats.inProgress}
      />

      <StudentDashboardCard title="Resolved" value={data.stats.resolved} />

      <StudentDashboardCard title="Rejected" value={data.stats.rejected} />

      <StudentDashboardCard
        title="average Resolution Time (hours)"
        value={data.stats.averageResolutionTimeHours}
      />

      <hr />

      <h2>Recent Complaints</h2>

      {data.recentComplaints.map((complaint) => (
        <div key={complaint.id}>
          <h4>{complaint.title}</h4>

          <p>{complaint.status}</p>
        </div>
      ))}
    </div>
  );
}
