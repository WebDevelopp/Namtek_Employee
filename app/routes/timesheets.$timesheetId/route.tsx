import { useLoaderData } from "react-router-dom";

export async function loader({ params }) {
  const db = await getDB();
  const timesheetAndEmployee = await db.get(
    "SELECT timesheets.*, employees.full_name, employees.id AS employee_id FROM timesheets JOIN employees ON timesheets.employee_id = employees.id WHERE timesheets.id = ?",
    [params.timesheetId]
  );

  if (!timesheetAndEmployee) {
    throw new Response("Timesheet not found", { status: 404 });
  }

  return { timesheetAndEmployee };
}

export default function ViewTimeSheetEmployeePage() {
  const { timesheetAndEmployee } = useLoaderData();

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "600px",
        margin: "auto",
        backgroundColor: "#f9f9f9",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#333"
      }}
    >
      <h1 style={{ textAlign: "center", color: "#2c3e50" }}>Timesheet #{timesheetAndEmployee.id}</h1>
      <ul style={{ listStyleType: "none", padding: "0", lineHeight: "1.8" }}>
        <li>
          <strong>Employee:</strong> {timesheetAndEmployee.full_name} (ID: {timesheetAndEmployee.employee_id})
        </li>
        <li>
          <strong>Start Time:</strong> {new Date(timesheetAndEmployee.start_time).toLocaleString()}
        </li>
        <li>
          <strong>End Time:</strong> {new Date(timesheetAndEmployee.end_time).toLocaleString()}
        </li>
        <li>
          <strong>Summary:</strong> {timesheetAndEmployee.summary}
        </li>
      </ul>
      <button
        style={{
          padding: "12px 24px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          marginTop: "20px",
          fontWeight: "bold"
        }}
      >
        <a
          href={`/timesheets/edit/${timesheetAndEmployee.id}`}
          style={{
            color: "inherit",
            textDecoration: "none"
          }}
        >
          Edit Timesheet
        </a>
      </button>
      <hr style={{ margin: "24px 0", border: "1px solid #ddd" }} />
      <ul style={{ listStyleType: "none", padding: "0" }}>
        <li style={{ marginBottom: "10px" }}>
          <a
            href={`/employees/${timesheetAndEmployee.employee_id}`}
            style={{
              color: "#007bff",
              textDecoration: "none",
              fontWeight: "bold"
            }}
          >
            Back to Employee Details
          </a>
        </li>
        <li>
          <a
            href="/timesheets"
            style={{
              color: "#007bff",
              textDecoration: "none",
              fontWeight: "bold"
            }}
          >
            Timesheets
          </a>
        </li>
      </ul>
    </div>
  );
}
