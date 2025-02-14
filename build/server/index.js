import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, useMatches, useActionData, useLoaderData, useParams, useRouteError, redirect as redirect$2 } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { createElement, useState, useEffect } from "react";
import { Meta, Links, ScrollRestoration, Scripts, Outlet, isRouteErrorResponse, redirect as redirect$1, useLoaderData as useLoaderData$1, useActionData as useActionData$1, Form } from "react-router-dom";
import path from "path";
import { fileURLToPath } from "url";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import fs from "fs";
import yaml from "js-yaml";
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import { createViewDay, createViewWeek, createViewMonthGrid, createViewMonthAgenda } from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, streamTimeout + 1e3);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
function withComponentProps(Component) {
  return function Wrapped() {
    const props = {
      params: useParams(),
      loaderData: useLoaderData(),
      actionData: useActionData(),
      matches: useMatches()
    };
    return createElement(Component, props);
  };
}
function withErrorBoundaryProps(ErrorBoundary3) {
  return function Wrapped() {
    const props = {
      params: useParams(),
      loaderData: useLoaderData(),
      actionData: useActionData(),
      error: useRouteError()
    };
    return createElement(ErrorBoundary3, props);
  };
}
const links = () => [{
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
}];
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const ErrorBoundary = withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbConfigPath = path.join(__dirname, "../../database.yaml");
const dbConfig = yaml.load(fs.readFileSync(dbConfigPath, "utf8"));
path.join(__dirname, "..");
const {
  "sqlite_path": sqlitePath
} = dbConfig;
const getDB$1 = async () => {
  const sqliteDB = await open({
    filename: sqlitePath,
    driver: sqlite3.Database
  });
  return sqliteDB;
};
async function loader$7({
  params
}) {
  const db = await getDB$1();
  const employees = await db.all("SELECT id, full_name FROM employees");
  const timesheet = await db.get("SELECT * FROM timesheets WHERE id = ?", [params.timesheetId]);
  if (!timesheet) {
    throw new Response("Timesheet not found", {
      status: 404
    });
  }
  return {
    employees,
    timesheet
  };
}
const action$3 = async ({
  request,
  params
}) => {
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
    return {
      errors
    };
  }
  const db = await getDB$1();
  await db.run("UPDATE timesheets SET employee_id = ?, start_time = ?, end_time = ?, summary = ? WHERE id = ?", [employee_id, start_time, end_time, summary, params.timesheetId]);
  return redirect$1("/timesheets");
};
const route$8 = withComponentProps(function EditTimeSheetEmployeePage() {
  var _a, _b, _c;
  const {
    employees,
    timesheet
  } = useLoaderData$1();
  const actionData = useActionData$1();
  return /* @__PURE__ */ jsxs("div", {
    style: {
      padding: "24px",
      maxWidth: "600px",
      margin: "auto",
      backgroundColor: "#f9f9f9",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: "#333"
    },
    children: [/* @__PURE__ */ jsx("h1", {
      style: {
        textAlign: "center",
        color: "#2c3e50"
      },
      children: "Edit Timesheet"
    }), /* @__PURE__ */ jsxs(Form, {
      method: "post",
      children: [/* @__PURE__ */ jsxs("div", {
        style: {
          marginBottom: "16px"
        },
        children: [/* @__PURE__ */ jsx("label", {
          htmlFor: "employee_id",
          style: {
            display: "block",
            fontWeight: "bold",
            marginBottom: "8px"
          },
          children: "Employee"
        }), /* @__PURE__ */ jsxs("select", {
          name: "employee_id",
          id: "employee_id",
          defaultValue: timesheet.employee_id,
          required: true,
          style: {
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            fontSize: "16px"
          },
          children: [/* @__PURE__ */ jsx("option", {
            value: "",
            children: "Select an Employee"
          }), employees.map((employee) => /* @__PURE__ */ jsx("option", {
            value: employee.id,
            children: employee.full_name
          }, employee.id))]
        }), ((_a = actionData == null ? void 0 : actionData.errors) == null ? void 0 : _a.employee_id) && /* @__PURE__ */ jsx("p", {
          style: {
            color: "red"
          },
          children: actionData.errors.employee_id
        })]
      }), /* @__PURE__ */ jsxs("div", {
        style: {
          marginBottom: "16px"
        },
        children: [/* @__PURE__ */ jsx("label", {
          htmlFor: "start_time",
          style: {
            display: "block",
            fontWeight: "bold",
            marginBottom: "8px"
          },
          children: "Start Time"
        }), /* @__PURE__ */ jsx("input", {
          type: "datetime-local",
          name: "start_time",
          id: "start_time",
          defaultValue: timesheet.start_time,
          required: true,
          style: {
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            fontSize: "16px"
          }
        }), ((_b = actionData == null ? void 0 : actionData.errors) == null ? void 0 : _b.start_time) && /* @__PURE__ */ jsx("p", {
          style: {
            color: "red"
          },
          children: actionData.errors.start_time
        })]
      }), /* @__PURE__ */ jsxs("div", {
        style: {
          marginBottom: "16px"
        },
        children: [/* @__PURE__ */ jsx("label", {
          htmlFor: "end_time",
          style: {
            display: "block",
            fontWeight: "bold",
            marginBottom: "8px"
          },
          children: "End Time"
        }), /* @__PURE__ */ jsx("input", {
          type: "datetime-local",
          name: "end_time",
          id: "end_time",
          defaultValue: timesheet.end_time,
          required: true,
          style: {
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            fontSize: "16px"
          }
        }), ((_c = actionData == null ? void 0 : actionData.errors) == null ? void 0 : _c.end_time) && /* @__PURE__ */ jsx("p", {
          style: {
            color: "red"
          },
          children: actionData.errors.end_time
        })]
      }), /* @__PURE__ */ jsxs("div", {
        style: {
          marginBottom: "16px"
        },
        children: [/* @__PURE__ */ jsx("label", {
          htmlFor: "summary",
          style: {
            display: "block",
            fontWeight: "bold",
            marginBottom: "8px"
          },
          children: "Summary"
        }), /* @__PURE__ */ jsx("textarea", {
          name: "summary",
          id: "summary",
          rows: "4",
          defaultValue: timesheet.summary || "",
          placeholder: "Describe the work done during this period",
          style: {
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            fontSize: "16px",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
          }
        })]
      }), /* @__PURE__ */ jsx("button", {
        type: "submit",
        style: {
          padding: "12px 24px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          width: "100%",
          fontSize: "16px"
        },
        children: "Update Timesheet"
      })]
    })]
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$3,
  default: route$8,
  loader: loader$7
}, Symbol.toStringTag, { value: "Module" }));
async function loader$6({
  params
}) {
  const db = await getDB$1();
  const employee = await db.get("SELECT * FROM employees WHERE id = ?", [params.employeeId]);
  if (!employee) {
    throw new Response("Employee not found", {
      status: 404
    });
  }
  return {
    employee
  };
}
const action$2 = async ({
  request,
  params
}) => {
  const formData = await request.formData();
  const full_name = formData.get("full_name");
  const email = formData.get("email");
  const salary = formData.get("salary");
  const date_of_birth = formData.get("date_of_birth");
  try {
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
    const age = (/* @__PURE__ */ new Date()).getFullYear() - new Date(date_of_birth).getFullYear();
    if (age < 18) {
      throw new Error("Employee must be at least 18 years old.");
    }
    const db = await getDB$1();
    await db.run("UPDATE employees SET full_name = ?, email = ?, phone = ?, date_of_birth = ?, job_title = ?, department = ?, salary = ?, start_date = ?, end_date = ? WHERE id = ?", [full_name, email, formData.get("phone"), date_of_birth, formData.get("job_title"), formData.get("department"), salary, formData.get("start_date"), formData.get("end_date"), params.employeeId]);
    return redirect$1("/employees");
  } catch (error) {
    return {
      error: error.message
    };
  }
};
const route$7 = withComponentProps(function EditEmployeePage() {
  const {
    employee
  } = useLoaderData$1();
  const [error, setError] = useState("");
  return /* @__PURE__ */ jsxs("div", {
    style: {
      padding: "24px",
      maxWidth: "600px",
      margin: "auto",
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)"
    },
    children: [/* @__PURE__ */ jsx("h1", {
      style: {
        fontSize: "24px",
        fontWeight: "bold",
        marginBottom: "16px"
      },
      children: "Edit Employee"
    }), error && /* @__PURE__ */ jsx("div", {
      style: {
        backgroundColor: "#f8d7da",
        color: "#721c24",
        padding: "12px",
        borderRadius: "8px",
        marginBottom: "16px"
      },
      children: error
    }), /* @__PURE__ */ jsxs(Form, {
      method: "post",
      encType: "multipart/form-data",
      children: [[{
        label: "Full Name",
        name: "full_name",
        type: "text",
        defaultValue: employee.full_name,
        required: true
      }, {
        label: "Email",
        name: "email",
        type: "email",
        defaultValue: employee.email,
        required: true
      }, {
        label: "Phone Number",
        name: "phone",
        type: "tel",
        defaultValue: employee.phone
      }, {
        label: "Date of Birth",
        name: "date_of_birth",
        type: "date",
        defaultValue: employee.date_of_birth
      }, {
        label: "Job Title",
        name: "job_title",
        type: "text",
        defaultValue: employee.job_title
      }, {
        label: "Department",
        name: "department",
        type: "text",
        defaultValue: employee.department
      }, {
        label: "Salary",
        name: "salary",
        type: "number",
        defaultValue: employee.salary,
        required: true,
        min: 1
      }, {
        label: "Start Date",
        name: "start_date",
        type: "date",
        defaultValue: employee.start_date
      }, {
        label: "End Date",
        name: "end_date",
        type: "date",
        defaultValue: employee.end_date
      }].map((field) => /* @__PURE__ */ jsxs("div", {
        style: {
          marginBottom: "16px"
        },
        children: [/* @__PURE__ */ jsx("label", {
          htmlFor: field.name,
          style: {
            display: "block",
            fontWeight: "medium",
            marginBottom: "8px"
          },
          children: field.label
        }), /* @__PURE__ */ jsx("input", {
          type: field.type,
          name: field.name,
          id: field.name,
          defaultValue: field.defaultValue,
          required: field.required,
          style: {
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px"
          }
        })]
      }, field.name)), /* @__PURE__ */ jsx("button", {
        type: "submit",
        style: {
          backgroundColor: "#1d4ed8",
          color: "#ffffff",
          padding: "12px 24px",
          borderRadius: "8px",
          fontSize: "16px",
          border: "none",
          cursor: "pointer"
        },
        children: "Update Employee"
      })]
    })]
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2,
  default: route$7,
  loader: loader$6
}, Symbol.toStringTag, { value: "Module" }));
async function loader$5({
  params
}) {
  const db = await getDB();
  const timesheetAndEmployee = await db.get("SELECT timesheets.*, employees.full_name, employees.id AS employee_id FROM timesheets JOIN employees ON timesheets.employee_id = employees.id WHERE timesheets.id = ?", [params.timesheetId]);
  if (!timesheetAndEmployee) {
    throw new Response("Timesheet not found", {
      status: 404
    });
  }
  return {
    timesheetAndEmployee
  };
}
const route$6 = withComponentProps(function ViewTimeSheetEmployeePage() {
  const {
    timesheetAndEmployee
  } = useLoaderData$1();
  return /* @__PURE__ */ jsxs("div", {
    style: {
      padding: "24px",
      maxWidth: "600px",
      margin: "auto",
      backgroundColor: "#f9f9f9",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: "#333"
    },
    children: [/* @__PURE__ */ jsxs("h1", {
      style: {
        textAlign: "center",
        color: "#2c3e50"
      },
      children: ["Timesheet #", timesheetAndEmployee.id]
    }), /* @__PURE__ */ jsxs("ul", {
      style: {
        listStyleType: "none",
        padding: "0",
        lineHeight: "1.8"
      },
      children: [/* @__PURE__ */ jsxs("li", {
        children: [/* @__PURE__ */ jsx("strong", {
          children: "Employee:"
        }), " ", timesheetAndEmployee.full_name, " (ID: ", timesheetAndEmployee.employee_id, ")"]
      }), /* @__PURE__ */ jsxs("li", {
        children: [/* @__PURE__ */ jsx("strong", {
          children: "Start Time:"
        }), " ", new Date(timesheetAndEmployee.start_time).toLocaleString()]
      }), /* @__PURE__ */ jsxs("li", {
        children: [/* @__PURE__ */ jsx("strong", {
          children: "End Time:"
        }), " ", new Date(timesheetAndEmployee.end_time).toLocaleString()]
      }), /* @__PURE__ */ jsxs("li", {
        children: [/* @__PURE__ */ jsx("strong", {
          children: "Summary:"
        }), " ", timesheetAndEmployee.summary]
      })]
    }), /* @__PURE__ */ jsx("button", {
      style: {
        padding: "12px 24px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        marginTop: "20px",
        fontWeight: "bold"
      },
      children: /* @__PURE__ */ jsx("a", {
        href: `/timesheets/edit/${timesheetAndEmployee.id}`,
        style: {
          color: "inherit",
          textDecoration: "none"
        },
        children: "Edit Timesheet"
      })
    }), /* @__PURE__ */ jsx("hr", {
      style: {
        margin: "24px 0",
        border: "1px solid #ddd"
      }
    }), /* @__PURE__ */ jsxs("ul", {
      style: {
        listStyleType: "none",
        padding: "0"
      },
      children: [/* @__PURE__ */ jsx("li", {
        style: {
          marginBottom: "10px"
        },
        children: /* @__PURE__ */ jsx("a", {
          href: `/employees/${timesheetAndEmployee.employee_id}`,
          style: {
            color: "#007bff",
            textDecoration: "none",
            fontWeight: "bold"
          },
          children: "Back to Employee Details"
        })
      }), /* @__PURE__ */ jsx("li", {
        children: /* @__PURE__ */ jsx("a", {
          href: "/timesheets",
          style: {
            color: "#007bff",
            textDecoration: "none",
            fontWeight: "bold"
          },
          children: "Timesheets"
        })
      })]
    })]
  });
});
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: route$6,
  loader: loader$5
}, Symbol.toStringTag, { value: "Module" }));
async function loader$4({
  params
}) {
  const db = await getDB$1();
  const employee = await db.get("SELECT * FROM employees WHERE id = ?", [params.employeeId]);
  if (!employee) {
    throw new Response("Employee not found", {
      status: 404
    });
  }
  return {
    employee
  };
}
const route$5 = withComponentProps(function ViewEmployeePage() {
  const {
    employee
  } = useLoaderData$1();
  return /* @__PURE__ */ jsxs("div", {
    style: {
      padding: "24px",
      maxWidth: "600px",
      margin: "auto",
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      fontFamily: "Arial, sans-serif"
    },
    children: [/* @__PURE__ */ jsx("h1", {
      style: {
        fontSize: "28px",
        fontWeight: "bold",
        marginBottom: "20px",
        color: "#333",
        textAlign: "center"
      },
      children: "View Employee"
    }), /* @__PURE__ */ jsx("div", {
      style: {
        marginBottom: "24px"
      },
      children: Object.keys(employee).map((key) => employee[key] ? /* @__PURE__ */ jsxs("p", {
        style: {
          marginBottom: "12px",
          fontSize: "16px",
          color: "#555",
          lineHeight: "1.5"
        },
        children: [/* @__PURE__ */ jsxs("strong", {
          style: {
            color: "#000",
            fontWeight: "600"
          },
          children: [key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()), ":"]
        }), " ", employee[key]]
      }, key) : null)
    }), /* @__PURE__ */ jsx("button", {
      style: {
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
        textAlign: "center"
      },
      children: /* @__PURE__ */ jsx("a", {
        href: `/employees/edit/${employee.id}`,
        style: {
          color: "#ffffff",
          textDecoration: "none"
        },
        children: "Edit Employee"
      })
    }), /* @__PURE__ */ jsx("hr", {
      style: {
        margin: "24px 0",
        borderColor: "#ddd"
      }
    }), /* @__PURE__ */ jsx("ul", {
      style: {
        listStyle: "none",
        padding: "0",
        display: "flex",
        justifyContent: "center",
        gap: "16px"
      },
      children: /* @__PURE__ */ jsx("li", {
        children: /* @__PURE__ */ jsx("a", {
          href: "/employees",
          style: {
            color: "#007BFF",
            textDecoration: "underline",
            fontWeight: "600"
          },
          children: "Employees"
        })
      })
    })]
  });
});
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: route$5,
  loader: loader$4
}, Symbol.toStringTag, { value: "Module" }));
function CalendarApp({ timesheets }) {
  const [eventsService] = useState(() => createEventsServicePlugin());
  const calendarEvents = timesheets.map((timesheet) => ({
    id: timesheet.id.toString(),
    title: `Timesheet for ${timesheet.full_name}`,
    start: new Date(timesheet.start_time).toISOString(),
    // Ensure valid ISO 8601
    end: new Date(timesheet.end_time).toISOString()
    // Ensure valid ISO 8601
  }));
  const calendar = useCalendarApp({
    views: [
      createViewDay(),
      createViewWeek(),
      createViewMonthGrid(),
      createViewMonthAgenda()
    ],
    events: calendarEvents,
    plugins: [eventsService]
  });
  useEffect(() => {
    eventsService.getAll();
  }, [eventsService]);
  return /* @__PURE__ */ jsx("div", { style: { padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "10px" }, children: /* @__PURE__ */ jsx(ScheduleXCalendar, { calendarApp: calendar }) });
}
async function loader$3() {
  const db = await getDB$1();
  const timesheetsAndEmployees = await db.all("SELECT timesheets.*, employees.full_name, employees.id AS employee_id FROM timesheets JOIN employees ON timesheets.employee_id = employees.id");
  return {
    timesheetsAndEmployees
  };
}
const route$4 = withComponentProps(function TimesheetsPage() {
  const {
    timesheetsAndEmployees
  } = useLoaderData();
  const [view, setView] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalItems = timesheetsAndEmployees.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedTimesheets = timesheetsAndEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  return /* @__PURE__ */ jsxs("div", {
    style: {
      fontFamily: "Arial, sans-serif",
      padding: "20px"
    },
    children: [/* @__PURE__ */ jsxs("div", {
      style: {
        display: "flex",
        gap: "10px",
        marginBottom: "20px"
      },
      children: [/* @__PURE__ */ jsx("button", {
        style: {
          padding: "10px 20px",
          cursor: "pointer",
          borderRadius: "5px",
          border: "none",
          backgroundColor: view === "table" ? "#007bff" : "#ccc",
          color: "#fff",
          fontWeight: "bold",
          transition: "background-color 0.3s",
          outline: "none"
        },
        onClick: () => setView("table"),
        children: "Table View"
      }), /* @__PURE__ */ jsx("button", {
        style: {
          padding: "10px 20px",
          cursor: "pointer",
          borderRadius: "5px",
          border: "none",
          backgroundColor: view === "calendar" ? "#007bff" : "#ccc",
          color: "#fff",
          fontWeight: "bold",
          transition: "background-color 0.3s",
          outline: "none"
        },
        onClick: () => setView("calendar"),
        children: "Calendar View"
      })]
    }), view === "table" ? /* @__PURE__ */ jsx("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "20px"
      },
      children: paginatedTimesheets.map((timesheet) => /* @__PURE__ */ jsxs("div", {
        style: {
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#fefefe"
        },
        children: [/* @__PURE__ */ jsxs("h2", {
          style: {
            margin: "0 0 10px",
            fontSize: "18px",
            fontWeight: "bold"
          },
          children: ["Timesheet #", timesheet.id]
        }), /* @__PURE__ */ jsxs("p", {
          style: {
            margin: "5px 0"
          },
          children: [/* @__PURE__ */ jsx("strong", {
            children: "Employee:"
          }), " ", timesheet.full_name, " (ID: ", timesheet.employee_id, ")"]
        }), /* @__PURE__ */ jsxs("p", {
          style: {
            margin: "5px 0"
          },
          children: [/* @__PURE__ */ jsx("strong", {
            children: "Start Time:"
          }), " ", timesheet.start_time]
        }), /* @__PURE__ */ jsxs("p", {
          style: {
            margin: "5px 0"
          },
          children: [/* @__PURE__ */ jsx("strong", {
            children: "End Time:"
          }), " ", timesheet.end_time]
        }), /* @__PURE__ */ jsxs("div", {
          style: {
            marginTop: "10px",
            display: "flex",
            gap: "10px"
          },
          children: [/* @__PURE__ */ jsx("a", {
            href: `/timesheets/edit/${timesheet.id}`,
            style: {
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "5px",
              transition: "background-color 0.3s"
            },
            children: "Edit"
          }), /* @__PURE__ */ jsx("a", {
            href: `/timesheets/${timesheet.id}`,
            style: {
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "5px",
              transition: "background-color 0.3s"
            },
            children: "View"
          })]
        })]
      }, timesheet.id))
    }) : /* @__PURE__ */ jsx("div", {
      style: {
        padding: "20px",
        backgroundColor: "#f9f9f9",
        borderRadius: "10px"
      },
      children: /* @__PURE__ */ jsx(CalendarApp, {
        timesheets: timesheetsAndEmployees
      })
    }), /* @__PURE__ */ jsxs("div", {
      style: {
        display: "flex",
        justifyContent: "center",
        margin: "20px 0"
      },
      children: [/* @__PURE__ */ jsx("button", {
        style: {
          padding: "10px 20px",
          marginRight: "10px",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
          borderRadius: "5px",
          border: "1px solid #ddd",
          backgroundColor: currentPage === 1 ? "#e0e0e0" : "#007bff",
          color: currentPage === 1 ? "#888" : "#fff",
          transition: "background-color 0.3s",
          outline: "none"
        },
        disabled: currentPage === 1,
        onClick: () => setCurrentPage(currentPage - 1),
        children: "Previous"
      }), /* @__PURE__ */ jsx("button", {
        style: {
          padding: "10px 20px",
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          borderRadius: "5px",
          border: "1px solid #ddd",
          backgroundColor: currentPage === totalPages ? "#e0e0e0" : "#007bff",
          color: currentPage === totalPages ? "#888" : "#fff",
          transition: "background-color 0.3s",
          outline: "none"
        },
        disabled: currentPage === totalPages,
        onClick: () => setCurrentPage(currentPage + 1),
        children: "Next"
      })]
    }), /* @__PURE__ */ jsx("hr", {
      style: {
        margin: "20px 0",
        borderColor: "#ddd"
      }
    }), /* @__PURE__ */ jsxs("ul", {
      style: {
        listStyleType: "none",
        padding: "0",
        margin: "0"
      },
      children: [/* @__PURE__ */ jsx("li", {
        style: {
          marginBottom: "10px"
        },
        children: /* @__PURE__ */ jsx("a", {
          href: "/timesheets/new",
          style: {
            color: "#007bff",
            textDecoration: "none"
          },
          children: "New Timesheet"
        })
      }), /* @__PURE__ */ jsx("li", {
        children: /* @__PURE__ */ jsx("a", {
          href: "/employees",
          style: {
            color: "#007bff",
            textDecoration: "none"
          },
          children: "Employees"
        })
      })]
    })]
  });
});
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: route$4,
  loader: loader$3
}, Symbol.toStringTag, { value: "Module" }));
async function loader$2() {
  const db = await getDB$1();
  const employees = await db.all("SELECT * FROM employees;");
  return {
    employees
  };
}
const route$3 = withComponentProps(function EmployeesPage() {
  const {
    employees
  } = useLoaderData$1();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState(employees);
  const [sortBy, setSortBy] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredEmployees(employees.filter((employee) => employee.full_name.toLowerCase().includes(term)));
    setCurrentPage(1);
  };
  const handleSort = (field) => {
    const direction = sortBy === field && sortDirection === "asc" ? "desc" : "asc";
    setSortBy(field);
    setSortDirection(direction);
    setFilteredEmployees([...filteredEmployees].sort((a, b) => {
      if (a[field] < b[field]) return direction === "asc" ? -1 : 1;
      if (a[field] > b[field]) return direction === "asc" ? 1 : -1;
      return 0;
    }));
  };
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredEmployees.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage);
  return /* @__PURE__ */ jsxs("div", {
    style: {
      padding: "24px",
      maxWidth: "900px",
      margin: "auto",
      fontFamily: "Arial, sans-serif"
    },
    children: [/* @__PURE__ */ jsx("h1", {
      style: {
        fontSize: "28px",
        fontWeight: "bold",
        marginBottom: "16px",
        textAlign: "center"
      },
      children: "Employees"
    }), /* @__PURE__ */ jsx("input", {
      type: "text",
      placeholder: "Search by name...",
      value: searchTerm,
      onChange: handleSearch,
      style: {
        padding: "8px",
        width: "100%",
        marginBottom: "20px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "1px solid #ccc"
      }
    }), /* @__PURE__ */ jsxs("table", {
      style: {
        width: "100%",
        borderCollapse: "collapse",
        backgroundColor: "#ffffff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        textAlign: "center"
      },
      children: [/* @__PURE__ */ jsx("thead", {
        children: /* @__PURE__ */ jsxs("tr", {
          children: [/* @__PURE__ */ jsx("th", {
            style: {
              padding: "12px",
              borderBottom: "2px solid #ddd",
              cursor: "pointer"
            },
            onClick: () => handleSort("id"),
            children: "ID"
          }), /* @__PURE__ */ jsx("th", {
            style: {
              padding: "12px",
              borderBottom: "2px solid #ddd",
              cursor: "pointer"
            },
            onClick: () => handleSort("full_name"),
            children: "Full Name"
          }), /* @__PURE__ */ jsx("th", {
            style: {
              padding: "12px",
              borderBottom: "2px solid #ddd"
            },
            children: "Actions"
          })]
        })
      }), /* @__PURE__ */ jsx("tbody", {
        children: currentRows.map((employee) => /* @__PURE__ */ jsxs("tr", {
          children: [/* @__PURE__ */ jsx("td", {
            style: {
              padding: "12px",
              borderBottom: "1px solid #ddd"
            },
            children: employee.id
          }), /* @__PURE__ */ jsx("td", {
            style: {
              padding: "12px",
              borderBottom: "1px solid #ddd"
            },
            children: employee.full_name
          }), /* @__PURE__ */ jsxs("td", {
            style: {
              padding: "12px",
              borderBottom: "1px solid #ddd"
            },
            children: [/* @__PURE__ */ jsx("button", {
              style: {
                backgroundColor: "#007BFF",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
                marginRight: "8px"
              },
              children: /* @__PURE__ */ jsx("a", {
                href: `/employees/edit/${employee.id}`,
                style: {
                  color: "#fff",
                  textDecoration: "none"
                },
                children: "Edit"
              })
            }), /* @__PURE__ */ jsx("button", {
              style: {
                backgroundColor: "#28A745",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer"
              },
              children: /* @__PURE__ */ jsx("a", {
                href: `/employees/${employee.id}`,
                style: {
                  color: "#fff",
                  textDecoration: "none"
                },
                children: "View"
              })
            })]
          })]
        }, employee.id))
      })]
    }), /* @__PURE__ */ jsxs("div", {
      style: {
        display: "flex",
        justifyContent: "center",
        marginTop: "20px"
      },
      children: [/* @__PURE__ */ jsx("button", {
        onClick: () => setCurrentPage((prev) => Math.max(prev - 1, 1)),
        disabled: currentPage === 1,
        style: {
          padding: "8px 12px",
          marginRight: "8px",
          borderRadius: "4px",
          backgroundColor: "#007BFF",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          opacity: currentPage === 1 ? 0.5 : 1
        },
        children: "Previous"
      }), /* @__PURE__ */ jsxs("span", {
        style: {
          padding: "8px 12px",
          fontWeight: "bold"
        },
        children: ["Page ", currentPage, " of ", totalPages]
      }), /* @__PURE__ */ jsx("button", {
        onClick: () => setCurrentPage((prev) => Math.min(prev + 1, totalPages)),
        disabled: currentPage === totalPages,
        style: {
          padding: "8px 12px",
          marginLeft: "8px",
          borderRadius: "4px",
          backgroundColor: "#007BFF",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          opacity: currentPage === totalPages ? 0.5 : 1
        },
        children: "Next"
      })]
    }), /* @__PURE__ */ jsx("hr", {
      style: {
        margin: "24px 0",
        borderColor: "#ddd"
      }
    }), /* @__PURE__ */ jsxs("ul", {
      style: {
        listStyle: "none",
        padding: "0",
        display: "flex",
        justifyContent: "center",
        gap: "16px"
      },
      children: [/* @__PURE__ */ jsx("li", {
        children: /* @__PURE__ */ jsx("a", {
          href: "/employees/new",
          style: {
            color: "#007BFF",
            textDecoration: "underline",
            fontWeight: "600"
          },
          children: "New Employee"
        })
      }), /* @__PURE__ */ jsx("li", {
        children: /* @__PURE__ */ jsx("a", {
          href: "/timesheets/",
          style: {
            color: "#007BFF",
            textDecoration: "underline",
            fontWeight: "600"
          },
          children: "Timesheets"
        })
      })]
    })]
  });
});
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: route$3,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
async function loader$1() {
  const db = await getDB$1();
  const employees = await db.all("SELECT id, full_name FROM employees");
  return {
    employees
  };
}
const action$1 = async ({
  request
}) => {
  const formData = await request.formData();
  const employee_id = formData.get("employee_id");
  const start_time = formData.get("start_time");
  const end_time = formData.get("end_time");
  const summary = formData.get("summary");
  if (!employee_id || !start_time || !end_time || !summary) {
    return {
      error: "All fields are required"
    };
  }
  if (new Date(start_time) >= new Date(end_time)) {
    return {
      error: "End time must be after start time"
    };
  }
  const db = await getDB$1();
  const employeeExists = await db.get("SELECT id FROM employees WHERE id = ?", [employee_id]);
  if (!employeeExists) {
    return {
      error: "Invalid employee selected"
    };
  }
  try {
    await db.run("INSERT INTO timesheets (employee_id, start_time, end_time, summary) VALUES (?, ?, ?, ?)", [employee_id, start_time, end_time, summary]);
    return redirect$1("/timesheets");
  } catch (err) {
    return {
      error: "An unexpected error occurred. Please try again."
    };
  }
};
const route$2 = withComponentProps(function NewTimesheetPage() {
  const {
    employees
  } = useLoaderData$1();
  const actionData = useActionData$1();
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
  return /* @__PURE__ */ jsxs("div", {
    style: {
      padding: "24px",
      maxWidth: "600px",
      margin: "auto",
      backgroundColor: "#f9f9f9",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: "#333"
    },
    children: [/* @__PURE__ */ jsx("h1", {
      style: {
        textAlign: "center",
        color: "#2c3e50"
      },
      children: "Create New Timesheet"
    }), (actionData == null ? void 0 : actionData.error) && /* @__PURE__ */ jsx("div", {
      style: {
        color: "#d9534f",
        backgroundColor: "#f8d7da",
        padding: "12px",
        borderRadius: "8px",
        marginBottom: "16px",
        fontWeight: "bold",
        textAlign: "center"
      },
      children: actionData.error
    }), /* @__PURE__ */ jsxs(Form, {
      method: "post",
      onSubmit: handleSubmit,
      children: [/* @__PURE__ */ jsxs("div", {
        style: {
          marginBottom: "16px"
        },
        children: [/* @__PURE__ */ jsx("label", {
          htmlFor: "employee_id",
          style: {
            display: "block",
            fontWeight: "bold",
            marginBottom: "8px"
          },
          children: "Employee"
        }), /* @__PURE__ */ jsxs("select", {
          name: "employee_id",
          id: "employee_id",
          required: true,
          style: {
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            fontSize: "16px"
          },
          children: [/* @__PURE__ */ jsx("option", {
            value: "",
            disabled: true,
            hidden: true,
            children: "-- Select an Employee --"
          }), employees.map((employee) => /* @__PURE__ */ jsx("option", {
            value: employee.id,
            children: employee.full_name
          }, employee.id))]
        })]
      }), /* @__PURE__ */ jsxs("div", {
        style: {
          marginBottom: "16px"
        },
        children: [/* @__PURE__ */ jsx("label", {
          htmlFor: "start_time",
          style: {
            display: "block",
            fontWeight: "bold",
            marginBottom: "8px"
          },
          children: "Start Time"
        }), /* @__PURE__ */ jsx("input", {
          type: "datetime-local",
          name: "start_time",
          id: "start_time",
          required: true,
          style: {
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            fontSize: "16px"
          }
        })]
      }), /* @__PURE__ */ jsxs("div", {
        style: {
          marginBottom: "16px"
        },
        children: [/* @__PURE__ */ jsx("label", {
          htmlFor: "end_time",
          style: {
            display: "block",
            fontWeight: "bold",
            marginBottom: "8px"
          },
          children: "End Time"
        }), /* @__PURE__ */ jsx("input", {
          type: "datetime-local",
          name: "end_time",
          id: "end_time",
          required: true,
          style: {
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            fontSize: "16px"
          }
        })]
      }), /* @__PURE__ */ jsxs("div", {
        style: {
          marginBottom: "16px"
        },
        children: [/* @__PURE__ */ jsx("label", {
          htmlFor: "summary",
          style: {
            display: "block",
            fontWeight: "bold",
            marginBottom: "8px"
          },
          children: "Summary"
        }), /* @__PURE__ */ jsx("textarea", {
          name: "summary",
          id: "summary",
          rows: "4",
          placeholder: "Describe the work done during this period",
          style: {
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            fontSize: "16px",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
          },
          required: true
        })]
      }), /* @__PURE__ */ jsx("button", {
        type: "submit",
        style: {
          padding: "12px 24px",
          backgroundColor: loading ? "#6c757d" : "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: "bold",
          width: "100%",
          fontSize: "16px"
        },
        disabled: loading,
        children: loading ? "Submitting..." : "Create Timesheet"
      })]
    }), /* @__PURE__ */ jsx("hr", {
      style: {
        margin: "24px 0",
        border: "1px solid #ddd"
      }
    }), /* @__PURE__ */ jsxs("ul", {
      style: {
        listStyleType: "none",
        padding: "0"
      },
      children: [/* @__PURE__ */ jsx("li", {
        style: {
          marginBottom: "10px"
        },
        children: /* @__PURE__ */ jsx("a", {
          href: "/timesheets",
          style: {
            color: "#007bff",
            textDecoration: "none",
            fontWeight: "bold"
          },
          children: "Timesheets"
        })
      }), /* @__PURE__ */ jsx("li", {
        children: /* @__PURE__ */ jsx("a", {
          href: "/employees",
          style: {
            color: "#007bff",
            textDecoration: "none",
            fontWeight: "bold"
          },
          children: "Employees"
        })
      })]
    })]
  });
});
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  default: route$2,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
const action = async ({
  request
}) => {
  var _a, _b, _c, _d, _e;
  const formData = await request.formData();
  const full_name = (_a = formData.get("full_name")) == null ? void 0 : _a.trim();
  const email = (_b = formData.get("email")) == null ? void 0 : _b.trim();
  const phone = (_c = formData.get("phone")) == null ? void 0 : _c.trim();
  const date_of_birth = formData.get("date_of_birth");
  const job_title = (_d = formData.get("job_title")) == null ? void 0 : _d.trim();
  const department = (_e = formData.get("department")) == null ? void 0 : _e.trim();
  const salary = parseFloat(formData.get("salary") || "0");
  const start_date = formData.get("start_date");
  try {
    if (!full_name || !email || !salary || isNaN(salary)) {
      throw new Error("Please fill out all required fields.");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Please provide a valid email address.");
    }
    const phoneRegex = /^\+?[0-9\s-]{7,15}$/;
    if (phone && !phoneRegex.test(phone)) {
      throw new Error("Please provide a valid phone number.");
    }
    const age = (/* @__PURE__ */ new Date()).getFullYear() - new Date(date_of_birth).getFullYear();
    if (age < 18) {
      throw new Error("Employee must be at least 18 years old.");
    }
    const db = await getDB$1();
    await db.run("INSERT INTO employees (full_name, email, phone, date_of_birth, job_title, department, salary, start_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [full_name, email, phone, date_of_birth, job_title, department, salary, start_date]);
    return redirect("/employees");
  } catch (error) {
    return {
      error: error.message
    };
  }
};
const route$1 = withComponentProps(function NewEmployeePage() {
  const actionData = useActionData$1();
  return /* @__PURE__ */ jsxs("div", {
    style: {
      padding: "24px",
      maxWidth: "600px",
      margin: "auto",
      backgroundColor: "#f9f9f9",
      borderRadius: "12px",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
    },
    children: [/* @__PURE__ */ jsx("h1", {
      style: {
        fontSize: "24px",
        fontWeight: "bold",
        marginBottom: "16px",
        color: "#333"
      },
      children: "Create New Employee"
    }), (actionData == null ? void 0 : actionData.error) && /* @__PURE__ */ jsx("div", {
      style: {
        backgroundColor: "#f8d7da",
        color: "#721c24",
        padding: "12px",
        borderRadius: "8px",
        marginBottom: "16px"
      },
      children: actionData.error
    }), /* @__PURE__ */ jsxs(Form, {
      method: "post",
      children: [["full_name", "email", "phone", "date_of_birth", "job_title", "department", "salary", "start_date"].map((field) => /* @__PURE__ */ jsxs("div", {
        style: {
          marginBottom: "16px"
        },
        children: [/* @__PURE__ */ jsx("label", {
          htmlFor: field,
          style: {
            fontWeight: "600",
            display: "block",
            marginBottom: "8px",
            color: "#333"
          },
          children: field.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
        }), /* @__PURE__ */ jsx("input", {
          type: field === "date_of_birth" || field === "start_date" ? "date" : field === "salary" ? "number" : field === "email" ? "email" : "text",
          name: field,
          id: field,
          style: {
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "14px",
            boxSizing: "border-box"
          },
          required: ["full_name", "email", "salary"].includes(field)
        })]
      }, field)), /* @__PURE__ */ jsx("button", {
        type: "submit",
        style: {
          backgroundColor: "#007BFF",
          color: "#fff",
          padding: "12px 20px",
          borderRadius: "8px",
          border: "none",
          fontWeight: "600",
          fontSize: "16px",
          cursor: "pointer",
          width: "100%",
          textAlign: "center"
        },
        children: "Create Employee"
      })]
    }), /* @__PURE__ */ jsx("hr", {
      style: {
        margin: "24px 0",
        borderColor: "#ddd"
      }
    }), /* @__PURE__ */ jsx("ul", {
      style: {
        listStyle: "none",
        padding: "0",
        display: "flex",
        justifyContent: "center",
        gap: "16px"
      },
      children: /* @__PURE__ */ jsx("li", {
        children: /* @__PURE__ */ jsx("a", {
          href: "/employees",
          style: {
            color: "#007BFF",
            textDecoration: "underline",
            fontWeight: "600"
          },
          children: "Employees"
        })
      })
    })]
  });
});
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: route$1
}, Symbol.toStringTag, { value: "Module" }));
async function loader() {
  return redirect$2("/employees");
}
const route = withComponentProps(function RootPage() {
  return /* @__PURE__ */ jsx(Fragment, {});
});
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: route,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-BMtcWyng.js", "imports": ["/assets/chunk-IR6S3I6Y-rOQZXXE2.js", "/assets/index-C2_4JFkC.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": true, "module": "/assets/root-Cl7qTWHj.js", "imports": ["/assets/chunk-IR6S3I6Y-rOQZXXE2.js", "/assets/index-C2_4JFkC.js", "/assets/with-props-I-2ZKXig.js"], "css": ["/assets/root-nN6Eg5tl.css"] }, "routes/timesheets.edit..$timesheetId": { "id": "routes/timesheets.edit..$timesheetId", "parentId": "root", "path": "timesheets/edit/:timesheetId", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-CeZGq9au.js", "imports": ["/assets/with-props-I-2ZKXig.js", "/assets/chunk-IR6S3I6Y-rOQZXXE2.js"], "css": [] }, "routes/employees.edit.$employeeId": { "id": "routes/employees.edit.$employeeId", "parentId": "root", "path": "employees/edit/:employeeId", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-DC5VF1js.js", "imports": ["/assets/with-props-I-2ZKXig.js", "/assets/chunk-IR6S3I6Y-rOQZXXE2.js"], "css": [] }, "routes/timesheets.$timesheetId": { "id": "routes/timesheets.$timesheetId", "parentId": "root", "path": "timesheets/:timesheetId", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-CKdwmbSw.js", "imports": ["/assets/with-props-I-2ZKXig.js", "/assets/chunk-IR6S3I6Y-rOQZXXE2.js"], "css": [] }, "routes/employees.$employeeId": { "id": "routes/employees.$employeeId", "parentId": "root", "path": "employees/:employeeId", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-Wf1xwUia.js", "imports": ["/assets/with-props-I-2ZKXig.js", "/assets/chunk-IR6S3I6Y-rOQZXXE2.js"], "css": [] }, "routes/timesheets._index": { "id": "routes/timesheets._index", "parentId": "root", "path": "timesheets", "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-DA45tQ8c.js", "imports": ["/assets/with-props-I-2ZKXig.js", "/assets/chunk-IR6S3I6Y-rOQZXXE2.js", "/assets/index-C2_4JFkC.js"], "css": ["/assets/route-eq50M9Fu.css"] }, "routes/employees._index": { "id": "routes/employees._index", "parentId": "root", "path": "employees", "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-cpGXU5PB.js", "imports": ["/assets/with-props-I-2ZKXig.js", "/assets/chunk-IR6S3I6Y-rOQZXXE2.js"], "css": [] }, "routes/timesheets.new": { "id": "routes/timesheets.new", "parentId": "root", "path": "timesheets/new", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-D3zWWeji.js", "imports": ["/assets/with-props-I-2ZKXig.js", "/assets/chunk-IR6S3I6Y-rOQZXXE2.js"], "css": [] }, "routes/employees.new": { "id": "routes/employees.new", "parentId": "root", "path": "employees/new", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-K0x42NHA.js", "imports": ["/assets/with-props-I-2ZKXig.js", "/assets/chunk-IR6S3I6Y-rOQZXXE2.js"], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-CH2PS7_1.js", "imports": ["/assets/with-props-I-2ZKXig.js", "/assets/chunk-IR6S3I6Y-rOQZXXE2.js"], "css": [] } }, "url": "/assets/manifest-f1d239b5.js", "version": "f1d239b5" };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "unstable_optimizeDeps": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/timesheets.edit..$timesheetId": {
    id: "routes/timesheets.edit..$timesheetId",
    parentId: "root",
    path: "timesheets/edit/:timesheetId",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/employees.edit.$employeeId": {
    id: "routes/employees.edit.$employeeId",
    parentId: "root",
    path: "employees/edit/:employeeId",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/timesheets.$timesheetId": {
    id: "routes/timesheets.$timesheetId",
    parentId: "root",
    path: "timesheets/:timesheetId",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/employees.$employeeId": {
    id: "routes/employees.$employeeId",
    parentId: "root",
    path: "employees/:employeeId",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/timesheets._index": {
    id: "routes/timesheets._index",
    parentId: "root",
    path: "timesheets",
    index: true,
    caseSensitive: void 0,
    module: route5
  },
  "routes/employees._index": {
    id: "routes/employees._index",
    parentId: "root",
    path: "employees",
    index: true,
    caseSensitive: void 0,
    module: route6
  },
  "routes/timesheets.new": {
    id: "routes/timesheets.new",
    parentId: "root",
    path: "timesheets/new",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "routes/employees.new": {
    id: "routes/employees.new",
    parentId: "root",
    path: "employees/new",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route9
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  publicPath,
  routes
};
