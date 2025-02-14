import React, { useEffect, useState } from "react";
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import {
  createViewDay,
  createViewWeek,
  createViewMonthGrid,
  createViewMonthAgenda,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import "@schedule-x/theme-default/dist/index.css";

function CalendarApp({ timesheets }) {
  const [eventsService] = useState(() => createEventsServicePlugin());

  // Convert timesheets to calendar events
  const calendarEvents = timesheets.map((timesheet) => ({
    id: timesheet.id.toString(),
    title: `Timesheet for ${timesheet.full_name}`,
    start: new Date(timesheet.start_time).toISOString(), // Ensure valid ISO 8601
    end: new Date(timesheet.end_time).toISOString(),     // Ensure valid ISO 8601
  }));

  const calendar = useCalendarApp({
    views: [
      createViewDay(),
      createViewWeek(),
      createViewMonthGrid(),
      createViewMonthAgenda(),
    ],
    events: calendarEvents,
    plugins: [eventsService],
  });

  useEffect(() => {
    eventsService.getAll(); // Load all events into the service
  }, [eventsService]);

  return (
    <div style={{ padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "10px" }}>
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  );
}

export default CalendarApp;
