'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, FileText, Presentation, Upload, Mail, Filter, RefreshCw, Download, Loader2 } from 'lucide-react';
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
  created_at?: string;
}

interface TokenStats {
  agent_run: number;
  presales_report: number;
  slides_generation: number;
  total: number;
}

// Helper function to check if a report is stale (processing > 15 minutes)
function isReportStale(event: CalendarEvent): boolean {
  if (event.presales_report_status !== 'processing') {
    return false;
  }
  
  // If it has a URL, it's not stale
  if (event.presales_report_url) {
    return false;
  }
  
  // Check if created_at is more than 15 minutes ago
  if (!event.created_at) {
    return false;
  }
  
  const createdTime = new Date(event.created_at).getTime();
  const now = new Date().getTime();
  const fifteenMinutesMs = 15 * 60 * 1000;
  
  return (now - createdTime) > fifteenMinutesMs;
}

// Helper function to check if slides are stale (processing > 15 minutes)
function areSlidesStale(event: CalendarEvent): boolean {
  if (event.slides_status !== 'processing') {
    return false;
  }
  
  // If it has a URL, it's not stale
  if (event.slides_url) {
    return false;
  }
  
  // Check if created_at is more than 15 minutes ago
  if (!event.created_at) {
    return false;
  }
  
  const createdTime = new Date(event.created_at).getTime();
  const now = new Date().getTime();
  const fifteenMinutesMs = 15 * 60 * 1000;
  
  return (now - createdTime) > fifteenMinutesMs;
}

