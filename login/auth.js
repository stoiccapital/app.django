import { createClient } from 'https://esm.sh/@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = window.env.SUPABASE_URL
const supabaseAnonKey = window.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase configuration is missing. Please check your config.js file.')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Authentication state management
class AuthManager {
    constructor() {
        this.user = null
        this.session = null
        this.isInitialized = false
    }

    // Initialize auth state
    async init() {
        try {
            // Get current session
            const { data: { session }, error } = await supabase.auth.getSession()
            
            if (error) {
                console.error('Error getting session:', error)
                return false
            }

            this.session = session
            this.user = session?.user || null
            this.isInitialized = true

            // Listen for auth changes
            supabase.auth.onAuthStateChange((event, session) => {
                this.session = session
                this.user = session?.user || null
                
                if (event === 'SIGNED_OUT') {
                    this.redirectToLogin()
                }
            })

            return true
        } catch (error) {
            console.error('Auth initialization error:', error)
            return false
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.user !== null && this.session !== null
    }

    // Get current user
    getCurrentUser() {
        return this.user
    }

    // Get current session
    getCurrentSession() {
        return this.session
    }

    // Redirect to login page
    redirectToLogin() {
        window.location.href = '/login/login.html'
    }

    // Redirect to dashboard
    redirectToDashboard() {
        window.location.href = '/index.html'
    }

    // Sign out user
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) {
                console.error('Sign out error:', error)
                return false
            }
            this.redirectToLogin()
            return true
        } catch (error) {
            console.error('Sign out error:', error)
            return false
        }
    }

    // Require authentication (redirect if not logged in)
    async requireAuth() {
        if (!this.isInitialized) {
            await this.init()
        }
        
        if (!this.isAuthenticated()) {
            this.redirectToLogin()
            return false
        }
        
        return true
    }

    // Require guest (redirect if logged in)
    async requireGuest() {
        if (!this.isInitialized) {
            await this.init()
        }
        
        if (this.isAuthenticated()) {
            this.redirectToDashboard()
            return false
        }
        
        return true
    }
}

// Create global auth manager instance
window.authManager = new AuthManager()

// Expose supabase client for other modules
window.authManager.supabase = supabase

// Initialize auth when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    await window.authManager.init()
}) 