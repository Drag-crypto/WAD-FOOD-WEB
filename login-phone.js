 const supabaseUrl = 'https://rvlealemvurgmpflajbn.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bGVhbGVtdnVyZ21wZmxhamJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjEwMDEsImV4cCI6MjA3MDEzNzAwMX0.TPmel2qGoG5R_hnFAB_pF9ZQob5wMkBhJVPbcqs9q8M';
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

    let verificationPhone = "";

    function goback() {
      window.location.href = 'login.html';
    }

    async function sendOTP() {
      const phone = document.getElementById('phone').value;
      const cc = document.getElementById('countryCode').value;
      const fullPhone = cc + phone;
      const statusEl = document.getElementById('statusMessage');

      if (!phone) {
        statusEl.textContent = "Please enter phone number";
        return;
      }

      statusEl.textContent = "Sending OTP...";
      verificationPhone = fullPhone;

      try {
        const { error } = await supabase.auth.signInWithOtp({
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

    async function verifyOTP() {
      const otp = document.getElementById("otpCode").value;
      const statusEl = document.getElementById("otpStatus");

      if (!otp || otp.length !== 6) {
        statusEl.textContent = "Please enter 6-digit code";
        return;
      }

      statusEl.textContent = "Verifying...";

      try {
        const { error } = await supabase.auth.verifyOtp({
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

    // Allow pressing Enter in OTP field
    document.getElementById("otpCode").addEventListener('keypress', (e) => {
      if (e.key === 'Enter') verifyOTP();

    });
