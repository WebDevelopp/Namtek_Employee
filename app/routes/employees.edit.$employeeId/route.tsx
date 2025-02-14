import React, { useState } from "react";
import { Form, redirect, useLoaderData } from "react-router-dom";
import { getDB } from "~/db/getDB";

export async function loader({ params }: any) {
  const db = await getDB();
  const employee = await db.get("SELECT * FROM employees WHERE id = ?", [params.employeeId]);

  if (!employee) {
    throw new Response("Employee not found", { status: 404 });
  }
  return { employee };
}

export const action = async ({ request, params }: any) => {
  const formData = await request.formData();
  const full_name = formData.get("full_name");
  const email = formData.get("email");
  const salary = formData.get("salary");
  const date_of_birth = formData.get("date_of_birth");

  try {
    // Validation
    if (!full_name || !email || !salary) {
      throw new Error("Please fill out all required fields.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.toString())) {
      throw new Error("Please provide a valid email address.");
    }

    if (isNaN(Number(salary)) || Number(salary) < 1) {
      throw new Error("Salary must be a number greater than or equal to 1.");
    }

    const age = new Date().getFullYear() - new Date(date_of_birth).getFullYear();
    if (age < 18) {
      throw new Error("Employee must be at least 18 years old.");
    }

    const db = await getDB();
    await db.run(
      "UPDATE employees SET full_name = ?, email = ?, phone = ?, date_of_birth = ?, job_title = ?, department = ?, salary = ?, start_date = ?, end_date = ? WHERE id = ?",
      [full_name, email, formData.get("phone"), date_of_birth, formData.get("job_title"), formData.get("department"), salary, formData.get("start_date"), formData.get("end_date"), params.employeeId]
    );

    return redirect("/employees");
  } catch (error) {
    return { error: error.message };
  }
};

export default function EditEmployeePage() {
  const { employee } = useLoaderData();
  const [error, setError] = useState("");

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "600px",
        margin: "auto",
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>
        Edit Employee
      </h1>

      {/* Error message display */}
      {error && (
        <div
          style={{
            backgroundColor: "#f8d7da",
            color: "#721c24",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      <Form method="post" encType="multipart/form-data">
        {/* Form fields */}
        {[
          { label: "Full Name", name: "full_name", type: "text", defaultValue: employee.full_name, required: true },
          { label: "Email", name: "email", type: "email", defaultValue: employee.email, required: true },
          { label: "Phone Number", name: "phone", type: "tel", defaultValue: employee.phone },
          { label: "Date of Birth", name: "date_of_birth", type: "date", defaultValue: employee.date_of_birth },
          { label: "Job Title", name: "job_title", type: "text", defaultValue: employee.job_title },
          { label: "Department", name: "department", type: "text", defaultValue: employee.department },
          { label: "Salary", name: "salary", type: "number", defaultValue: employee.salary, required: true, min: 1 },
          { label: "Start Date", name: "start_date", type: "date", defaultValue: employee.start_date },
          { label: "End Date", name: "end_date", type: "date", defaultValue: employee.end_date },
        ].map((field) => (
          <div key={field.name} style={{ marginBottom: "16px" }}>
            <label
              htmlFor={field.name}
              style={{ display: "block", fontWeight: "medium", marginBottom: "8px" }}
            >
              {field.label}
            </label>
            <input
              type={field.type}
              name={field.name}
              id={field.name}
              defaultValue={field.defaultValue}
              required={field.required}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "16px",
              }}
            />
          </div>
        ))}

        <button
          type="submit"
          style={{
            backgroundColor: "#1d4ed8",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "8px",
            fontSize: "16px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Update Employee
        </button>
      </Form>
    </div>
  );
}
