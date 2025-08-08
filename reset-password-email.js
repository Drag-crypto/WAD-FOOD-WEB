// Initialize Supabase (USE YOUR CREDENTIALS)
const supabaseUrl = 'https://rvlealemvurgmpflajbn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bGVhbGVtdnVyZ21wZmxhamJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjEwMDEsImV4cCI6MjA3MDEzNzAwMX0.TPmel2qGoG5R_hnFAB_pF9ZQob5wMkBhJVPbcqs9q8M';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Check for token when page loads
window.onload = async function() {
  const hash = window.location.hash;
  if (!hash.includes('access_token')) {
    document.getElementById('statusMessage').textContent = "Invalid reset link. Please use the link from your email.";
    document.querySelector('button').disabled = true;
  }
};

async function resetPassword() {
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const statusEl = document.getElementById('statusMessage');

  // Validation
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
    // 1. Get token from URL
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    // 2. Recover session
    const { data, error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token
    });
    if (sessionError) throw sessionError;

    // 3. Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (updateError) throw updateError;

    statusEl.textContent = "✓ Password updated! Redirecting...";
    setTimeout(() => window.location.href = "login-email.html", 1500);
  } catch (error) {
    statusEl.textContent = error.message;
    console.error(error);
  }
}

// Enter key support
document.getElementById('confirmPassword').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') resetPassword();
});
