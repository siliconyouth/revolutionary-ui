#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const inquirer = require('inquirer')

console.log(chalk.cyan('\n🔐 Revolutionary UI Authentication Setup\n'))

async function setupAuth() {
  // Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local')
  let envContent = ''
  
  try {
    envContent = fs.readFileSync(envPath, 'utf-8')
  } catch {
    console.log(chalk.yellow('No .env.local file found. Creating one...'))
  }
  
  // Check for existing Supabase config
  const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL')
  const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  
  if (hasSupabaseUrl && hasSupabaseKey) {
    console.log(chalk.green('✓ Supabase configuration already exists'))
    
    const { reconfigure } = await inquirer.prompt([{
      type: 'confirm',
      name: 'reconfigure',
      message: 'Do you want to reconfigure authentication?',
      default: false
    }])
    
    if (!reconfigure) {
      console.log(chalk.gray('\nAuthentication is ready to use!'))
      return
    }
  }
  
  console.log(chalk.cyan('To enable real authentication, you need a Supabase project.\n'))
  console.log('1. Go to https://supabase.com and create a free project')
  console.log('2. In your project settings, find your URL and anon key')
  console.log('3. Enter them below:\n')
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'supabaseUrl',
      message: 'Supabase URL:',
      validate: (value) => {
        if (!value) return 'URL is required'
        if (!value.includes('supabase.co')) return 'Invalid Supabase URL'
        return true
      }
    },
    {
      type: 'input',
      name: 'supabaseKey',
      message: 'Supabase Anon Key:',
      validate: (value) => {
        if (!value) return 'Key is required'
        if (value.length < 20) return 'Invalid key'
        return true
      }
    }
  ])
  
  // Update .env.local
  let newEnvContent = envContent
  
  if (hasSupabaseUrl) {
    newEnvContent = newEnvContent.replace(
      /NEXT_PUBLIC_SUPABASE_URL=.*/,
      `NEXT_PUBLIC_SUPABASE_URL=${answers.supabaseUrl}`
    )
  } else {
    newEnvContent += `\n# Supabase Configuration\nNEXT_PUBLIC_SUPABASE_URL=${answers.supabaseUrl}\n`
  }
  
  if (hasSupabaseKey) {
    newEnvContent = newEnvContent.replace(
      /NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/,
      `NEXT_PUBLIC_SUPABASE_ANON_KEY=${answers.supabaseKey}`
    )
  } else {
    newEnvContent += `NEXT_PUBLIC_SUPABASE_ANON_KEY=${answers.supabaseKey}\n`
  }
  
  fs.writeFileSync(envPath, newEnvContent)
  
  console.log(chalk.green('\n✓ Authentication configured successfully!'))
  console.log(chalk.gray('\nNote: Make sure your Supabase project has:'))
  console.log(chalk.gray('  • Email authentication enabled'))
  console.log(chalk.gray('  • A "users" table with columns: id, email, full_name, company, plan'))
  console.log(chalk.gray('\nYou can now use real authentication in Revolutionary UI!'))
}

setupAuth().catch(console.error)