// Lindy Agent Integration
const LINDY_API_BASE = 'https://api.lindy.ai/v1';

export const LINDY_AGENTS = {
  PRESALES_REPORT: '68aa4cb7ebbc5f9222a2696e',
  SLIDES_GENERATION: '68ed392b02927e7ace232732'
};

export interface LindyAgentRequest {
  agent_id: string;
  input: {
    calendar_event_id?: number;
    event_title?: string;
    event_description?: string;
    attendee_email?: string;
    attendees?: string[];
    start_time?: string;
    end_time?: string;
    company_info?: string;
    slide_template?: string;
    [key: string]: unknown;
  };
}

export interface LindyAgentResponse {
  success: boolean;
  output?: unknown;
  tokens_used?: number;
  error?: string;
  pdf_url?: string;
  slides_url?: string;
}

/**
 * Call a Lindy agent with the provided input
 */
export async function callLindyAgent(
  agentId: string,
  input: Record<string, unknown>,
  apiKey?: string
): Promise<LindyAgentResponse> {
  try {
    // Note: In production, the API key should be stored in environment variables
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(`${LINDY_API_BASE}/agents/${agentId}/invoke`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ input })
    });

    if (!response.ok) {
      throw new Error(`Lindy API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      output: data.output,
      tokens_used: data.tokens_used || 0,
      pdf_url: data.pdf_url,
      slides_url: data.slides_url
    };
  } catch (error) {
    console.error('Error calling Lindy agent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generate a pre-sales report for a calendar event
 */
export async function generatePresalesReport(params: {
  calendarEventId: number;
  eventTitle: string;
  eventDescription?: string;
  attendeeEmail: string;
  companyInfo?: string;
  apiKey?: string;
}): Promise<LindyAgentResponse> {
  return callLindyAgent(
    LINDY_AGENTS.PRESALES_REPORT,
    {
      calendar_event_id: params.calendarEventId,
      event_title: params.eventTitle,
      event_description: params.eventDescription,
      attendee_email: params.attendeeEmail,
      company_info: params.companyInfo
    },
    params.apiKey
  );
}

/**
 * Generate slides for a calendar event
 */
export async function generateSlides(params: {
  calendarEventId: number;
  eventTitle: string;
  eventDescription?: string;
  attendeeEmail: string;
  slideTemplate?: string;
  companyInfo?: string;
  apiKey?: string;
}): Promise<LindyAgentResponse> {
  return callLindyAgent(
    LINDY_AGENTS.SLIDES_GENERATION,
    {
      calendar_event_id: params.calendarEventId,
      event_title: params.eventTitle,
      event_description: params.eventDescription,
      attendee_email: params.attendeeEmail,
      slide_template: params.slideTemplate,
      company_info: params.companyInfo
    },
    params.apiKey
  );
}
