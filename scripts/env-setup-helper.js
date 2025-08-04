#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const QUESTION_FILE = path.join(process.cwd(), '.env-setup-question.tmp');
const ANSWER_FILE = path.join(process.cwd(), '.env-setup-answer.tmp');
const STATUS_FILE = path.join(process.cwd(), '.env-setup-status.tmp');
const LOG_FILE = path.join(process.cwd(), '.env-setup-log.tmp');

const command = process.argv[2];
const value = process.argv.slice(3).join(' ');

switch (command) {
  case 'status':
    if (fs.existsSync(STATUS_FILE)) {
      const status = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
      console.log('Status:', status.status);
      if (status.pid) console.log('Process ID:', status.pid);
      if (status.code !== undefined) console.log('Exit code:', status.code);
    } else {
      console.log('No setup process running');
    }
    break;
    
  case 'question':
    if (fs.existsSync(QUESTION_FILE)) {
      const { question } = JSON.parse(fs.readFileSync(QUESTION_FILE, 'utf8'));
      console.log('\n=== Current Question ===');
      console.log(question);
    } else {
      console.log('No pending question');
    }
    break;
    
  case 'answer':
    if (!value) {
      console.log('Usage: node env-setup-helper.js answer <your-answer>');
      break;
    }
    fs.writeFileSync(ANSWER_FILE, value);
    console.log('Answer sent:', value);
    break;
    
  case 'log':
    if (fs.existsSync(LOG_FILE)) {
      const log = fs.readFileSync(LOG_FILE, 'utf8');
      console.log('\n=== Setup Log ===');
      console.log(log);
    } else {
      console.log('No log file found');
    }
    break;
    
  case 'tail':
    if (fs.existsSync(LOG_FILE)) {
      const log = fs.readFileSync(LOG_FILE, 'utf8');
      const lines = log.split('\n');
      const lastLines = lines.slice(-20).join('\n');
      console.log('\n=== Last 20 lines ===');
      console.log(lastLines);
    }
    break;
    
  default:
    console.log('Usage:');
    console.log('  node env-setup-helper.js status    - Check process status');
    console.log('  node env-setup-helper.js question  - Get current question');
    console.log('  node env-setup-helper.js answer <value> - Send answer');
    console.log('  node env-setup-helper.js log       - Show full log');
    console.log('  node env-setup-helper.js tail      - Show last 20 lines');
}