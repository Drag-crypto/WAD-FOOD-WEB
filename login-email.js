const supabaseUrl = 'https://rvlealemvurgmpflajbn.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bGVhbGVtdnVyZ21wZmxhamJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjEwMDEsImV4cCI6MjA3MDEzNzAwMX0.TPmel2qGoG5R_hnFAB_pF9ZQob5wMkBhJVPbcqs9q8M';
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

    async function login() {
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const statusEl = document.getElementById("statusMessage");

      statusEl.textContent = "Signing in...";

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (error) throw error;
        
        statusEl.textContent = "Login successful! Redirecting...";
        setTimeout(() => window.location.href = "index.html", 1000);
      } catch (error) {
        statusEl.textContent = error.message;
        console.error(error);
      }
    }

   
    document.getElementById("password").addEventListener('keypress', (e) => {
      if (e.key === 'Enter') login();
    });


