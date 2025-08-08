const supabaseUrl = 'https://rvlealemvurgmpflajbn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bGVhbGVtdnVyZ21wZmxhamJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjEwMDEsImV4cCI6MjA3MDEzNzAwMX0.TPmel2qGoG5R_hnFAB_pF9ZQob5wMkBhJVPbcqs9q8M';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Send OTP for LOGIN
async function sendLoginOTP(){
  const phone = document.getElementById('code').value + document.getElementById('phone').value;

  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phone
    });

    if (error) throw error;
    
    const code = prompt("Enter OTP:");
    
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      phone: phone,
      token: code,
      type: 'sms'
    });

    if (verifyError) throw verifyError;
    
    alert("Logged In Successfully");
    window.location.href="index.html";
  } catch (e) {
    alert(e.message);
  }
}

// Send OTP for PASSWORD RESET
async function sendResetOTP(){
  const phone = document.getElementById('code').value + document.getElementById('phone').value;

  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phone
    });

    if (error) throw error;
    
    const code = prompt("Enter OTP:");
    
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      phone: phone,
      token: code,
      type: 'sms'
    });

    if (verifyError) throw verifyError;
    
    alert("Verified — proceed to reset");
    window.location.href="reset-password-phone.html";
  } catch (e) {
    alert(e.message);
  }

}
