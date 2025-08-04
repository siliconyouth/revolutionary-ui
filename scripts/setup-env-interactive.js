#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Communication files
const QUESTION_FILE = path.join(process.cwd(), '.env-setup-question.tmp');
const ANSWER_FILE = path.join(process.cwd(), '.env-setup-answer.tmp');
const STATUS_FILE = path.join(process.cwd(), '.env-setup-status.tmp');
const LOG_FILE = path.join(process.cwd(), '.env-setup-log.tmp');

// Clean up any existing files
[QUESTION_FILE, ANSWER_FILE, STATUS_FILE, LOG_FILE].forEach(file => {
  if (fs.existsSync(file)) fs.unlinkSync(file);
});

// Start the setup script in background
const setupProcess = spawn('node', [path.join(__dirname, 'setup-environment-complete.js')], {
  stdio: ['pipe', 'pipe', 'pipe'],
  detached: false
});

let currentQuestion = '';
let buffer = '';

// Write initial status
fs.writeFileSync(STATUS_FILE, JSON.stringify({ status: 'running', pid: setupProcess.pid }));

// Handle stdout
setupProcess.stdout.on('data', (data) => {
  const text = data.toString();
  buffer += text;
  fs.appendFileSync(LOG_FILE, text);
  
  // Check if we have a question
  if (buffer.includes('Enter value') || buffer.includes('[Y/n]') || buffer.includes('[y/N]')) {
    currentQuestion = buffer;
    fs.writeFileSync(QUESTION_FILE, JSON.stringify({
      question: currentQuestion,
      timestamp: Date.now()
    }));
    buffer = '';
  }
});

// Handle stderr
setupProcess.stderr.on('data', (data) => {
  fs.appendFileSync(LOG_FILE, `ERROR: ${data.toString()}`);
});

// Check for answers
const checkForAnswer = setInterval(() => {
  if (fs.existsSync(ANSWER_FILE)) {
    try {
      const answer = fs.readFileSync(ANSWER_FILE, 'utf8');
      fs.unlinkSync(ANSWER_FILE);
      
      // Send answer to the process
      setupProcess.stdin.write(answer + '\n');
      
      // Clear the question
      if (fs.existsSync(QUESTION_FILE)) {
        fs.unlinkSync(QUESTION_FILE);
      }
    } catch (error) {
      console.error('Error reading answer:', error);
    }
  }
}, 100);

// Handle process exit
setupProcess.on('exit', (code) => {
  clearInterval(checkForAnswer);
  fs.writeFileSync(STATUS_FILE, JSON.stringify({ 
    status: 'completed', 
    code,
    timestamp: Date.now()
  }));
  
  // Clean up temp files after a delay
  setTimeout(() => {
    [QUESTION_FILE, ANSWER_FILE, STATUS_FILE, LOG_FILE].forEach(file => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });
  }, 5000);
});

console.log('Setup process started in background.');
console.log('Process ID:', setupProcess.pid);
console.log('Monitor files:');
console.log('  Question:', QUESTION_FILE);
console.log('  Answer:', ANSWER_FILE);
console.log('  Status:', STATUS_FILE);
console.log('  Log:', LOG_FILE);