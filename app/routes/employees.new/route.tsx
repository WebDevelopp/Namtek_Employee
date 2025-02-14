import React, { useState } from "react";
import { Form, useActionData } from "react-router-dom";
import { getDB } from "~/db/getDB";

export const action = async ({ request }: any) => {
  const formData = await request.formData();
  const full_name = formData.get("full_name")?.trim();
  const email = formData.get("email")?.trim();
  const phone = formData.get("phone")?.trim();
  const date_of_birth = formData.get("date_of_birth");
  const job_title = formData.get("job_title")?.trim();
  const department = formData.get("department")?.trim();
  const salary = parseFloat(formData.get("salary") || "0");
  const start_date = formData.get("start_date");

  try {
    // Required field validation
    if (!full_name || !email || !salary || isNaN(salary)) {
      throw new Error("Please fill out all required fields.");
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Please provide a valid email address.");
    }

    // Phone number format validation
    const phoneRegex = /^\+?[0-9\s-]{7,15}$/;
    if (phone && !phoneRegex.test(phone)) {
      throw new Error("Please provide a valid phone number.");
    }

    // Age validation
    const age = new Date().getFullYear() - new Date(date_of_birth).getFullYear();
    if (age < 18) {
      throw new Error("Employee must be at least 18 years old.");
    }

    const db = await getDB();
    await db.run(
      "INSERT INTO employees (full_name, email, phone, date_of_birth, job_title, department, salary, start_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [full_name, email, phone, date_of_birth, job_title, department, salary, start_date]
    );

    return redirect("/employees");
  } catch (error) {
    return { error: error.message };
  }
};

export default function NewEmployeePage() {
  const actionData = useActionData();

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "600px",
        margin: "auto",
        backgroundColor: "#f9f9f9",
        borderRadius: "12px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h1
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "16px",
          color: "#333",
        }}
      >
        Create New Employee
      </h1>

      {/* Display error message */}
      {actionData?.error && (
        <div
          style={{
            backgroundColor: "#f8d7da",
            color: "#721c24",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "16px",
          }}
        >
          {actionData.error}
        </div>
      )}

      <Form method="post">
        {[
          "full_name",
          "email",
          "phone",
          "date_of_birth",
          "job_title",
          "department",
          "salary",
          "start_date",
        ].map((field) => (
          <div style={{ marginBottom: "16px" }} key={field}>
            <label
              htmlFor={field}
              style={{
                fontWeight: "600",
                display: "block",
                marginBottom: "8px",
                color: "#333",
              }}
            >
              {field
                .replace(/_/g, " ")
                .replace(/\b\w/g, (char) => char.toUpperCase())}
            </label>
            <input
              type={
                field === "date_of_birth" || field === "start_date"
                  ? "date"
                  : field === "salary"
                  ? "number"
                  : field === "email"
                  ? "email"
                  : "text"
              }
              name={field}
              id={field}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              required={["full_name", "email", "salary"].includes(field)}
            />
          </div>
        ))}
        <button
          type="submit"
          style={{
            backgroundColor: "#007BFF",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "8px",
            border: "none",
            fontWeight: "600",
            fontSize: "16px",
            cursor: "pointer",
            width: "100%",
            textAlign: "center",
          }}
        >
          Create Employee
        </button>
      </Form>
      <hr style={{ margin: "24px 0", borderColor: "#ddd" }} />
      <ul
        style={{
          listStyle: "none",
          padding: "0",
          display: "flex",
          justifyContent: "center",
          gap: "16px",
        }}
      >
        <li>
          <a
            href="/employees"
            style={{
              color: "#007BFF",
              textDecoration: "underline",
              fontWeight: "600",
            }}
          >
            Employees
          </a>
        </li>
      </ul>
    </div>
  );
}
