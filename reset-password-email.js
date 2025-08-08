const supabaseUrl = 'https://rvlealemvurgmpflajbn.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bGVhbGVtdnVyZ21wZmxhamJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjEwMDEsImV4cCI6MjA3MDEzNzAwMX0.TPmel2qGoG5R_hnFAB_pF9ZQob5wMkBhJVPbcqs9q8M';
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

    let resetEmail = "";
    let accessToken = null;

    async function sendResetLink() {
      const email = document.getElementById("email").value;
      const statusEl = document.getElementById("statusMessage");

      if (!email.includes("@")) {
        statusEl.textContent = "Please enter a valid email";
        return;
      }

      statusEl.textContent = "Sending reset link...";
      resetEmail = email;

      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password-email.html`
        });

        if (error) throw error;

        statusEl.textContent = "Check your email for the reset link!";
      } catch (error) {
        statusEl.textContent = error.message;
      }
    }

    // Check for password reset token in URL
    async function checkResetToken() {
      const hash = window.location.hash;
      if (hash.includes("type=recovery")) {
        const params = new URLSearchParams(hash.substring(1));
        accessToken = params.get("access_token");
        
        if (accessToken) {
          document.getElementById("resetModal").style.display = "flex";
          document.getElementById("email").value = "";
        }
      }
    }

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
        // First recover the session
        const { data, error: recoverError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: ""
        });

        if (recoverError) throw recoverError;

        // Then update password
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (updateError) throw updateError;

        statusEl.textContent = "✓ Password updated! Redirecting...";
        setTimeout(() => window.location.href = "login-email.html", 1500);
      } catch (error) {
        statusEl.textContent = error.message;
      }
    }

    // Initialize token check
    checkResetToken();

    // Allow pressing Enter in fields
    document.getElementById("email").addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendResetLink();
    });
    document.getElementById("newPassword").addEventListener('keypress', (e) => {
      if (e.key === 'Enter') document.getElementById("confirmPassword").focus();
    });
    document.getElementById("confirmPassword").addEventListener('keypress', (e) => {
      if (e.key === 'Enter') updatePassword();

    });
