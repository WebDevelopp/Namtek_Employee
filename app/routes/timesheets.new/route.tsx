import { useLoaderData, useActionData, Form, redirect } from "react-router-dom";
import { useState } from "react";
import { getDB } from "~/db/getDB";

export async function loader() {
  const db = await getDB();
  const employees = await db.all("SELECT id, full_name FROM employees");
  return { employees };
}

export const action = async ({ request }) => {
  const formData = await request.formData();
  const employee_id = formData.get("employee_id");
  const start_time = formData.get("start_time");
  const end_time = formData.get("end_time");
  const summary = formData.get("summary");

  if (!employee_id || !start_time || !end_time || !summary) {
    return { error: "All fields are required" };
  }

  if (new Date(start_time) >= new Date(end_time)) {
    return { error: "End time must be after start time" };
  }

  const db = await getDB();
  const employeeExists = await db.get("SELECT id FROM employees WHERE id = ?", [employee_id]);
  if (!employeeExists) {
    return { error: "Invalid employee selected" };
  }

  try {
    await db.run(
      "INSERT INTO timesheets (employee_id, start_time, end_time, summary) VALUES (?, ?, ?, ?)",
      [employee_id, start_time, end_time, summary]
    );
    return redirect("/timesheets");
  } catch (err) {
    return { error: "An unexpected error occurred. Please try again." };
  }
};

export default function NewTimesheetPage() {
  const { employees } = useLoaderData();
  const actionData = useActionData();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    const startTime = document.getElementById("start_time").value;
    const endTime = document.getElementById("end_time").value;

    if (new Date(startTime) >= new Date(endTime)) {
      e.preventDefault();
      alert("End time must be after start time.");
      return;
    }
    setLoading(true);
  };

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
        color: "#333",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#2c3e50" }}>Create New Timesheet</h1>
      {actionData?.error && (
        <div style={{
          color: "#d9534f",
          backgroundColor: "#f8d7da",
          padding: "12px",
          borderRadius: "8px",
          marginBottom: "16px",
          fontWeight: "bold",
          textAlign: "center",
        }}>
          {actionData.error}
        </div>
      )}
      <Form method="post" onSubmit={handleSubmit}>
        <div style={{ marginBottom: "16px" }}>
          <label
            htmlFor="employee_id"
            style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}
          >
            Employee
          </label>
          <select
            name="employee_id"
            id="employee_id"
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "16px",
            }}
          >
            <option value="" disabled hidden>
              -- Select an Employee --
            </option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.full_name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label
            htmlFor="start_time"
            style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}
          >
            Start Time
          </label>
          <input
            type="datetime-local"
            name="start_time"
            id="start_time"
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "16px",
            }}
          />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label
            htmlFor="end_time"
            style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}
          >
            End Time
          </label>
          <input
            type="datetime-local"
            name="end_time"
            id="end_time"
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "16px",
            }}
          />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label
            htmlFor="summary"
            style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}
          >
            Summary
          </label>
          <textarea
            name="summary"
            id="summary"
            rows="4"
            placeholder="Describe the work done during this period"
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "16px",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            }}
            required
          />
        </div>
        <button
          type="submit"
          style={{
            padding: "12px 24px",
            backgroundColor: loading ? "#6c757d" : "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            width: "100%",
            fontSize: "16px",
          }}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Create Timesheet"}
        </button>
      </Form>
      <hr style={{ margin: "24px 0", border: "1px solid #ddd" }} />
      <ul style={{ listStyleType: "none", padding: "0" }}>
        <li style={{ marginBottom: "10px" }}>
          <a
            href="/timesheets"
            style={{
              color: "#007bff",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Timesheets
          </a>
        </li>
        <li>
          <a
            href="/employees"
            style={{
              color: "#007bff",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Employees
          </a>
        </li>
      </ul>
    </div>
  );
}