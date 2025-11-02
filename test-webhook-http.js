// Test the webhook HTTP endpoint
const http = require('http');

// Simulate a webhook payload from Lindy agent
const presalesWebhookPayload = {
  agent_id: '68aa4cb7ebbc5f9222a2696e',
  calendar_event_id: 1,
  status: 'completed',
  pdf_url: 'https://example.com/presales-report.pdf'
};

const slidesWebhookPayload = {
  agent_id: '68ed392b02927e7ace232732',
  calendar_event_id: 1,
  status: 'completed',
  slides_url: 'https://example.com/slides.pptx'
};

const failedWebhookPayload = {
  agent_id: '68aa4cb7ebbc5f9222a2696e',
  calendar_event_id: 1,
  status: 'failed',
  error_message: 'Failed to generate presales report'
};

async function testWebhookEndpoint(payload, description) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/lindy/webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    console.log(`\n🔄 Testing: ${description}`);
    console.log(`📤 Payload:`, payload);
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📥 Response Status: ${res.statusCode}`);
        console.log(`📥 Response Body:`, data);
        resolve({ status: res.statusCode, body: data });
      });
    });
    
    req.on('error', (error) => {
      console.error(`❌ Error:`, error.message);
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  try {
    console.log('🔧 Testing Webhook HTTP Endpoint\n');
    console.log('⚠️ Make sure the dev server is running on port 3000\n');
    
    // Wait a moment for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test presales webhook
    await testWebhookEndpoint(presalesWebhookPayload, 'Presales Report Completed');
    
    // Test slides webhook
    await testWebhookEndpoint(slidesWebhookPayload, 'Slides Generation Completed');
    
    // Test failed webhook
    await testWebhookEndpoint(failedWebhookPayload, 'Presales Report Failed');
    
    console.log('\n✅ All webhook HTTP tests completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

runTests();
