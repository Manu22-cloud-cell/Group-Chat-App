const API_BASE_URL = "http://localhost:3000";

//SIGNUP
const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;
        const password = document.getElementById("password").value;

        try {
            const response = await axios.post(
                `${API_BASE_URL}/auth/signup`,
                {
                    name,
                    email,
                    phone,
                    password,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            alert(response.data.message || "Signup successfull");
            window.location.href = "login.html";

        } catch (error) {
            console.error(error);
            alert(
                error.response?.data?.message || "Signup failed, please try again"
            );
        }
        e.target.reset();
    });
}

//LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const loginId = document.getElementById("loginId").value;
        const password = document.getElementById("loginPassword").value;

        try {
            const response = await axios.post(
                `${API_BASE_URL}/auth/login`,
                {
                    loginId,
                    password,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const { token, message } = response.data;

            if (token) {
                localStorage.setItem("token", token);
                alert("Login successful");
                window.location.href = "chat.html"
            } else {
                alert(message || "Invalid credentials");
            }
        } catch (error) {
            console.error(error);
            alert(
                error.response?.data?.message || "Login failed, please try again"
            );
        }
        e.target.reset();
    });
}
