interface Props {
  title: string;

  value: number;
}

export default function StudentDashboardCard({
  title,

  value,
}: Props) {
  return (
    <div
      style={{
        border: "1px solid black",
        padding: 20,
        marginBottom: 10,
      }}
    >
      <h3>{title}</h3>

      <h1>{value}</h1>
    </div>
  );
}
