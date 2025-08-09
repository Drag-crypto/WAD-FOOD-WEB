const supabaseUrl = 'https://rvlealemvurgmpflajbn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bGVhbGVtdnVyZ21wZmxhamJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjEwMDEsImV4cCI6MjA3MDEzNzAwMX0.TPmel2qGoG5R_hnFAB_pF9ZQob5wMkBhJVPbcqs9q8M';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

let accessToken = null;

// Check token on page load
document.addEventListener('DOMContentLoaded', async () => {
  const invalidMsg = document.getElementById('invalidTokenMessage');
  const resetForm = document.getElementById('resetForm');
  
  try {
    const hash = window.location.hash;
    if (!hash.includes('type=recovery')) throw new Error('Invalid link type');
    
    const params = new URLSearchParams(hash.substring(1));
    accessToken = params.get('access_token');
    if (!accessToken) throw new Error('Missing token');

    // Verify the token
    const { error } = await supabaseClient.auth.verifyOtp({
      token: accessToken,
      type: 'recovery'
    });
    
    if (error) throw error;
    
    // Show form if valid
    resetForm.style.display = 'block';
    
  } catch (error) {
    console.error('Token verification failed:', error);
    invalidMsg.style.display = 'block';
    setTimeout(() => {
      window.location.href = 'forgot-email.html';
    }, 3000);
  }
});

async function updatePassword() {
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const statusEl = document.getElementById("resetStatus");

  if (newPassword !== confirmPassword) {
    statusEl.textContent = "Passwords don't match!";
    return;
  }

  if (newPassword.length < 6) {
    statusEl.textContent = "Password must be 6+ characters";
    return;
  }

  statusEl.textContent = "Updating password...";

  try {
    // Recover session with the token
    const { data, error: sessionError } = await supabaseClient.auth.setSession({
      access_token: accessToken,
      refresh_token: ''
    });
    
    if (sessionError) throw sessionError;

    // Update password
    const { error: updateError } = await supabaseClient.auth.updateUser({
      password: newPassword
    });

    if (updateError) throw updateError;

    statusEl.textContent = "✓ Password updated! Redirecting...";
    setTimeout(() => window.location.href = "login-email.html", 1500);
  } catch (error) {
    statusEl.textContent = error.message;
  }
}

// Allow pressing Enter in password fields
document.getElementById("confirmPassword").addEventListener('keypress', (e) => {
  if (e.key === 'Enter') updatePassword();
});
