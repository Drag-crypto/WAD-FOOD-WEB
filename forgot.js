const supabaseUrl = 'https://rvlealemvurgmpflajbn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bGVhbGVtdnVyZ21wZmxhamJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjEwMDEsImV4cCI6MjA3MDEzNzAwMX0.TPmel2qGoG5R_hnFAB_pF9ZQob5wMkBhJVPbcqs9q8M';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

let verificationPhone = "";
let accessToken = null;

async function sendOTP() {
  const phone = document.getElementById('phone').value;
  const cc = document.getElementById('countryCode').value;
  const fullPhone = cc + phone;
  const statusEl = document.getElementById('statusMessage');

  if (!phone) {
    statusEl.textContent = "Please enter phone number";
    return;
  }

  // Check if phone exists in system
  statusEl.textContent = "Checking phone number...";
  try {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('phone')
      .eq('phone', fullPhone)
      .single();

    if (error || !data) {
      statusEl.textContent = "Phone number not registered";
      return;
    }

    // Send OTP if phone exists
    statusEl.textContent = "Sending verification code...";
    verificationPhone = fullPhone;
    
    const { error: otpError } = await supabaseClient.auth.signInWithOtp({
      phone: fullPhone
    });

    if (otpError) throw otpError;

    document.getElementById("otpModal").style.display = "flex";
    document.getElementById("otpCode").focus();
    statusEl.textContent = "";
  } catch (error) {
    statusEl.textContent = error.message || "Failed to send OTP";
    console.error("OTP send error:", error);
  }
}

async function verifyAndReset() {
  const otp = document.getElementById("otpCode").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const statusEl = document.getElementById("otpStatus");

  // Validate inputs
  if (!otp || otp.length !== 6) {
    statusEl.textContent = "Please enter 6-digit code";
    return;
  }

  if (newPassword !== confirmPassword) {
    statusEl.textContent = "Passwords don't match!";
    return;
  }

  if (newPassword.length < 6) {
    statusEl.textContent = "Password must be 6+ characters";
    return;
  }

  statusEl.textContent = "Verifying and updating...";

  try {
    // 1. Verify OTP
    const { data, error: verifyError } = await supabaseClient.auth.verifyOtp({
      phone: verificationPhone,
      token: otp,
      type: 'sms'
    });

    if (verifyError) throw verifyError;

    // 2. Get user's email for password update
    const { data: userData, error: userError } = await supabaseClient
      .from('profiles')
      .select('email')
      .eq('phone', verificationPhone)
      .single();

    if (userError || !userData?.email) throw new Error("User not found");

    // 3. Update password via email auth
    const { error: updateError } = await supabaseClient.auth.updateUser({
      email: userData.email,
      password: newPassword
    });

    if (updateError) throw updateError;

    statusEl.textContent = "✓ Password updated! Redirecting...";
    setTimeout(() => window.location.href = "login-phone.html", 1500);
  } catch (error) {
    statusEl.textContent = error.message.includes("Invalid token") 
      ? "Invalid code. Please try again." 
      : error.message;
    console.error("Reset error:", error);
  }
}

// Keyboard navigation
document.getElementById("otpCode").addEventListener('keypress', (e) => {
  if (e.key === 'Enter') document.getElementById("newPassword").focus();
});
document.getElementById("newPassword").addEventListener('keypress', (e) => {
  if (e.key === 'Enter') document.getElementById("confirmPassword").focus();
});
document.getElementById("confirmPassword").addEventListener('keypress', (e) => {
  if (e.key === 'Enter') verifyAndReset();
});
