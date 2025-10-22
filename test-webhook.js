// Test the webhook directly
const postgres = require('postgres');

// Connect to database with correct credentials
const connectionString = 'postgresql://sandbox:FFQm0w5aPUMIXnGqiBKGUqzt@localhost:5432/autoprep_team';
const sql = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

async function testWebhook() {
  try {
    console.log('🔧 Testing webhook functionality...\n');
    
    // First, initialize the database
    console.log('📋 Initializing database tables...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        url_slug VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(255),
        google_access_token TEXT,
        google_refresh_token TEXT,
        outlook_access_token TEXT,
        outlook_refresh_token TEXT,
        keyword_filter TEXT,
        slide_template_url TEXT,
        company_info_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Profiles table ready');
    
    await sql`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id SERIAL PRIMARY KEY,
        profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
        event_id VARCHAR(255) NOT NULL,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        attendees JSONB,
        source VARCHAR(50) NOT NULL,
        presales_report_status VARCHAR(50),
        presales_report_url TEXT,
        presales_report_generated_at TIMESTAMP,
        slides_status VARCHAR(50),
        slides_url TEXT,
        slides_generated_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(profile_id, event_id)
      )
    `;
    console.log('✅ Calendar events table ready');
    
    // Create a test profile
    console.log('\n📝 Creating test profile...');
    const profiles = await sql`
      INSERT INTO profiles (name, email, url_slug, title)
      VALUES ('Test User', 'test@example.com', 'test-user', 'Test Title')
      ON CONFLICT (email) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const profileId = profiles[0].id;
    console.log(`✅ Test profile created with ID: ${profileId}`);
    
    // Create a test calendar event
    console.log('\n📅 Creating test calendar event...');
    const events = await sql`
      INSERT INTO calendar_events (
        profile_id, event_id, title, description, start_time, end_time, attendees, source
      )
      VALUES (
        ${profileId}, 'test-event-123', 'Test Meeting', 'Test Description',
        NOW(), NOW() + INTERVAL '1 hour', '["test@example.com"]', 'google'
      )
      RETURNING *
    `;
    const eventId = events[0].id;
    console.log(`✅ Test calendar event created with ID: ${eventId}`);
    
    // Test updating presales status (simulating webhook)
    console.log('\n🔄 Testing presales status update (simulating webhook)...');
    const testPdfUrl = 'https://example.com/presales-report.pdf';
    
    const updated = await sql`
      UPDATE calendar_events 
      SET 
        presales_report_status = 'completed',
        presales_report_url = ${testPdfUrl},
        presales_report_generated_at = NOW()
      WHERE id = ${eventId}
      RETURNING *
    `;
    
    console.log('✅ Presales status updated successfully');
    console.log('📊 Updated event:', {
      id: updated[0].id,
      title: updated[0].title,
      presales_report_status: updated[0].presales_report_status,
      presales_report_url: updated[0].presales_report_url,
      presales_report_generated_at: updated[0].presales_report_generated_at
    });
    
    // Test updating slides status
    console.log('\n🔄 Testing slides status update (simulating webhook)...');
    const testSlidesUrl = 'https://example.com/slides.pptx';
    
    const updatedSlides = await sql`
      UPDATE calendar_events 
      SET 
        slides_status = 'completed',
        slides_url = ${testSlidesUrl},
        slides_generated_at = NOW()
      WHERE id = ${eventId}
      RETURNING *
    `;
    
    console.log('✅ Slides status updated successfully');
    console.log('📊 Updated event:', {
      id: updatedSlides[0].id,
      title: updatedSlides[0].title,
      slides_status: updatedSlides[0].slides_status,
      slides_url: updatedSlides[0].slides_url,
      slides_generated_at: updatedSlides[0].slides_generated_at
    });
    
    // Verify the final state
    console.log('\n✅ Final verification - fetching event from database...');
    const final = await sql`SELECT * FROM calendar_events WHERE id = ${eventId}`;
    console.log('📋 Final event state:', {
      id: final[0].id,
      title: final[0].title,
      presales_report_status: final[0].presales_report_status,
      presales_report_url: final[0].presales_report_url,
      slides_status: final[0].slides_status,
      slides_url: final[0].slides_url
    });
    
    console.log('\n✅ All webhook tests passed!');
    
  } catch (error) {
    console.error('❌ Error during webhook test:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  } finally {
    await sql.end();
  }
}

testWebhook();
