import { Calendar as CalendarIcon, Clock } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";

const Calendar = () => {
  const { events, isLoading } = useCalendarEvents();

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "Deadline":
        return "bg-red-500/10 text-red-700 border-red-200";
      case "Completion":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "Meeting":
        return "bg-blue-500/10 text-blue-700 border-blue-200";
      default:
        return "bg-gray-200 text-gray-700 border-gray-300";
    }
  };

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
  );

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
          
          {events.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No events scheduled</p>
              <p className="text-sm text-gray-400">Check back later for important dates</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Current Month View */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-serif font-bold text-brand-navy mb-4">
                  {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                </h2>
                
                <div className="space-y-4">
                  {sortedEvents.map((event) => {
                    const eventDate = new Date(event.event_date);
                    const isUpcoming = eventDate > new Date();
                    const daysUntil = Math.ceil(
                      (eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );

                    return (
                      <div
                        key={event.id}
                        className={`flex items-start gap-4 p-4 border rounded-lg ${
                          isUpcoming ? "border-brand-gold bg-brand-gold/5" : "border-gray-200"
                        }`}
                      >
                        <div className="flex-shrink-0 w-16 text-center">
                          <div className="text-2xl font-bold text-brand-navy">
                            {eventDate.getDate()}
                          </div>
                          <div className="text-xs text-gray-500 uppercase">
                            {eventDate.toLocaleDateString("en-GB", { month: "short" })}
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-serif font-bold text-brand-navy">{event.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getEventTypeColor(event.event_type)}`}>
                              {event.event_type}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                          )}
                          {isUpcoming && daysUntil <= 7 && (
                            <div className="flex items-center gap-1 text-xs text-brand-gold">
                              <Clock className="w-3 h-3" />
                              <span>
                                {daysUntil === 0
                                  ? "Today"
                                  : daysUntil === 1
                                  ? "Tomorrow"
                                  : `${daysUntil} days away`}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-medium text-brand-navy">
                            {eventDate.toLocaleDateString("en-GB", { weekday: "short" })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upcoming Deadlines Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-serif font-bold text-brand-navy mb-4">Quick Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-700">
                      {events.filter((e) => new Date(e.event_date) > new Date()).length}
                    </div>
                    <div className="text-sm text-blue-600">Upcoming Events</div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-2xl font-bold text-red-700">
                      {events.filter((e) => e.event_type === "Deadline" && new Date(e.event_date) > new Date()).length}
                    </div>
                    <div className="text-sm text-red-600">Active Deadlines</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-700">
                      {events.filter((e) => new Date(e.event_date) < new Date()).length}
                    </div>
                    <div className="text-sm text-green-600">Completed</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Calendar;
