#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function testSupabase() {
  console.log('🔍 Testing Supabase Connection\n');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }

  console.log(`📍 Supabase URL: ${url}`);
  console.log(`🔑 Anon Key: ${anonKey.substring(0, 20)}...`);
  console.log(`🔐 Service Key: ${serviceKey ? serviceKey.substring(0, 20) + '...' : 'Not set'}\n`);

  try {
    // Test with anon key
    console.log('Testing with anon key...');
    const supabase = createClient(url, anonKey);
    
    // Test auth
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error('❌ Auth test failed:', authError.message);
    } else {
      console.log('✅ Auth test passed');
      console.log('   Session:', authData.session ? 'Active' : 'None');
    }

    // Test database connection
    console.log('\nTesting database connection...');
    const { data: tables, error: dbError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    if (dbError) {
      console.error('❌ Database test failed:', dbError.message);
      console.error('   Details:', dbError);
    } else {
      console.log('✅ Database connection successful');
    }

    // List tables (with service role key if available)
    if (serviceKey) {
      console.log('\nTesting with service role key...');
      const supabaseAdmin = createClient(url, serviceKey);
      
      // Test if tables exist by querying them
      const tables = ['profiles', 'ai_providers', 'user_subscriptions', 'ai_usage', 'generated_components'];
      console.log('Checking tables...');
      
      for (const table of tables) {
        try {
          const { error } = await supabaseAdmin
            .from(table)
            .select('count', { count: 'exact', head: true });
          
          if (error) {
            console.log(`   ❌ ${table}: ${error.message}`);
          } else {
            console.log(`   ✅ ${table}: exists`);
          }
        } catch (e) {
          console.log(`   ❌ ${table}: ${e.message}`);
        }
      }
    }

    console.log('\n✅ Supabase connection test completed successfully!');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testSupabase();