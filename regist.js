const supabaseUrl = 'https://rvlealemvurgmpflajbn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bGVhbGVtdnVyZ21wZmxhamJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjEwMDEsImV4cCI6MjA3MDEzNzAwMX0.TPmel2qGoG5R_hnFAB_pF9ZQob5wMkBhJVPbcqs9q8M';
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
  if (!username || !email || !confirmEmail || !password || !confirmPassword || !phone) {
    statusEl.textContent = "All fields are required!";
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

  if (!phone.startsWith('+')) {
    statusEl.textContent = "Phone must include country code (e.g., +1)";
    return;
  }

  if (password.length < 6) {
    statusEl.textContent = "Password must be at least 6 characters";
    return;
  }

  // Check for duplicates
  statusEl.textContent = "Checking availability...";
  try {
    // Check username
    const { data: usernameCheck, error: usernameError } = await supabaseClient
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();

    if (usernameCheck) {
      statusEl.textContent = "Username already taken";
      return;
    }

    // Check email
    const { data: emailCheck, error: emailError } = await supabaseClient
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (emailCheck) {
      statusEl.textContent = "Email already registered";
      return;
    }

    // Check phone
    const { data: phoneCheck, error: phoneError } = await supabaseClient
      .from('profiles')
      .select('phone')
      .eq('phone', phone)
      .single();

    if (phoneCheck) {
      statusEl.textContent = "Phone number already registered";
      return;
    }

  } catch (error) {
    console.error("Duplicate check error:", error);
    // Continue registration if checks fail (fail-open for better UX)
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
          phone,
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

    // 3. Send OTP to phone
    statusEl.textContent = "Sending verification code...";
    verificationPhone = phone;
    
    const { error: otpError } = await supabaseClient.auth.signInWithOtp({
      phone
    });

    if (otpError) throw otpError;

    // Show OTP modal
    document.getElementById("otpModal").style.display = "flex";
    document.getElementById("otpCode").focus();
    statusEl.textContent = "";
    
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

    localStorage.setItem('temp_reg_email', registeredEmail);
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

    // 2. Auto-login with email/password (since we have them)
    const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
      email: registeredEmail,
      password: document.getElementById("password").value
    });

    if (loginError) throw loginError;

    statusEl.textContent = "✓ Verified! Redirecting...";
    setTimeout(() => window.location.href = "index.html", 1500);
  } catch (error) {
    statusEl.textContent = `Error: ${error.message}`;
    console.error("OTP verification error:", error);
  }
}

// Allow pressing Enter in OTP field to submit
document.getElementById("otpCode").addEventListener('keypress', (e) => {
  if (e.key === 'Enter') verifyOTP();
});
