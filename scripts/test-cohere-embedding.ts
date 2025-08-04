#!/usr/bin/env tsx

import { config } from '@dotenvx/dotenvx';
import path from 'path';

config({ path: path.join(__dirname, '../.env.local') });

async function testCohere() {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) {
    console.error('COHERE_API_KEY not found');
    return;
  }

  console.log('Testing Cohere embeddings...\n');

  try {
    const response = await fetch('https://api.cohere.ai/v1/embed', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts: ['Hello world'],
        model: 'embed-english-v3.0',
        input_type: 'search_document',
        embedding_types: ['float'],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Error ${response.status}:`, errorData);
      return;
    }

    const data = await response.json();
    console.log('Response structure:', Object.keys(data));
    
    if (data.embeddings && data.embeddings.float) {
      console.log('Embedding dimensions:', data.embeddings.float[0].length);
      console.log('First 5 values:', data.embeddings.float[0].slice(0, 5));
    }

    // Try smaller model
    console.log('\nTrying embed-english-light-v3.0...');
    const response2 = await fetch('https://api.cohere.ai/v1/embed', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts: ['Hello world'],
        model: 'embed-english-light-v3.0',
        input_type: 'search_document',
        embedding_types: ['float'],
      }),
    });

    if (response2.ok) {
      const data2 = await response2.json();
      console.log('Light model dimensions:', data2.embeddings.float[0].length);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

testCohere();