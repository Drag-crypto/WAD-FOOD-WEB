const supabaseUrl = 'https://rvlealemvurgmpflajbn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bGVhbGVtdnVyZ21wZmxhamJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjEwMDEsImV4cCI6MjA3MDEzNzAwMX0.TPmel2qGoG5R_hnFAB_pF9ZQob5wMkBhJVPbcqs9q8M';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

let verificationPhone = "";

// Tab switching
function switchTab(tabName) {
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  document.querySelector(`.tab-button[onclick="switchTab('${tabName}')"]`).classList.add('active');
  document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Unified password login
async function loginWithPassword() {
  const identifier = document.getElementById('phone').value;
  const cc = document.getElementById('countryCode').value;
  const password = document.getElementById('password').value;
  const statusEl = document.getElementById('passwordStatus');
  
  if (!identifier || !password) {
    statusEl.textContent = "Credentials required";
    return;
  }

  statusEl.textContent = "Logging in...";
  
  try {
    // Determine if identifier is email or phone
    const isEmail = identifier.includes('@');
    let credentials = { password };

    if (isEmail) {
      credentials.email = identifier;
    } else {
      credentials.phone = cc + identifier;
    }

    // First attempt with provided credentials
    let { data, error } = await supabaseClient.auth.signInWithPassword(credentials);

    // If fails and was phone, try finding associated email
    if (error && !isEmail) {
      const { data: userData } = await supabaseClient
        .from('profiles')
        .select('email')
        .eq('phone', cc + identifier)
        .single();

      if (userData?.email) {
        ({ data, error } = await supabaseClient.auth.signInWithPassword({
          email: userData.email,
          password
        }));
      }
    }

    if (error) throw error;
    
    statusEl.textContent = "✓ Login successful! Redirecting...";
    setTimeout(() => window.location.href = "index.html", 1000);
  } catch (error) {
    statusEl.textContent = error.message.includes("Invalid login") 
      ? "Invalid credentials" 
      : error.message;
  }
}

// OTP Login
async function sendLoginOTP() {
  const phone = document.getElementById('otpPhone').value;
  const cc = document.getElementById('otpCountryCode').value;
  const fullPhone = cc + phone;
  const statusEl = document.getElementById('otpSendStatus');

  if (!phone) {
    statusEl.textContent = "Please enter phone number";
    return;
  }

  statusEl.textContent = "Sending OTP...";
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
    statusEl.textContent = error.message.includes("not found") 
      ? "Phone not registered" 
      : error.message;
  }
}

async function verifyOTP() {
  const otp = document.getElementById("otpCode").value;
  const statusEl = document.getElementById("otpStatus");

  if (!otp || otp.length !== 6) {
    statusEl.textContent = "Please enter 6-digit code";
    return;
  }

  statusEl.textContent = "Verifying...";

  try {
    const { error } = await supabaseClient.auth.verifyOtp({
      phone: verificationPhone,
      token: otp,
      type: 'sms'
    });

    if (error) throw error;

    statusEl.textContent = "✓ Verified! Redirecting...";
    setTimeout(() => window.location.href = "index.html", 1000);
  } catch (error) {
    statusEl.textContent = error.message;
  }
}

// Keyboard navigation
document.getElementById("otpCode").addEventListener('keypress', (e) => {
  if (e.key === 'Enter') verifyOTP();
});
document.getElementById("password").addEventListener('keypress', (e) => {
  if (e.key === 'Enter') loginWithPassword();
});
