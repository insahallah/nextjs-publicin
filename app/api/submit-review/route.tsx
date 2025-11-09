import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('📦 Received from frontend:', body);
    
    const phpUrl = 'https://allupipay.in/publicsewa/api/users/submit_review.php';
    console.log('🚀 Calling PHP API:', phpUrl);
    
    const phpResponse = await fetch(phpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    console.log('📡 PHP Response status:', phpResponse.status);
    console.log('📡 PHP Response headers:', Object.fromEntries(phpResponse.headers.entries()));
    
    // Get the raw response text
    const responseText = await phpResponse.text();
    console.log('📄 PHP Raw response:', responseText);
    
    let data = {};
    if (responseText && responseText.trim() !== '') {
      try {
        data = JSON.parse(responseText);
        console.log('✅ PHP Parsed data:', data);
      } catch (parseError) {
        console.error('❌ PHP JSON parse error:', parseError);
        console.error('📄 PHP Response content (first 500 chars):', responseText.substring(0, 500));
        data = { 
          error: 'Invalid JSON response from PHP API',
          rawResponse: responseText.substring(0, 500)
        };
      }
    } else {
      console.log('ℹ️ PHP returned empty response');
      data = { error: 'Empty response from PHP API' };
    }
    
    return NextResponse.json(data, { status: phpResponse.status });
    
  } catch (error) {
    console.error('❌ API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to submit review',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}