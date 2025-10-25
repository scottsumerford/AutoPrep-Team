'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, FileText, Presentation, Mail, Filter, RefreshCw, Download, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { CalendarView } from './calendar-view';

interface Profile {
  id: number;
  name: string;
  email: string;
  url_slug: string;
  title?: string;
  keyword_filter?: string;
  google_access_token?: string;
  outlook_access_token?: string;
}

interface CalendarEvent {
  id: number;
  event_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  attendees?: string[];
  source: 'google' | 'outlook';
  presales_report_status?: 'pending' | 'processing' | 'completed' | 'failed';
  presales_report_url?: string;
  presales_report_generated_at?: string;
  presales_report_started_at?: string;
  slides_status?: 'pending' | 'processing' | 'completed' | 'failed';
  slides_url?: string;
  slides_generated_at?: string;
  slides_started_at?: string;
  created_at?: string;
}

interface TokenStats {
  agent_run: number;
  presales_report: number;
  slides_generation: number;
  total: number;
}

// Helper function to check if a report is stale (processing > 20 minutes)
function isReportStale(event: CalendarEvent): boolean {
  if (event.presales_report_status !== 'processing') {
    return false;
  }
  
  // If it has a URL, it's not stale
  if (event.presales_report_url) {
    return false;
  }
  
  // Check if presales_report_started_at is more than 20 minutes ago
  if (!event.presales_report_started_at) {
    return false;
  }
  
  const startedTime = new Date(event.presales_report_started_at).getTime();
  const now = new Date().getTime();
  const twentyMinutesMs = 20 * 60 * 1000;
  
  return (now - startedTime) > twentyMinutesMs;
}

// Helper function to check if slides are stale (processing > 20 minutes)
function areSlidesStale(event: CalendarEvent): boolean {
  if (event.slides_status !== 'processing') {
    return false;
  }
  
  // If it has a URL, it's not stale
  if (event.slides_url) {
    return false;
  }
  
  // Check if slides_started_at is more than 20 minutes ago
  if (!event.slides_started_at) {
    return false;
  }
  
  const startedTime = new Date(event.slides_started_at).getTime();
  const now = new Date().getTime();
  const twentyMinutesMs = 20 * 60 * 1000;
  
  return (now - startedTime) > twentyMinutesMs;
}

