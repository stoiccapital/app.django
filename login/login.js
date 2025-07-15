// Login functionality
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for auth manager to be available
    while (!window.authManager) {
        await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Check if user is already logged in
    const isGuest = await window.authManager.requireGuest()
    
    if (!isGuest) {
        // User will be redirected to dashboard by requireGuest()
        return
    }

    // User is not logged in, setup login form
    setupLoginForm()
})

// Setup login form functionality
function setupLoginForm() {
    // DOM elements
    const loginForm = document.getElementById('loginForm')
    const emailInput = document.getElementById('email')
    const passwordInput = document.getElementById('password')
    const errorMessage = document.getElementById('errorMessage')
    const forgotPasswordLink = document.getElementById('forgotPassword')

    // Validation functions
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    function validatePassword(password) {
        return password.length >= 6
    }

    function showError(message) {
        errorMessage.textContent = message
        errorMessage.style.display = 'block'
    }

    function clearError() {
        errorMessage.textContent = ''
        errorMessage.style.display = 'none'
    }

    // Handle form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        
        const email = emailInput.value.trim()
        const password = passwordInput.value
        
        // Clear previous errors
        clearError()
        
        // Validate inputs
        if (!email) {
            showError('Please enter your email address')
            emailInput.focus()
            return
        }
        
        if (!validateEmail(email)) {
            showError('Please enter a valid email address')
            emailInput.focus()
            return
        }
        
        if (!password) {
            showError('Please enter your password')
            passwordInput.focus()
            return
        }
        
        if (!validatePassword(password)) {
            showError('Password must be at least 6 characters long')
            passwordInput.focus()
            return
        }
        
        // Disable form during submission
        const submitButton = loginForm.querySelector('button[type="submit"]')
        const originalText = submitButton.textContent
        submitButton.disabled = true
        submitButton.textContent = 'Signing in...'
        
        try {
            // Use auth manager to sign in
            const { data, error } = await window.authManager.supabase.auth.signInWithPassword({
                email: email,
                password: password
            })
            
            if (error) {
                throw error
            }
            
            // Success - redirect to dashboard
            window.authManager.redirectToDashboard()
            
        } catch (error) {
            console.error('Login error:', error)
            
            // Handle specific error types
            let errorMsg = 'An error occurred during sign in. Please try again.'
            
            if (error.message) {
                if (error.message.includes('Invalid login credentials')) {
                    errorMsg = 'Invalid email or password. Please check your credentials and try again.'
                } else if (error.message.includes('Email not confirmed')) {
                    errorMsg = 'Please check your email and confirm your account before signing in.'
                } else if (error.message.includes('Too many requests')) {
                    errorMsg = 'Too many login attempts. Please wait a moment before trying again.'
                } else {
                    errorMsg = error.message
                }
            }
            
            showError(errorMsg)
            
        } finally {
            // Re-enable form
            submitButton.disabled = false
            submitButton.textContent = originalText
        }
    })

    // Handle forgot password
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault()
        
        const email = emailInput.value.trim()
        
        if (!email || !validateEmail(email)) {
            showError('Please enter a valid email address to reset your password')
            emailInput.focus()
            return
        }
        
        // TODO: Implement password reset functionality
        alert('Password reset functionality would be implemented here.')
    })

    // Clear error when user starts typing
    emailInput.addEventListener('input', clearError)
    passwordInput.addEventListener('input', clearError)

    // Focus management
    emailInput.focus()
} 