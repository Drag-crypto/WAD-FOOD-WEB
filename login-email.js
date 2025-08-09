const supabaseUrl = 'https://rvlealemvurgmpflajbn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bGVhbGVtdnVyZ21wZmxhamJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjEwMDEsImV4cCI6MjA3MDEzNzAwMX0.TPmel2qGoG5R_hnFAB_pF9ZQob5wMkBhJVPbcqs9q8M';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  // First check if message element exists
  const messageEl = document.getElementById('message');
  if (!messageEl) {
    console.error("Message element not found");
    return;
  }

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) throw error;
    
    if (messageEl) {
      messageEl.textContent = "Login successful! Redirecting...";
      messageEl.className = "success";
      messageEl.style.display = "block";
    }
    
    // Redirect after 1 second
    setTimeout(() => window.location.href = "WAD-FOOD-WEB/index.html", 1000);
    
  } catch (error) {
    if (messageEl) {
      messageEl.textContent = error.message;
      messageEl.className = "error";
      messageEl.style.display = "block";
    }
  }
}

document.getElementById("password").addEventListener('keypress', (e) => {
  if (e.key === 'Enter') login();
});

// Check if coming from registration
if (window.location.search.includes('from_registration=1')) {
  document.getElementById('email').value = localStorage.getItem('temp_reg_email') || '';
  localStorage.removeItem('temp_reg_email');
}

