'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

interface CalendarEvent {
  id: number;
  title: string;
  start_time: string;
  presales_report_status?: 'pending' | 'processing' | 'completed' | 'failed';
  presales_report_url?: string;
  presales_report_content?: string;
  presales_report_generated_at?: string;
}

interface GeneratedReportsSectionProps {
  events: CalendarEvent[];
}

export function GeneratedReportsSection({ events }: GeneratedReportsSectionProps) {
  // Filter events that have completed reports
  const completedReports = events.filter(
    event => event.presales_report_status === 'completed' && event.presales_report_url
  );

  if (completedReports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
          <CardDescription>Your completed pre-sales reports</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-6">
            No reports generated yet. Generate reports from calendar events to see them here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Reports</CardTitle>
        <CardDescription>{completedReports.length} completed report(s)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {completedReports.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{event.title}</h4>
                <p className="text-xs text-gray-500">
                  {new Date(event.start_time).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2 ml-2">
                {event.presales_report_url && (
                  <a
                    href={event.presales_report_url}
                    download={`report-${event.id}.pdf`}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 border border-blue-200 rounded text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    PDF
                  </a>
                )}
                {event.presales_report_content && (
                  <button
                    onClick={() => {
                      const element = document.createElement('a');
                      const file = new Blob([event.presales_report_content!], {
                        type: 'text/plain',
                      });
                      element.href = URL.createObjectURL(file);
                      element.download = `report-${event.id}.txt`;
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <FileText className="w-3 h-3" />
                    TXT
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
