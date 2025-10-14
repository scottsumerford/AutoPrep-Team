'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar, FileText, Presentation, Upload, Mail, Filter } from 'lucide-react';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

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
}

interface TokenStats {
  agent_run: number;
  presales_report: number;
  slides_generation: number;
  total: number;
}

export default function ProfilePage() {
  const params = useParams();
  const profileId = params.id as string;
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [keywordFilter, setKeywordFilter] = useState('');
  const [manualEmail, setManualEmail] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchEvents();
    fetchTokenStats();
  }, [profileId]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profiles/${profileId}`);
      const data = await response.json();
      setProfile(data);
      setKeywordFilter(data.keyword_filter || '');
      setManualEmail(data.manual_email || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(`/api/calendar/${profileId}`);
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchTokenStats = async () => {
    try {
      const response = await fetch(`/api/tokens/${profileId}`);
      const data = await response.json();
      setTokenStats(data);
    } catch (error) {
      console.error('Error fetching token stats:', error);
    }
  };

  const handleOperationModeToggle = async (checked: boolean) => {
    const newMode = checked ? 'auto-sync' : 'manual';
    try {
      await fetch(`/api/profiles/${profileId}`, {
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

  const handleManualEmailUpdate = async () => {
    try {
      await fetch(`/api/profiles/${profileId}`, {
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
        alert('Pre-sales report generated successfully!');
        fetchTokenStats();
      }
    } catch (error) {
      console.error('Error generating report:', error);
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
          attendee_email: profile?.operation_mode === 'manual' ? manualEmail : event.attendees?.[0]
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Slides generated successfully!');
        fetchTokenStats();
      }
    } catch (error) {
      console.error('Error generating slides:', error);
    }
  };

  const handleGoogleAuth = () => {
    window.location.href = `/api/auth/google?profile_id=${profileId}`;
  };

  const handleOutlookAuth = () => {
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
                  <Label className="text-sm font-medium">Authentication</Label>
                  <Button 
                    onClick={handleGoogleAuth}
                    variant={profile.google_access_token ? "default" : "outline"}
                    className="w-full justify-start gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {profile.google_access_token ? 'Google Connected' : 'Connect Google'}
                  </Button>
                  <Button 
                    onClick={handleOutlookAuth}
                    variant={profile.outlook_access_token ? "default" : "outline"}
                    className="w-full justify-start gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {profile.outlook_access_token ? 'Outlook Connected' : 'Connect Outlook'}
                  </Button>
                </div>

                {/* Operation Mode */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="operation-mode" className="text-sm font-medium">
                      Auto-sync Calendar
                    </Label>
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
                    ? 'Synced with your calendar'
                    : 'Connect your calendar to see events'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Placeholder for calendar component */}
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-8 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 dark:text-slate-400">
                    Calendar view will appear here once connected
                  </p>
                </div>
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
                    No events found. Connect your calendar to see events.
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
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleGenerateReport(event)}
                              variant="default"
                              size="sm"
                              className="gap-2"
                            >
                              <FileText className="w-4 h-4" />
                              PDF Pre-sales Report
                            </Button>
                            <Button 
                              onClick={() => handleGenerateSlides(event)}
                              variant="outline"
                              size="sm"
                              className="gap-2"
                            >
                              <Presentation className="w-4 h-4" />
                              Create Slides
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
    </div>
  );
}
