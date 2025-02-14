import { useLoaderData } from "react-router-dom";
import { getDB } from "~/db/getDB";

export async function loader({ params }: any) {
  const db = await getDB();
  const employee = await db.get("SELECT * FROM employees WHERE id = ?", [params.employeeId]);

  if (!employee) {
    throw new Response("Employee not found", { status: 404 });
  }
  return { employee };
}

export default function ViewEmployeePage() {
  const { employee } = useLoaderData();


  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "600px",
        margin: "auto",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "28px",
          fontWeight: "bold",
          marginBottom: "20px",
          color: "#333",
          textAlign: "center",
        }}
      >
        View Employee
      </h1>
      <div style={{ marginBottom: "24px" }}>
        {Object.keys(employee).map((key) =>
          employee[key] ? (
            <p
              key={key}
              style={{
                marginBottom: "12px",
                fontSize: "16px",
                color: "#555",
                lineHeight: "1.5",
              }}
            >
              <strong
                style={{
                  color: "#000",
                  fontWeight: "600",
                }}
              >
                {key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}:
              </strong>{" "}
              {employee[key]}
            </p>
          ) : null
        )}
      </div>
      <button
        style={{
          backgroundColor: "#007BFF",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: "8px",
          border: "none",
          fontWeight: "600",
          fontSize: "16px",
          cursor: "pointer",
          width: "100%",
          marginBottom: "16px",
          textAlign: "center",
        }}
      >
         <a
          href={`/employees/edit/${employee.id}`}
          style={{
            color: "#ffffff",
            textDecoration: "none",
          }}
        >
          Edit Employee
        </a>
      </button>
      <hr
        style={{
          margin: "24px 0",
          borderColor: "#ddd",
        }}
      />
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
