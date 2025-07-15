// Dashboard functionality
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for auth manager to be available
    while (!window.authManager) {
        await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Check if user is authenticated
    const isAuthenticated = await window.authManager.requireAuth()
    
    if (!isAuthenticated) {
        // User will be redirected to login by requireAuth()
        return
    }

    // User is authenticated, show dashboard content
    displayUserInfo()
    setupLogoutButton()
})

// Display user information
function displayUserInfo() {
    const userInfoElement = document.getElementById('userInfo')
    const user = window.authManager.getCurrentUser()
    
    if (user) {
        userInfoElement.innerHTML = `
            <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>Email:</strong> ${user.email}<br>
                <strong>User ID:</strong> ${user.id}<br>
                <strong>Last Sign In:</strong> ${new Date(user.last_sign_in_at).toLocaleString()}
            </p>
        `
    } else {
        userInfoElement.innerHTML = `
            <p style="margin: 0; font-size: 14px; color: #666;">
                User information not available
            </p>
        `
    }
}

// Setup logout button
function setupLogoutButton() {
    const logoutButton = document.getElementById('logoutButton')
    
    logoutButton.addEventListener('click', async () => {
        // Disable button during logout
        logoutButton.disabled = true
        logoutButton.textContent = 'Signing out...'
        
        try {
            await window.authManager.signOut()
            // User will be redirected to login by signOut()
        } catch (error) {
            console.error('Logout error:', error)
            // Re-enable button on error
            logoutButton.disabled = false
            logoutButton.textContent = 'Sign Out'
        }
    })
} 