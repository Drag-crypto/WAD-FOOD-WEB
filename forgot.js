const supabaseUrl = 'https://rvlealemvurgmpflajbn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bGVhbGVtdnVyZ21wZmxhamJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjEwMDEsImV4cCI6MjA3MDEzNzAwMX0.TPmel2qGoG5R_hnFAB_pF9ZQob5wMkBhJVPbcqs9q8M';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

let verificationPhone = "";

async function sendOTP() {
  const phone = document.getElementById('phone').value;
  const cc = document.getElementById('countryCode').value;
  const fullPhone = cc + phone;
  const statusEl = document.getElementById('statusMessage');

  if (!phone) {
    statusEl.textContent = "Please enter phone number";
    return;
  }

  statusEl.textContent = "Sending verification code...";
  verificationPhone = fullPhone;

  try {
    const { error } = await supabaseClient.auth.signInWithOtp({
      phone: fullPhone
    });

    if (error) throw error;

    document.getElementById("otpModal").style.display = "flex";
    document.getElementById("otpCode").focus();
    statusEl.textContent = "";
  } catch (error) {
    statusEl.textContent = error.message;
  }
}

async function verifyAndReset() {
  const otp = document.getElementById("otpCode").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const statusEl = document.getElementById("otpStatus");

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
  alert("Are you sure this is the password you choose?")
  statusEl.textContent = "Verifying and updating...";

  try {
    // 1. Verify OTP first
    const { data, error: verifyError } = await supabaseClient.auth.verifyOtp({
      phone: verificationPhone,
      token: otp,
      type: 'sms'
    });

    if (verifyError) throw verifyError;

    // 2. Update password (requires user to be logged in)
    const { error: updateError } = await supabaseClient.auth.updateUser({
      password: newPassword
    });

    if (updateError) throw updateError;

    statusEl.textContent = "✓ Password updated! Redirecting...";
    setTimeout(() => window.location.href = "login-phone.html", 1500);
  } catch (error) {
    statusEl.textContent = error.message;
  }
}

// Allow pressing Enter in fields
document.getElementById("otpCode").addEventListener('keypress', (e) => {
  if (e.key === 'Enter') document.getElementById("newPassword").focus();
});
document.getElementById("newPassword").addEventListener('keypress', (e) => {
  if (e.key === 'Enter') document.getElementById("confirmPassword").focus();
});
document.getElementById("confirmPassword").addEventListener('keypress', (e) => {
  if (e.key === 'Enter') verifyAndReset();
});
