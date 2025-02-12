import { Form, redirect, useLoaderData } from "react-router"
import { getDB } from "~/db/getDB"

export async function loader({ params }: any) {
  const db = await getDB()
  const employee = await db.get("SELECT * FROM employees WHERE id = ?", [params.id])

  if (!employee) {
    throw new Response("Employee not found", { status: 404 })
  }

  return { employee }
}

export const action = async ({ request, params }: any) => {
  const formData = new URLSearchParams(await request.text())
  const full_name = formData.get("full_name")

  const db = await getDB()
  await db.run("UPDATE employees SET full_name = ? WHERE id = ?", [full_name, params.id])

  return redirect(`/employees`)
}

export default function EditEmployeePage() {
  const { employee } = useLoaderData()

  return (
    <div>
      <h1>Edit Employee</h1>
      <Form method="post">
        <div>
          <label htmlFor="full_name">Full Name</label>
          <input
            type="text"
            name="full_name"
            id="full_name"
            defaultValue={employee.full_name}
            required
          />
        </div>
        <button type="submit">Update Employee</button>
      </Form>
      <hr />
      <ul>
        <li><a href="/employees">Employees</a></li>
        <li><a href="/timesheets">Timesheets</a></li>
      </ul>
    </div>
  )
}
