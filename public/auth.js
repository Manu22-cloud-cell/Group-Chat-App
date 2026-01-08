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
                `${API_BASE_URL}/signup`,
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
                `${API_BASE_URL}/login`,
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

            const { token, message } = response.date;

            if (token) {
                localStorage.setItem("token", token);
                alert("Login successful");
                //redirect to chat page later
            } else {
                alert(message || "Invalid credentials");
            }
        } catch (error) {
            console.error(error);
            alert(
                error.response?.data?.message || "Login failed, please try again"
            );
        }
    });
}
