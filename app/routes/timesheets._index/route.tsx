import { useLoaderData } from "react-router";
import { useState } from "react";
import { getDB } from "~/db/getDB";
import CalendarApp from '../../components/CalendarApp.js';

export async function loader() {
  const db = await getDB();
  const timesheetsAndEmployees = await db.all(
    "SELECT timesheets.*, employees.full_name, employees.id AS employee_id FROM timesheets JOIN employees ON timesheets.employee_id = employees.id"
  );

  return { timesheetsAndEmployees };
}

export default function TimesheetsPage() {
  const { timesheetsAndEmployees } = useLoaderData();
  const [view, setView] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate pagination details
  const totalItems = timesheetsAndEmployees.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedTimesheets = timesheetsAndEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          style={{
            padding: '10px 20px',
            cursor: 'pointer',
            borderRadius: '5px',
            border: 'none',
            backgroundColor: view === 'table' ? '#007bff' : '#ccc',
            color: '#fff',
            fontWeight: 'bold',
            transition: 'background-color 0.3s',
            outline: 'none'
          }} 
          onClick={() => setView('table')}
        >
          Table View
        </button>
        <button 
          style={{
            padding: '10px 20px',
            cursor: 'pointer',
            borderRadius: '5px',
            border: 'none',
            backgroundColor: view === 'calendar' ? '#007bff' : '#ccc',
            color: '#fff',
            fontWeight: 'bold',
            transition: 'background-color 0.3s',
            outline: 'none'
          }} 
          onClick={() => setView('calendar')}
        >
          Calendar View
        </button>
      </div>
      {view === 'table' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {paginatedTimesheets.map((timesheet) => (
            <div 
              key={timesheet.id} 
              style={{
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '10px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                backgroundColor: '#fefefe'
              }}
            >
              <h2 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: 'bold' }}>
                Timesheet #{timesheet.id}
              </h2>
              <p style={{ margin: '5px 0' }}>
                <strong>Employee:</strong> {timesheet.full_name} (ID: {timesheet.employee_id})
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Start Time:</strong> {timesheet.start_time}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>End Time:</strong> {timesheet.end_time}
              </p>
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <a 
                  href={`/timesheets/edit/${timesheet.id}`} 
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '5px',
                    transition: 'background-color 0.3s',
                  }}
                >
                  Edit
                </a>
                <a 
                  href={`/timesheets/${timesheet.id}`} 
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '5px',
                    transition: 'background-color 0.3s',
                  }}
                >
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
        <CalendarApp timesheets={timesheetsAndEmployees}/>
        </div>
      )}
      
      {/* Pagination controls */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
        <button 
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            borderRadius: '5px',
            border: '1px solid #ddd',
            backgroundColor: currentPage === 1 ? '#e0e0e0' : '#007bff',
            color: currentPage === 1 ? '#888' : '#fff',
            transition: 'background-color 0.3s',
            outline: 'none'
          }}
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>
        <button 
          style={{
            padding: '10px 20px',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            borderRadius: '5px',
            border: '1px solid #ddd',
            backgroundColor: currentPage === totalPages ? '#e0e0e0' : '#007bff',
            color: currentPage === totalPages ? '#888' : '#fff',
            transition: 'background-color 0.3s',
            outline: 'none'
          }}
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>

      <hr style={{ margin: '20px 0', borderColor: '#ddd' }} />
      <ul style={{ listStyleType: 'none', padding: '0', margin: '0' }}>
        <li style={{ marginBottom: '10px' }}>
          <a href="/timesheets/new" style={{ color: '#007bff', textDecoration: 'none' }}>
            New Timesheet
          </a>
        </li>
        <li>
          <a href="/employees" style={{ color: '#007bff', textDecoration: 'none' }}>
            Employees
          </a>
        </li>
      </ul>
    </div>
  );
}