// Helper function to format remaining time
function formatTimeRemaining(startedAt: string): string {
  const startedTime = new Date(startedAt).getTime();
  const now = new Date().getTime();
  const twentyMinutesMs = 20 * 60 * 1000;
  const elapsedMs = now - startedTime;
  const remainingMs = Math.max(0, twentyMinutesMs - elapsedMs);
  
  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function ProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const profileSlug = params.slug as string;
  const synced = searchParams.get('synced');
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [keywordFilter, setKeywordFilter] = useState('');
  const [showGoogleDialog, setShowGoogleDialog] = useState(false);
  const [showOutlookDialog, setShowOutlookDialog] = useState(false);
  const [showGoogleDisconnectDialog, setShowGoogleDisconnectDialog] = useState(false);
  const [showOutlookDisconnectDialog, setShowOutlookDisconnectDialog] = useState(false);
  const [generatingReportId, setGeneratingReportId] = useState<number | null>(null);
  const [generatingSlidesId, setGeneratingSlidesId] = useState<number | null>(null);
  const [reportPollingId, setReportPollingId] = useState<number | null>(null);
  const [slidesPollingId, setSlidesPollingId] = useState<number | null>(null);
  const [reportTimeRemaining, setReportTimeRemaining] = useState<{ [key: number]: string }>({});
  const [slidesTimeRemaining, setSlidesTimeRemaining] = useState<{ [key: number]: string }>({});

  const fetchProfile = useCallback(async () => {
    try {
      // Fetch profile by URL slug
      const response = await fetch(`/api/profiles/slug/${profileSlug}`);
      if (!response.ok) {
        throw new Error('Profile not found');
      }
      const data = await response.json();
      setProfile(data);
      setKeywordFilter(data.keyword_filter || '');
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [profileSlug]);

  const fetchEvents = useCallback(async () => {
    if (!profile) return;
    try {
      const response = await fetch(`/api/calendar/${profile.id}`);
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }, [profile]);

  const fetchTokenStats = useCallback(async () => {
    if (!profile) return;
    try {
      const response = await fetch(`/api/tokens/${profile.id}`);
      const data = await response.json();
      setTokenStats(data);
    } catch (error) {
      console.error('Error fetching token stats:', error);
    }
  }, [profile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Refresh profile when synced parameter is present (after OAuth callback)
  useEffect(() => {
    if (synced === 'true' && profile) {
      console.log('🔄 Refreshing profile after OAuth sync...');
      fetchProfile();
    }
  }, [synced, profile, fetchProfile]);

  useEffect(() => {
    if (profile) {
      fetchEvents();
      fetchTokenStats();
    }
  }, [profile, fetchEvents, fetchTokenStats]);

  // Timer for report time remaining
  useEffect(() => {
    if (reportPollingId === null) return;

    const interval = setInterval(() => {
      setEvents(prevEvents => {
        const event = prevEvents.find(e => e.id === reportPollingId);
        if (event && event.presales_report_started_at) {
          setReportTimeRemaining(prev => ({
            ...prev,
            [reportPollingId]: formatTimeRemaining(event.presales_report_started_at || "")
          }));
        }
        return prevEvents;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [reportPollingId]);

  // Timer for slides time remaining
  useEffect(() => {
    if (slidesPollingId === null) return;

    const interval = setInterval(() => {
      setEvents(prevEvents => {
        const event = prevEvents.find(e => e.id === slidesPollingId);
        if (event && event.slides_started_at) {
          setSlidesTimeRemaining(prev => ({
            ...prev,
            [slidesPollingId]: formatTimeRemaining(event.slides_started_at || "")
          }));
        }
        return prevEvents;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [slidesPollingId]);

  // Polling for report status
  useEffect(() => {
    if (reportPollingId === null) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/lindy/presales-report-status?event_id=${reportPollingId}`);
        const data = await response.json();

        if (data.found && data.reportUrl) {
          console.log('✅ Report found:', data.reportUrl);
          setEvents(prevEvents =>
            prevEvents.map(e =>
              e.id === reportPollingId
                ? { ...e, presales_report_status: 'completed', presales_report_url: data.reportUrl }
                : e
            )
          );
          setReportPollingId(null);
        } else if (events.find(e => e.id === reportPollingId) && isReportStale(events.find(e => e.id === reportPollingId)!)) {
          console.log('⏱️ Report generation timeout - showing try again');
          setEvents(prevEvents =>
            prevEvents.map(e =>
              e.id === reportPollingId
                ? { ...e, presales_report_status: 'processing' }
                : e
            )
          );
          setReportPollingId(null);
        }
      } catch (error) {
        console.error('Error polling report status:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [reportPollingId, events]);

  // Polling for slides status
  useEffect(() => {
    if (slidesPollingId === null) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/lindy/slides-status?event_id=${slidesPollingId}`);
        const data = await response.json();

        if (data.found && data.slidesUrl) {
          console.log('✅ Slides found:', data.slidesUrl);
          setEvents(prevEvents =>
            prevEvents.map(e =>
              e.id === slidesPollingId
                ? { ...e, slides_status: 'completed', slides_url: data.slidesUrl }
                : e
            )
          );
          setSlidesPollingId(null);
        } else if (events.find(e => e.id === slidesPollingId) && areSlidesStale(events.find(e => e.id === slidesPollingId)!)) {
          console.log('⏱️ Slides generation timeout - showing try again');
          setEvents(prevEvents =>
            prevEvents.map(e =>
              e.id === slidesPollingId
                ? { ...e, slides_status: 'processing' }
                : e
            )
          );
          setSlidesPollingId(null);
        }
      } catch (error) {
        console.error('Error polling slides status:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [slidesPollingId, events]);

  const handleSyncCalendar = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profile?.id }),
      });
      if (response.ok) {
        await fetchEvents();
      }
    } catch (error) {
      console.error('Error syncing calendar:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleGeneratePresalesReport = async (event: CalendarEvent) => {
    setGeneratingReportId(event.id);
    try {
      // Call the API endpoint (which handles webhook authentication server-side)
      const response = await fetch('/api/lindy/presales-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: event.id,
          event_title: event.title,
          event_description: event.description || '',
          attendee_email: profile?.email || '',
        }),
      });
      
      if (response.ok) {
        console.log('✅ Pre-sales report generation started');
        // Update local state to show processing
        const now = new Date().toISOString();
        setEvents(events.map(e => 
          e.id === event.id 
            ? { ...e, presales_report_status: 'processing', presales_report_started_at: now }
            : e
        ));
        // Start polling for the report
        setReportPollingId(event.id);
        setReportTimeRemaining(prev => ({
          ...prev,
          [event.id]: '20:00'
        }));
      } else {
        console.error('❌ Failed to generate pre-sales report');
      }
    } catch (error) {
      console.error('Error generating pre-sales report:', error);
    } finally {
      setGeneratingReportId(null);
    }
  };

  const handleGenerateSlides = async (event: CalendarEvent) => {
    setGeneratingSlidesId(event.id);
    try {
      // Call the API endpoint (which handles webhook authentication server-side)
      const response = await fetch('/api/lindy/slides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: event.id,
          event_title: event.title,
          event_description: event.description || '',
          attendee_email: profile?.email || '',
        }),
      });
      
      if (response.ok) {
        console.log('✅ Slides generation started');
        // Update local state to show processing
        const now = new Date().toISOString();
        setEvents(events.map(e => 
          e.id === event.id 
            ? { ...e, slides_status: 'processing', slides_started_at: now }
            : e
        ));
        // Start polling for the slides
        setSlidesPollingId(event.id);
        setSlidesTimeRemaining(prev => ({
          ...prev,
          [event.id]: '20:00'
        }));
      } else {
        console.error('❌ Failed to generate slides');
      }
    } catch (error) {
      console.error('Error generating slides:', error);
    } finally {
      setGeneratingSlidesId(null);
    }
  };

  const handleUpdateKeywordFilter = async () => {
    if (!profile) return;
    try {
      const response = await fetch(`/api/profiles/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword_filter: keywordFilter }),
      });
      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
      }
    } catch (error) {
      console.error('Error updating keyword filter:', error);
    }
  };

  const handleDisconnectGoogle = async () => {
    if (!profile) return;
    try {
      const response = await fetch(`/api/profiles/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          google_access_token: undefined,
          google_refresh_token: undefined
        }),
      });
      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        setShowGoogleDisconnectDialog(false);
      }
    } catch (error) {
      console.error('Error disconnecting Google:', error);
    }
  };

  const handleDisconnectOutlook = async () => {
    if (!profile) return;
    try {
      const response = await fetch(`/api/profiles/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          outlook_access_token: undefined,
          outlook_refresh_token: undefined
        }),
      });
      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        setShowOutlookDisconnectDialog(false);
      }
    } catch (error) {
      console.error('Error disconnecting Outlook:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">The profile you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center">
          ← Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>
          <p className="text-gray-600">{profile.email}</p>
          <p className="text-sm text-gray-500 mt-2">Profile URL: https://team.autoprep.ai/profile/{profile.url_slug}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{tokenStats?.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Agent Runs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{tokenStats?.agent_run || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pre-sales Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{tokenStats?.presales_report || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Slides Generated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{tokenStats?.slides_generation || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
                <CardDescription>Manage authentication and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-gray-700">{profile.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-gray-700">{profile.email}</p>
                </div>
                {profile.title && (
                  <div>
                    <Label className="text-sm font-medium">Title</Label>
                    <p className="text-gray-700">{profile.title}</p>
                  </div>
                )}

                <div className="border-t pt-6">
                  <Label className="text-sm font-medium mb-3 block">Calendar Authentication</Label>
                  <div className="space-y-2">
                    {profile.google_access_token ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                        <span className="text-sm font-medium text-green-700">✓ Google Connected</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowGoogleDisconnectDialog(true)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowGoogleDialog(true)}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Connect Google
                      </Button>
                    )}
                    {profile.outlook_access_token ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                        <span className="text-sm font-medium text-green-700">✓ Outlook Connected</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowOutlookDisconnectDialog(true)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowOutlookDialog(true)}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Connect Outlook
                      </Button>
                    )}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <Label className="text-sm font-medium mb-3 block">Keyword Filter</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Filter events by keyword"
                      value={keywordFilter}
                      onChange={(e) => setKeywordFilter(e.target.value)}
                    />
                    <Button
                      onClick={handleUpdateKeywordFilter}
                      className="w-full"
                      variant="outline"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Apply Filter
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Only show calendar events containing this keyword in the title
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendar and Events */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Calendar</CardTitle>
                  <CardDescription>Connect your calendar to see events</CardDescription>
                </div>
                <Button
                  onClick={handleSyncCalendar}
                  disabled={syncing}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : 'Sync'}
                </Button>
              </CardHeader>
              <CardContent>
                {profile.google_access_token || profile.outlook_access_token ? (
                  <CalendarView events={events} />
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Calendar view will appear here once connected</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calendar Events</CardTitle>
                <CardDescription>{events.length} events</CardDescription>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No events found. Connect your calendar to see events.</p>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{event.title}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(event.start_time).toLocaleString()}
                            </p>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {event.source}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                        )}
                        <div className="flex gap-2 flex-wrap">
                          {event.presales_report_status && (
                            <div className="flex items-center gap-2">
                              {event.presales_report_status === 'pending' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleGeneratePresalesReport(event)}
                                  disabled={generatingReportId === event.id}
                                >
                                  {generatingReportId === event.id ? (
                                    <>
                                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                      Generating...
                                    </>
                                  ) : (
                                    <>
                                      <FileText className="w-4 h-4 mr-2" />
                                      Generate Pre-Sales Report
                                    </>
                                  )}
                                </Button>
                              )}
                              {event.presales_report_status === 'processing' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  disabled
                                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700"
                                >
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Generating Report... {reportTimeRemaining[event.id] && `(${reportTimeRemaining[event.id]})`}
                                </Button>
                              )}
                              {event.presales_report_status === 'completed' && event.presales_report_url && (
                                <a
                                  href={event.presales_report_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded text-sm text-green-700 hover:bg-green-100"
                                >
                                  <Download className="w-4 h-4" />
                                  Download Report
                                </a>
                              )}
                              {event.presales_report_status === 'failed' && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                  <FileText className="w-4 h-4" />
                                  Report Failed
                                </div>
                              )}
                              {isReportStale(event) && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleGeneratePresalesReport(event)}
                                  disabled={generatingReportId === event.id}
                                >
                                  {generatingReportId === event.id ? (
                                    <>
                                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                      Retrying...
                                    </>
                                  ) : (
                                    'Try again'
                                  )}
                                </Button>
                              )}
                            </div>
                          )}
                          {event.slides_status && (
                            <div className="flex items-center gap-2">
                              {event.slides_status === 'pending' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleGenerateSlides(event)}
                                  disabled={generatingSlidesId === event.id}
                                >
                                  {generatingSlidesId === event.id ? (
                                    <>
                                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                      Generating...
                                    </>
                                  ) : (
                                    <>
                                      <Presentation className="w-4 h-4 mr-2" />
                                      Generate Slides
                                    </>
                                  )}
                                </Button>
                              )}
                              {event.slides_status === 'processing' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  disabled
                                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700"
                                >
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Generating Slides... {slidesTimeRemaining[event.id] && `(${slidesTimeRemaining[event.id]})`}
                                </Button>
                              )}
                              {event.slides_status === 'completed' && event.slides_url && (
                                <a
                                  href={event.slides_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded text-sm text-green-700 hover:bg-green-100"
                                >
                                  <Download className="w-4 h-4" />
                                  Download Slides
                                </a>
                              )}
                              {event.slides_status === 'failed' && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                  <Presentation className="w-4 h-4" />
                                  Slides Failed
                                </div>
                              )}
                              {areSlidesStale(event) && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleGenerateSlides(event)}
                                  disabled={generatingSlidesId === event.id}
                                >
                                  {generatingSlidesId === event.id ? (
                                    <>
                                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                      Retrying...
                                    </>
                                  ) : (
                                    'Try again'
                                  )}
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Google Connect Dialog */}
      <AlertDialog open={showGoogleDialog} onOpenChange={setShowGoogleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Connect Google Calendar</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ll be redirected to Google to authorize calendar access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <a href={`/api/auth/google?profile_id=${profile.id}`}>
                Connect Google
              </a>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Google Disconnect Dialog */}
      <AlertDialog open={showGoogleDisconnectDialog} onOpenChange={setShowGoogleDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Google Calendar</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect your Google Calendar? Your synced events will remain in the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnectGoogle} className="bg-red-600 hover:bg-red-700">
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Outlook Connect Dialog */}
      <AlertDialog open={showOutlookDialog} onOpenChange={setShowOutlookDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Connect Outlook Calendar</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ll be redirected to Microsoft to authorize calendar access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <a href={`/api/auth/outlook?profile_id=${profile.id}`}>
                Connect Outlook
              </a>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Outlook Disconnect Dialog */}
      <AlertDialog open={showOutlookDisconnectDialog} onOpenChange={setShowOutlookDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Outlook Calendar</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect your Outlook Calendar? Your synced events will remain in the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnectOutlook} className="bg-red-600 hover:bg-red-700">
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
