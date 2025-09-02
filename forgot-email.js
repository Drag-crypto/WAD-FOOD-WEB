const supabaseUrl = 'https://rvlealemvurgmpflajbn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bGVhbGVtdnVyZ21wZmxhamJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjEwMDEsImV4cCI6MjA3MDEzNzAwMX0.TPmel2qGoG5R_hnFAB_pF9ZQob5wMkBhJVPbcqs9q8M';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function sendResetLink() {
  const email = document.getElementById("email").value;
  const statusEl = document.getElementById("statusMessage");

  if (!email.includes("@")) {
    statusEl.textContent = "Please enter a valid email";
    return;
  }

  statusEl.textContent = "Sending reset link...";

  try {
    const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `Reset-Password-email.html`
    });

    if (error) throw error;

    statusEl.textContent = "Reset link sent to your email!";
  } catch (error) {
    statusEl.textContent = error.message;
  }
}

document.getElementById("email").addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendResetLink();
});


