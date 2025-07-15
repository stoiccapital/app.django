const fs = require('fs')
const path = require('path')

// Function to read .env.local file
function loadEnvFile() {
    const envPath = path.join(__dirname, '..', '.env.local')
    
    if (!fs.existsSync(envPath)) {
        console.error('Error: .env.local file not found')
        console.error('Please create a .env.local file in the root directory with your Supabase credentials')
        process.exit(1)
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8')
    const envVars = {}
    
    envContent.split('\n').forEach(line => {
        const trimmedLine = line.trim()
        if (trimmedLine && !trimmedLine.startsWith('#')) {
            const [key, ...valueParts] = trimmedLine.split('=')
            if (key && valueParts.length > 0) {
                envVars[key.trim()] = valueParts.join('=').trim()
            }
        }
    })
    
    return envVars
}

// Load environment variables from .env.local
const envVars = loadEnvFile()
const supabaseUrl = envVars.SUPABASE_URL
const supabaseAnonKey = envVars.SUPABASE_ANON_KEY

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Missing required environment variables in .env.local:')
    if (!supabaseUrl) console.error('- SUPABASE_URL')
    if (!supabaseAnonKey) console.error('- SUPABASE_ANON_KEY')
    console.error('\nPlease check your .env.local file and ensure all required variables are set.')
    process.exit(1)
}

// Generate the config.js content
const configContent = `window.env = {
  SUPABASE_URL: '${supabaseUrl}',
  SUPABASE_ANON_KEY: '${supabaseAnonKey}'
};`

// Ensure the login directory exists
const loginDir = path.join(__dirname, '..', 'login')
if (!fs.existsSync(loginDir)) {
    fs.mkdirSync(loginDir, { recursive: true })
}

// Write the config file
const configPath = path.join(loginDir, 'config.js')
fs.writeFileSync(configPath, configContent)

console.log('✅ Generated login/config.js with environment variables')
console.log(`📁 Config file location: ${configPath}`)

// Validate the generated file
try {
    const generatedContent = fs.readFileSync(configPath, 'utf8')
    if (generatedContent.includes(supabaseUrl) && generatedContent.includes(supabaseAnonKey)) {
        console.log('✅ Config file validation passed')
    } else {
        console.error('❌ Config file validation failed')
        process.exit(1)
    }
} catch (error) {
    console.error('❌ Error validating generated config file:', error.message)
    process.exit(1)
} 