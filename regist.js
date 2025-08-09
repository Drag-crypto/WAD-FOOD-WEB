const supabaseUrl = 'https://rvlealemvurgmpflajbn.supabase.co';
const supabaseKey = 'your-supabase-key';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

let verificationPhone = "";
let registeredEmail = "";

async function createAccount() {
  const email = document.getElementById("email").value.trim();
  const confirmEmail = document.getElementById("confirmEmail").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const username = document.getElementById("username").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const statusEl = document.getElementById("statusMessage");

  // Clear previous errors
  statusEl.textContent = "";

  // Validation
  if (!username || !email || !confirmEmail || !password || !confirmPassword) {
    statusEl.textContent = "Required fields are missing!";
    return;
  }

  if (email !== confirmEmail) {
    statusEl.textContent = "Emails don't match!";
    return;
  }

  if (password !== confirmPassword) {
    statusEl.textContent = "Passwords don't match!";
    return;
  }

  if (password.length < 6) {
    statusEl.textContent = "Password must be at least 6 characters";
    return;
  }

  // Phone validation only if provided
  if (phone && !phone.startsWith('+')) {
    statusEl.textContent = "Phone must include country code (e.g., +1)";
    return;
  }

  statusEl.textContent = "Creating account...";
  
  try {
    // 1. Register with email/password
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          ...(phone && { phone }), // Only include phone if provided
          email_verified: false
        },
        emailRedirectTo: `${window.location.origin}/verify-success.html`
      }
    });

    if (error) throw error;

    registeredEmail = email;
    
    // 2. Send verification email
    const { error: emailError } = await supabaseClient.auth.resend({
      type: 'signup',
      email: email
    });

    if (emailError) console.error("Email verification error:", emailError);

    // 3. If phone provided, send OTP
    if (phone) {
      statusEl.textContent = "Sending verification code...";
      verificationPhone = phone;
      
      const { error: otpError } = await supabaseClient.auth.signInWithOtp({
        phone
      });

      if (otpError) throw otpError;

      // Show OTP modal
      document.getElementById("otpModal").style.display = "flex";
      document.getElementById("otpCode").focus();
    } else {
      // No phone - redirect to success
      statusEl.textContent = "Account created! Check your email to verify.";
      setTimeout(() => {
        window.location.href = "login-email.html";
      }, 3000);
    }
    
  } catch (error) {
    statusEl.textContent = `Error: ${error.message}`;
    console.error("Registration error:", error);
  }
}

async function verifyOTP() {
  const otp = document.getElementById("otpCode").value;
  const statusEl = document.getElementById("otpStatus");
  
  if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
    statusEl.textContent = "Please enter a valid 6-digit code";
    return;
  }

  statusEl.textContent = "Verifying...";
  
  try {
    // 1. Verify phone via OTP
    const { data, error } = await supabaseClient.auth.verifyOtp({
      phone: verificationPhone,
      token: otp,
      type: 'sms'
    });

    if (error) throw error;

    // 2. Auto-login with email/password
    const password = document.getElementById("password").value;
    const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
      email: registeredEmail,
      password: password
    });

    if (loginError) throw loginError;

    statusEl.textContent = "✓ Verified! Redirecting...";
    setTimeout(() => window.location.href = "index.html", 1500);
  } catch (error) {
    statusEl.textContent = `Error: ${error.message}`;
    console.error("OTP verification error:", error);
  }
}

document.getElementById("otpCode").addEventListener('keypress', (e) => {
  if (e.key === 'Enter') verifyOTP();
});
