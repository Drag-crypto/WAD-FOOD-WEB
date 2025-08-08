import {createClient} from '@supabase/supabase-js'


const supabaseUrl = 'https://rvlealemvurgmpflajbn.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bGVhbGVtdnVyZ21wZmxhamJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjEwMDEsImV4cCI6MjA3MDEzNzAwMX0.TPmel2qGoG5R_hnFAB_pF9ZQob5wMkBhJVPbcqs9q8M';
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

    let verificationPhone = "";

    async function createAccount() {
      const email = document.getElementById("email").value;
      const confirmEmail = document.getElementById("confirmEmail").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      const username = document.getElementById("username").value;
      const phone = document.getElementById("phone").value;
      const statusEl = document.getElementById("statusMessage");

      // Validation
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
              email_verified: true
            }
          }
        });

        if (error) throw error;

        // 2. Send OTP to phone
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
        console.error(error);
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
        const { error } = await supabaseClient.auth.verifyOtp({
          phone: verificationPhone,
          token: otp,
          type: 'sms'
        });

        if (error) throw error;

        statusEl.textContent = "✓ Verified! Redirecting...";
        setTimeout(() => window.location.href = "index.html", 1500);
      } catch (error) {
        statusEl.textContent = `Error: ${error.message}`;
      }
    }

    // Allow pressing Enter in OTP field to submit
    document.getElementById("otpCode").addEventListener('keypress', (e) => {
      if (e.key === 'Enter') verifyOTP();
    });