export default function ProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const profileId = params.id as string;
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [keywordFilter, setKeywordFilter] = useState('');
  const [showGoogleDialog, setShowGoogleDialog] = useState(false);
  const [showOutlookDialog, setShowOutlookDialog] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch(`/api/profiles/${profileId}`);
      const data = await response.json();
      setProfile(data);
      setKeywordFilter(data.keyword_filter || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch(`/api/calendar/${profileId}`);
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }, [profileId]);

  const fetchTokenStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/tokens/${profileId}`);
      const data = await response.json();
      setTokenStats(data);
    } catch (error) {
      console.error('Error fetching token stats:', error);
    }
  }, [profileId]);

  const syncCalendar = useCallback(async () => {
    if (!profile?.google_access_token && !profile?.outlook_access_token) {
      return;
    }

    setSyncing(true);
    try {
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profileId })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Calendar synced:', data);
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
    
    // Set up polling to refresh events every 10 seconds to check for status updates
    const interval = setInterval(() => {
      fetchEvents();
    }, 10000);
    
    return () => clearInterval(interval);
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

  const handleFilterUpdate = async () => {
    try {
      await fetch(`/api/profiles/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword_filter: keywordFilter })
      });
      fetchEvents();
    } catch (error) {
      console.error('Error updating filter:', error);
    }
  };

  const handleGenerateReport = async (event: CalendarEvent) => {
    try {
      const response = await fetch('/api/lindy/presales-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: profileId,
          event_id: event.id,
          event_title: event.title,
          event_description: event.description,
          attendee_email: event.attendees?.[0]
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('✅ Pre-sales report generation started! The button will turn green when ready.');
        fetchEvents(); // Refresh to show processing status
        fetchTokenStats();
      } else {
        alert(`❌ Failed to start report generation: ${data.error}`);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('❌ Error generating report. Please try again.');
    }
  };

  const handleGenerateSlides = async (event: CalendarEvent) => {
    try {
      const response = await fetch('/api/lindy/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: profileId,
          event_id: event.id,
          event_title: event.title,
          event_description: event.description,
          attendee_email: event.attendees?.[0]
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('✅ Slides generation started! The button will turn green when ready.');
        fetchEvents(); // Refresh to show processing status
        fetchTokenStats();
      } else {
        alert(`❌ Failed to start slides generation: ${data.error}`);
      }
    } catch (error) {
      console.error('Error generating slides:', error);
      alert('❌ Error generating slides. Please try again.');
    }
  };

  const handleDownloadPDF = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDownloadSlides = (url: string) => {
    window.open(url, '_blank');
  };

  const handleGoogleAuthConfirm = () => {
    window.location.href = `/api/auth/google?profile_id=${profileId}`;
  };

  const handleOutlookAuthConfirm = () => {
    window.location.href = `/api/auth/outlook?profile_id=${profileId}`;
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  const filteredEvents = keywordFilter
    ? events.filter(e => e.title.toLowerCase().includes(keywordFilter.toLowerCase()))
    : events;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>
          <p className="text-slate-600 dark:text-slate-400">{profile.email}</p>
        </div>

        {/* Token Stats */}
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
                <CardTitle className="text-sm font-medium">Pre-sales Reports</CardTitle>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Overview */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
                <CardDescription>Manage authentication and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* User Info */}
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{profile.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{profile.email}</p>
                </div>
                {profile.title && (
                  <div>
                    <Label className="text-sm font-medium">Title</Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{profile.title}</p>
                  </div>
                )}

                {/* Authentication */}
                <div className="space-y-3 pt-4 border-t">
                  <Label className="text-sm font-medium">Calendar Authentication</Label>
                  <Button 
                    onClick={() => setShowGoogleDialog(true)}
                    variant={profile.google_access_token ? "default" : "outline"}
                    className="w-full justify-start gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {profile.google_access_token ? 'Google Connected' : 'Connect Google'}
                  </Button>
                  <Button 
                    onClick={() => setShowOutlookDialog(true)}
                    variant={profile.outlook_access_token ? "default" : "outline"}
                    className="w-full justify-start gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {profile.outlook_access_token ? 'Outlook Connected' : 'Connect Outlook'}
                  </Button>
                  
                  {/* Manual Sync Button */}
                  {(profile.google_access_token || profile.outlook_access_token) && (
                    <Button 
                      onClick={syncCalendar}
                      disabled={syncing}
                      variant="outline"
                      className="w-full justify-start gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                      {syncing ? 'Syncing...' : 'Sync Calendar Now'}
                    </Button>
                  )}
                  
                  {(profile.google_access_token || profile.outlook_access_token) && (
                    <p className="text-xs text-slate-500 pt-2">
                      Calendar automatically syncs when you visit this page. Use the button above to sync manually.
                    </p>
                  )}
                </div>

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
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Example Pitch Decks
                    </Label>
                    <p className="text-xs text-slate-500 mb-2">
                      (This is your company pitch deck or an example pitch deck to use as a template for building a new pitch deck.)
                    </p>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Template
                    </Button>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Company Information
                    </Label>
                    <p className="text-xs text-slate-500 mb-2">
                      Your company information to use when building the Pre-sales Report and Pitch Deck
                    </p>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Info
                    </Button>
                  </div>
                </div>
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
                    ? 'Automatically synced with your calendar'
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
                    {filteredEvents.map((event) => {
                      const reportStatus = event.presales_report_status || 'pending';
                      const slidesStatus = event.slides_status || 'pending';
                      const reportIsStale = isReportStale(event);
                      const slidesAreStale = areSlidesStale(event);
                      
                      return (
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
                            <div className="flex gap-2">
                              {/* Pre-sales Report Button */}
                              {reportStatus === 'completed' && event.presales_report_url ? (
                                <Button 
                                  onClick={() => handleDownloadPDF(event.presales_report_url!)}
                                  variant="default"
                                  size="sm"
                                  className="gap-2 bg-green-600 hover:bg-green-700"
                                >
                                  <Download className="w-4 h-4" />
                                  Download PDF Report
                                </Button>
                              ) : reportStatus === 'processing' && !reportIsStale ? (
                                <Button 
                                  disabled
                                  variant="default"
                                  size="sm"
                                  className="gap-2"
                                >
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Generating Report...
                                </Button>
                              ) : reportStatus === 'failed' || reportIsStale ? (
                                <Button 
                                  onClick={() => handleGenerateReport(event)}
                                  variant="destructive"
                                  size="sm"
                                  className="gap-2"
                                >
                                  <FileText className="w-4 h-4" />
                                  {reportIsStale ? 'Try again' : 'Retry Report'}
                                </Button>
                              ) : (
                                <Button 
                                  onClick={() => handleGenerateReport(event)}
                                  variant="default"
                                  size="sm"
                                  className="gap-2"
                                >
                                  <FileText className="w-4 h-4" />
                                  PDF Pre-sales Report
                                </Button>
                              )}
                              
                              {/* Create Slides Button */}
                              {slidesStatus === 'completed' && event.slides_url ? (
                                <Button 
                                  onClick={() => handleDownloadSlides(event.slides_url!)}
                                  variant="outline"
                                  size="sm"
                                  className="gap-2 border-green-600 text-green-600 hover:bg-green-50"
                                >
                                  <Download className="w-4 h-4" />
                                  Download Slides
                                </Button>
                              ) : slidesStatus === 'processing' && !slidesAreStale ? (
                                <Button 
                                  disabled
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                >
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Creating Slides...
                                </Button>
                              ) : slidesStatus === 'failed' || slidesAreStale ? (
                                <Button 
                                  onClick={() => handleGenerateSlides(event)}
                                  variant="destructive"
                                  size="sm"
                                  className="gap-2"
                                >
                                  <Presentation className="w-4 h-4" />
                                  {slidesAreStale ? 'Try again' : 'Retry Slides'}
                                </Button>
                              ) : (
                                <Button 
                                  onClick={() => handleGenerateSlides(event)}
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                >
                                  <Presentation className="w-4 h-4" />
                                  Create Slides
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
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
