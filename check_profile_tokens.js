const { sql } = require('@vercel/postgres');

async function checkProfile() {
  try {
    const result = await sql`
      SELECT id, name, email, 
             google_access_token IS NOT NULL as has_google_token,
             google_refresh_token IS NOT NULL as has_google_refresh,
             outlook_access_token IS NOT NULL as has_outlook_token
      FROM profiles 
      WHERE id = 3
    `;
    
    console.log('Profile 3 (North Texas Shutters):');
    console.log(JSON.stringify(result.rows[0], null, 2));
    
    // Also check if there are any events
    const events = await sql`
      SELECT COUNT(*) as event_count
      FROM calendar_events
      WHERE profile_id = 3
    `;
    
    console.log('\nCalendar Events:', events.rows[0].event_count);
  } catch (error) {
    console.error('Error:', error);
  }
}

checkProfile();
