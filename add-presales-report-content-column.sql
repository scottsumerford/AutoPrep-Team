-- Add presales_report_content column to store the text content of the report
ALTER TABLE calendar_events 
ADD COLUMN IF NOT EXISTS presales_report_content TEXT;

COMMENT ON COLUMN calendar_events.presales_report_content IS 'Text content of the pre-sales report for reference and search';
