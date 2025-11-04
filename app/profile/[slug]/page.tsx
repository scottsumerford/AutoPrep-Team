'use client';

import { useEffect, useState, useCallback } from 'react';
import { FileUploadSection } from '@/components/FileUploadSection';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar, FileText, Presentation, Upload, Mail, Filter, RefreshCw, Download, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
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
  title?: string;
  operation_mode: 'auto-sync' | 'manual';
  manual_email?: string;
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
  slides_status?: 'pending' | 'processing' | 'completed' | 'failed';
  slides_url?: string;
  slides_generated_at?: string;
}

interface TokenStats {
  agent_run: number;
  presales_report: number;
  slides_generation: number;
  total: number;
}

export default function ProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const profileId = params.slug as string;
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [keywordFilter, setKeywordFilter] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [showGoogleDialog, setShowGoogleDialog] = useState(false);
  const [showOutlookDialog, setShowOutlookDialog] = useState(false);
  const [generatingReports, setGeneratingReports] = useState<Set<number>>(new Set());
  const [generatingSlides, setGeneratingSlides] = useState<Set<number>>(new Set());

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch(`/api/profiles/slug/${profileId}`);
      const data = await response.json();
      setProfile(data);
      setKeywordFilter(data.keyword_filter || '');
      setManualEmail(data.manual_email || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const fetchEvents = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const response = await fetch(`/api/calendar/${profile.id}`);
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }, [profile]);

  const fetchTokenStats = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const response = await fetch(`/api/tokens/${profile.id}`);
      const data = await response.json();
      setTokenStats(data);
    } catch (error) {
      console.error('Error fetching token stats:', error);
    }
  }, [profile]);

  const syncCalendar = useCallback(async () => {
    if (!profile?.google_access_token && !profile?.outlook_access_token) {
      return;
    }

    setSyncing(true);
    try {
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profile.id })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Calendar synced:', data);
        alert(`✅ Calendar synced successfully! ${data.synced_events || 0} events imported.`);
        await fetchEvents();
      } else {
        const errorData = await response.json();
        console.error('Failed to sync calendar:', errorData);
        alert(`❌ Failed to sync calendar: ${errorData.error || 'Unknown error'}\n\nDetails: ${errorData.details || 'No details available'}`);
      }
    } catch (error) {
      console.error('Error syncing calendar:', error);
      alert(`❌ Error syncing calendar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSyncing(false);
    }
  }, [profileId, profile, fetchEvents]);

  useEffect(() => {
    fetchProfile();
    fetchEvents();
    fetchTokenStats();
  }, [fetchProfile, fetchEvents, fetchTokenStats]);

  // Auto-sync calendar when profile is loaded and has tokens
  useEffect(() => {
    if (profile && (profile.google_access_token || profile.outlook_access_token)) {
      const justSynced = searchParams.get('synced') === 'true';
      
      if (!justSynced) {
        syncCalendar();
      }
    }
  }, [profile, searchParams, syncCalendar]);

  useEffect(() => {
    if (profile) {
      document.title = `${profile.name} - AutoPrep.AI`;
    }
  }, [profile]);

  // Poll for report status updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (generatingReports.size > 0 || generatingSlides.size > 0) {
        fetchEvents();
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [generatingReports, generatingSlides, fetchEvents]);
  
  const handleOperationModeToggle = async (checked: boolean) => {
    const newMode = checked ? 'auto-sync' : 'manual';
    try {
      await fetch(`/api/profiles/slug/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation_mode: newMode })
      });
      fetchProfile();
    } catch (error) {
      console.error('Error updating operation mode:', error);
    }
  };

  const handleFilterUpdate = async () => {
    try {
      await fetch(`/api/profiles/slug/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword_filter: keywordFilter })
      });
      fetchEvents();
    } catch (error) {
      console.error('Error updating filter:', error);
    }
  };

  const handleManualEmailUpdate = async () => {
    try {
      await fetch(`/api/profiles/slug/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manual_email: manualEmail })
      });
      fetchProfile();
    } catch (error) {
      console.error('Error updating manual email:', error);
    }
  };

  const handleGenerateReport = async (event: CalendarEvent) => {
    setGeneratingReports(prev => new Set(prev).add(event.id));
    
    try {
      const response = await fetch('/api/lindy/presales-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: profileId,
          event_id: event.id,
          event_title: event.title,
          event_description: event.description,
          attendee_email: profile?.operation_mode === 'manual' ? manualEmail : event.attendees?.[0]
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('✅ Pre-sales report generation started! The report will be ready in a few minutes.');
        fetchEvents();
        fetchTokenStats();
      } else {
        alert(`❌ Failed to generate report: ${data.error || 'Unknown error'}`);
        setGeneratingReports(prev => {
          const newSet = new Set(prev);
          newSet.delete(event.id);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setGeneratingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(event.id);
        return newSet;
      });
    }
  };

  const handleGenerateSlides = async (event: CalendarEvent) => {
    setGeneratingSlides(prev => new Set(prev).add(event.id));
    
    try {
      const response = await fetch('/api/lindy/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: profileId,
          event_id: event.id,
          event_title: event.title,
          event_description: event.description,
          attendee_email: profile?.operation_mode === 'manual' ? manualEmail : event.attendees?.[0]
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('✅ Slides generation started! The slides will be ready in a few minutes.');
        fetchEvents();
        fetchTokenStats();
      } else {
        alert(`❌ Failed to generate slides: ${data.error || 'Unknown error'}`);
        setGeneratingSlides(prev => {
          const newSet = new Set(prev);
          newSet.delete(event.id);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error generating slides:', error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setGeneratingSlides(prev => {
        const newSet = new Set(prev);
        newSet.delete(event.id);
        return newSet;
      });
    }
  };

  const handleGoogleAuthConfirm = () => {
    window.location.href = `/api/auth/google?profile_id=${profileId}`;
  };

  const handleOutlookAuthConfirm = () => {
    window.location.href = `/api/auth/outlook?profile_id=${profileId}`;
  };

  const filteredEvents = events.filter(event => {
    if (!keywordFilter) return true;
    return event.title.toLowerCase().includes(keywordFilter.toLowerCase());
  });

  // Separate events with completed reports
  const eventsWithReports = filteredEvents.filter(event => 
    event.presales_report_status === 'completed' || event.slides_status === 'completed'
  );

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-500">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            {profile.name}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {profile.email} {profile.title && `• ${profile.title}`}
          </p>
        </div>

        {/* Token Usage Stats */}
        {tokenStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tokenStats.total.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Agent Runs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tokenStats.agent_run.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tokenStats.presales_report.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Slides Generated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tokenStats.slides_generation.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Settings & File Uploads */}
          <div className="space-y-6">
            {/* Calendar Connection */}
            <Card>
              <CardHeader>
                <CardTitle>Calendar Connection</CardTitle>
                <CardDescription>Connect your calendar to sync events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => setShowGoogleDialog(true)}
                  variant={profile.google_access_token ? 'default' : 'outline'}
                  className="w-full"
                >
                  {profile.google_access_token ? '✓ Google Connected' : 'Connect Google Calendar'}
                </Button>
                <Button
                  onClick={() => setShowOutlookDialog(true)}
                  variant={profile.outlook_access_token ? 'default' : 'outline'}
                  className="w-full"
                >
                  {profile.outlook_access_token ? '✓ Outlook Connected' : 'Connect Outlook Calendar'}
                </Button>
                {(profile.google_access_token || profile.outlook_access_token) && (
                  <Button
                    onClick={syncCalendar}
                    disabled={syncing}
                    variant="secondary"
                    className="w-full gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Syncing...' : 'Sync Calendar'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Configure your AutoPrep preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Operation Mode */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="operation-mode">Auto-Sync Mode</Label>
                    <Switch
                      id="operation-mode"
                      checked={profile.operation_mode === 'auto-sync'}
                      onCheckedChange={handleOperationModeToggle}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    {profile.operation_mode === 'auto-sync' 
                      ? 'Automatically syncing with your calendar' 
                      : 'Manual email lookup mode'}
                  </p>
                </div>

                {/* Manual Email Input */}
                {profile.operation_mode === 'manual' && (
                  <div className="space-y-2">
                    <Label htmlFor="manual-email">Attendee Email Address</Label>
                    <div className="flex gap-2">
                      <Input
                        id="manual-email"
                        type="email"
                        placeholder="attendee@company.com"
                        value={manualEmail}
                        onChange={(e) => setManualEmail(e.target.value)}
                      />
                      <Button onClick={handleManualEmailUpdate} size="sm">
                        Save
                      </Button>
                    </div>
                  </div>
                )}

                {/* Keyword Filter */}
                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="keyword-filter" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Keyword Filter
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="keyword-filter"
                      placeholder="Filter events by keyword"
                      value={keywordFilter}
                      onChange={(e) => setKeywordFilter(e.target.value)}
                    />
                    <Button onClick={handleFilterUpdate} size="sm">
                      Apply
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Only show calendar events containing this keyword in the title
                  </p>
                </div>

                {/* File Uploads */}
                {profile && (
                  <div className="pt-4 border-t">
                    <FileUploadSection profileId={profile.id} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Calendar & Events */}
          <div className="lg:col-span-2 space-y-6">
            {/* Calendar View */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Calendar
                </CardTitle>
                <CardDescription>
                  {profile.google_access_token || profile.outlook_access_token
                    ? 'Synced with your calendar'
                    : 'Connect your calendar to see events'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profile.google_access_token || profile.outlook_access_token ? (
                  <CalendarView events={events} />
                ) : (
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-8 text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-600 dark:text-slate-400">
                      Calendar view will appear here once connected
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generated Reports Section */}
            {eventsWithReports.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Generated Reports
                  </CardTitle>
                  <CardDescription>
                    {eventsWithReports.length} event{eventsWithReports.length !== 1 ? 's' : ''} with completed reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {eventsWithReports.map((event) => (
                      <Card key={event.id} className="border-l-4 border-l-green-500">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <CardDescription>
                            {new Date(event.start_time).toLocaleString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {event.presales_report_status === 'completed' && event.presales_report_url && (
                              <Button
                                asChild
                                variant="default"
                                size="sm"
                                className="gap-2"
                              >
                                <a href={event.presales_report_url} target="_blank" rel="noopener noreferrer">
                                  <Download className="w-4 h-4" />
                                  Download Pre-Sales Report
                                </a>
                              </Button>
                            )}
                            {event.slides_status === 'completed' && event.slides_url && (
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="gap-2"
                              >
                                <a href={event.slides_url} target="_blank" rel="noopener noreferrer">
                                  <Download className="w-4 h-4" />
                                  Download Slides
                                </a>
                              </Button>
                            )}
                          </div>
                          {event.presales_report_generated_at && (
                            <p className="text-xs text-slate-500">
                              Report generated: {new Date(event.presales_report_generated_at).toLocaleString()}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Calendar Events List */}
            <Card>
              <CardHeader>
                <CardTitle>Calendar Events</CardTitle>
                <CardDescription>
                  {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} 
                  {keywordFilter && ` matching "${keywordFilter}"`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                    {profile.google_access_token || profile.outlook_access_token
                      ? syncing 
                        ? 'Syncing calendar events...'
                        : 'No events found. Try syncing your calendar.'
                      : 'No events found. Connect your calendar to see events.'}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredEvents.map((event) => (
                      <Card key={event.id} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <CardDescription>
                            {new Date(event.start_time).toLocaleString()} - {new Date(event.end_time).toLocaleTimeString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {event.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {event.description}
                            </p>
                          )}
                          {event.attendees && event.attendees.length > 0 && (
                            <p className="text-xs text-slate-500">
                              Attendees: {event.attendees.join(', ')}
                            </p>
                          )}
                          
                          {/* Status Indicators */}
                          <div className="flex gap-4 text-xs">
                            {event.presales_report_status && (
                              <div className="flex items-center gap-1">
                                {getStatusIcon(event.presales_report_status)}
                                <span>Report: {event.presales_report_status}</span>
                              </div>
                            )}
                            {event.slides_status && (
                              <div className="flex items-center gap-1">
                                {getStatusIcon(event.slides_status)}
                                <span>Slides: {event.slides_status}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleGenerateReport(event)}
                              variant={event.presales_report_status === 'completed' ? 'outline' : 'default'}
                              size="sm"
                              className="gap-2"
                              disabled={event.presales_report_status === 'processing' || generatingReports.has(event.id)}
                            >
                              {event.presales_report_status === 'processing' || generatingReports.has(event.id) ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Generating...
                                </>
                              ) : event.presales_report_status === 'completed' ? (
                                <>
                                  <CheckCircle className="w-4 h-4" />
                                  Regenerate Report
                                </>
                              ) : (
                                <>
                                  <FileText className="w-4 h-4" />
                                  Generate Pre-Sales Report
                                </>
                              )}
                            </Button>
                            <Button 
                              onClick={() => handleGenerateSlides(event)}
                              variant={event.slides_status === 'completed' ? 'outline' : 'outline'}
                              size="sm"
                              className="gap-2"
                              disabled={event.slides_status === 'processing' || generatingSlides.has(event.id)}
                            >
                              {event.slides_status === 'processing' || generatingSlides.has(event.id) ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Generating...
                                </>
                              ) : event.slides_status === 'completed' ? (
                                <>
                                  <CheckCircle className="w-4 h-4" />
                                  Regenerate Slides
                                </>
                              ) : (
                                <>
                                  <Presentation className="w-4 h-4" />
                                  Generate Slides
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Google Auth Confirmation Dialog */}
      <AlertDialog open={showGoogleDialog} onOpenChange={setShowGoogleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Connect with Google</AlertDialogTitle>
            <AlertDialogDescription>
              You will be redirected to Google to sign in and authorize AutoPrep to access your Google Calendar. 
              This will allow us to automatically sync your calendar events and help you prepare for meetings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleGoogleAuthConfirm}>
              Continue to Google
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Outlook Auth Confirmation Dialog */}
      <AlertDialog open={showOutlookDialog} onOpenChange={setShowOutlookDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Connect with Outlook</AlertDialogTitle>
            <AlertDialogDescription>
              You will be redirected to Microsoft to sign in and authorize AutoPrep to access your Outlook Calendar. 
              This will allow us to automatically sync your calendar events and help you prepare for meetings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleOutlookAuthConfirm}>
              Continue to Outlook
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
