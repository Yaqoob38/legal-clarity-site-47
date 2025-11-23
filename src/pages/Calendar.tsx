import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";

const Calendar = () => {
  const { events, isLoading } = useCalendarEvents();
  const [currentDate, setCurrentDate] = useState(new Date());

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "Deadline":
        return "bg-red-500 border-red-600";
      case "Completion":
        return "bg-green-500 border-green-600";
      case "Meeting":
        return "bg-blue-500 border-blue-600";
      default:
        return "bg-gray-500 border-gray-600";
    }
  };

  const getEventTypeTextColor = (type: string) => {
    switch (type) {
      case "Deadline":
        return "text-red-700 bg-red-50 border-red-200";
      case "Completion":
        return "text-green-700 bg-green-50 border-green-200";
      case "Meeting":
        return "text-blue-700 bg-blue-50 border-blue-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  // Get days in current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  // Get events for a specific day
  const getEventsForDay = (day: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.event_date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === month &&
        eventDate.getFullYear() === year
      );
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const sortedUpcomingEvents = [...events]
    .filter((e) => new Date(e.event_date) >= today)
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="bg-brand-gray h-screen flex overflow-hidden">
        <DashboardSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading calendar...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-gray h-screen flex overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-serif text-brand-navy">Calendar</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Key Dates & Deadlines</p>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-brand-gray p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            
            {/* Calendar Grid - Left Side */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif font-bold text-brand-navy">
                    {currentDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={previousMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-brand-navy" />
                    </button>
                    <button
                      onClick={nextMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-brand-navy" />
                    </button>
                  </div>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                    <div key={`empty-${index}`} className="aspect-square p-2" />
                  ))}

                  {/* Days of the month */}
                  {Array.from({ length: daysInMonth }).map((_, index) => {
                    const day = index + 1;
                    const dayEvents = getEventsForDay(day);
                    const isTodayDate = isToday(day);

                    return (
                      <div
                        key={day}
                        className={`aspect-square p-2 border rounded-lg transition-all hover:border-brand-gold cursor-pointer ${
                          isTodayDate ? "bg-brand-gold/10 border-brand-gold" : "border-gray-100"
                        } ${dayEvents.length > 0 ? "bg-blue-50/50" : ""}`}
                      >
                        <div className="h-full flex flex-col">
                          <div className={`text-sm font-medium mb-1 ${
                            isTodayDate ? "text-brand-gold" : "text-brand-navy"
                          }`}>
                            {day}
                          </div>
                          <div className="flex-1 flex flex-col gap-1">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                className={`w-full h-1.5 rounded-full ${getEventTypeColor(event.event_type)}`}
                                title={event.title}
                              />
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-[9px] text-gray-500 font-medium">+{dayEvents.length - 2}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-gray-600">Deadline</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-gray-600">Completion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-gray-600">Meeting</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Events - Right Side */}
            <div className="space-y-6">
              {/* Upcoming Events */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-serif font-bold text-brand-navy mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-gold" />
                  Upcoming Events
                </h3>
                
                {sortedUpcomingEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No upcoming events</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedUpcomingEvents.map((event) => {
                      const eventDate = new Date(event.event_date);
                      const daysUntil = Math.ceil(
                        (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                      );

                      return (
                        <div key={event.id} className="p-3 border border-gray-200 rounded-lg hover:border-brand-gold transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 text-center">
                              <div className="text-lg font-bold text-brand-navy">
                                {eventDate.getDate()}
                              </div>
                              <div className="text-[10px] text-gray-500 uppercase">
                                {eventDate.toLocaleDateString("en-GB", { month: "short" })}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm text-brand-navy mb-1">{event.title}</h4>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold ${getEventTypeTextColor(event.event_type)}`}>
                                {event.event_type}
                              </span>
                              {daysUntil <= 7 && (
                                <p className="text-xs text-brand-gold mt-2 font-medium">
                                  {daysUntil === 0
                                    ? "Today"
                                    : daysUntil === 1
                                    ? "Tomorrow"
                                    : `In ${daysUntil} days`}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Summary Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-serif font-bold text-brand-navy mb-4">Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-blue-700 font-medium">Total Events</span>
                    <span className="text-xl font-bold text-blue-700">{events.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-sm text-red-700 font-medium">Deadlines</span>
                    <span className="text-xl font-bold text-red-700">
                      {events.filter((e) => e.event_type === "Deadline" && new Date(e.event_date) >= today).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-green-700 font-medium">Completions</span>
                    <span className="text-xl font-bold text-green-700">
                      {events.filter((e) => e.event_type === "Completion").length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Calendar;