import { useLoaderData } from "react-router-dom";
import { useState } from "react";
import { getDB } from "~/db/getDB";

export async function loader() {
  const db = await getDB();
  const employees = await db.all("SELECT * FROM employees;");
  return { employees };
}

export default function EmployeesPage() {
  const { employees } = useLoaderData();

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState(employees);
  const [sortBy, setSortBy] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Search Function
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredEmployees(
      employees.filter((employee) =>
        employee.full_name.toLowerCase().includes(term)
      )
    );
    setCurrentPage(1); // Reset to first page when searching
  };

  // Sort Function
  const handleSort = (field) => {
    const direction = sortBy === field && sortDirection === "asc" ? "desc" : "asc";
    setSortBy(field);
    setSortDirection(direction);

    setFilteredEmployees(
      [...filteredEmployees].sort((a, b) => {
        if (a[field] < b[field]) return direction === "asc" ? -1 : 1;
        if (a[field] > b[field]) return direction === "asc" ? 1 : -1;
        return 0;
      })
    );
  };

  // Pagination Logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredEmployees.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage);

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "16px", textAlign: "center" }}>Employees</h1>
      
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={handleSearch}
        style={{
          padding: "8px",
          width: "100%",
          marginBottom: "20px",
          fontSize: "16px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />

      {/* Employee Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#ffffff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", textAlign: "center" }}>
        <thead>
          <tr>
            <th style={{ padding: "12px", borderBottom: "2px solid #ddd", cursor: "pointer" }} onClick={() => handleSort("id")}>
              ID
            </th>
            <th style={{ padding: "12px", borderBottom: "2px solid #ddd", cursor: "pointer" }} onClick={() => handleSort("full_name")}>
              Full Name
            </th>
            <th style={{ padding: "12px", borderBottom: "2px solid #ddd" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map((employee) => (
            <tr key={employee.id}>
              <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>{employee.id}</td>
              <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>{employee.full_name}</td>
              <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                <button style={{ backgroundColor: "#007BFF", color: "#fff", padding: "6px 12px", borderRadius: "4px", border: "none", cursor: "pointer", marginRight: "8px" }}>
                  <a href={`/employees/edit/${employee.id}`} style={{ color: "#fff", textDecoration: "none" }}>Edit</a>
                </button>
                <button style={{ backgroundColor: "#28A745", color: "#fff", padding: "6px 12px", borderRadius: "4px", border: "none", cursor: "pointer" }}>
                  <a href={`/employees/${employee.id}`} style={{ color: "#fff", textDecoration: "none" }}>View</a>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          style={{ padding: "8px 12px", marginRight: "8px", borderRadius: "4px", backgroundColor: "#007BFF", color: "#fff", border: "none", cursor: "pointer", opacity: currentPage === 1 ? 0.5 : 1 }}
        >
          Previous
        </button>
        <span style={{ padding: "8px 12px", fontWeight: "bold" }}>Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          style={{ padding: "8px 12px", marginLeft: "8px", borderRadius: "4px", backgroundColor: "#007BFF", color: "#fff", border: "none", cursor: "pointer", opacity: currentPage === totalPages ? 0.5 : 1 }}
        >
          Next
        </button>
      </div>
      <hr style={{ margin: "24px 0", borderColor: "#ddd" }} />
      <ul style={{ listStyle: "none", padding: "0", display: "flex", justifyContent: "center", gap: "16px" }}>
        <li>
          <a href="/employees/new" style={{ color: "#007BFF", textDecoration: "underline", fontWeight: "600" }}>
            New Employee
          </a>
        </li>
        <li>
          <a href="/timesheets/" style={{ color: "#007BFF", textDecoration: "underline", fontWeight: "600" }}>
            Timesheets
          </a>
        </li>
      </ul>
          </div>
  );
}
