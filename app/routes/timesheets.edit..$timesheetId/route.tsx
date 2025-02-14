import { useLoaderData, Form, useActionData, redirect } from "react-router-dom";
import { getDB } from "~/db/getDB";

export async function loader({ params }) {
  const db = await getDB();
  const employees = await db.all("SELECT id, full_name FROM employees");
  const timesheet = await db.get("SELECT * FROM timesheets WHERE id = ?", [params.timesheetId]);

  if (!timesheet) {
    throw new Response("Timesheet not found", { status: 404 });
  }

  return { employees, timesheet };
}

export const action = async ({ request, params }) => {
  const formData = await request.formData();
  const employee_id = formData.get("employee_id");
  const start_time = formData.get("start_time");
  const end_time = formData.get("end_time");
  const summary = formData.get("summary");
  let errors = {};

  if (!employee_id) errors.employee_id = "Please select an employee.";
  if (!start_time) errors.start_time = "Start time is required.";
  if (!end_time) errors.end_time = "End time is required.";
  if (new Date(start_time) >= new Date(end_time)) {
    errors.end_time = "End time must be after start time.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const db = await getDB();
  await db.run(
    "UPDATE timesheets SET employee_id = ?, start_time = ?, end_time = ?, summary = ? WHERE id = ?",
    [employee_id, start_time, end_time, summary, params.timesheetId]
  );

  return redirect("/timesheets");
};

export default function EditTimeSheetEmployeePage() {
  const { employees, timesheet } = useLoaderData();
  const actionData = useActionData();

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
      <h1 style={{ textAlign: "center", color: "#2c3e50" }}>Edit Timesheet</h1>
      <Form method="post">
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
            defaultValue={timesheet.employee_id}
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "16px"
            }}
          >
            <option value="">Select an Employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.full_name}
              </option>
            ))}
          </select>
          {actionData?.errors?.employee_id && (
            <p style={{ color: "red" }}>{actionData.errors.employee_id}</p>
          )}
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
            defaultValue={timesheet.start_time}
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "16px"
            }}
          />
          {actionData?.errors?.start_time && (
            <p style={{ color: "red" }}>{actionData.errors.start_time}</p>
          )}
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
            defaultValue={timesheet.end_time}
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "16px"
            }}
          />
          {actionData?.errors?.end_time && (
            <p style={{ color: "red" }}>{actionData.errors.end_time}</p>
          )}
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
            defaultValue={timesheet.summary || ""}
            placeholder="Describe the work done during this period"
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "16px",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: "12px 24px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            width: "100%",
            fontSize: "16px"
          }}
        >
          Update Timesheet
        </button>
      </Form>
    </div>
  );
}
