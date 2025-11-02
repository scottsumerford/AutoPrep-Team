-- Add columns to track PDF report generation status and download URL
ALTER TABLE calendar_events 
ADD COLUMN IF NOT EXISTS presales_report_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS presales_report_url TEXT,
ADD COLUMN IF NOT EXISTS presales_report_generated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS slides_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS slides_url TEXT,
ADD COLUMN IF NOT EXISTS slides_generated_at TIMESTAMP;

-- Status values: 'pending', 'processing', 'completed', 'failed'
COMMENT ON COLUMN calendar_events.presales_report_status IS 'Status of PDF pre-sales report generation: pending, processing, completed, failed';
COMMENT ON COLUMN calendar_events.presales_report_url IS 'Download URL for the generated PDF pre-sales report';
COMMENT ON COLUMN calendar_events.slides_status IS 'Status of slides generation: pending, processing, completed, failed';
COMMENT ON COLUMN calendar_events.slides_url IS 'Download URL for the generated slides';
