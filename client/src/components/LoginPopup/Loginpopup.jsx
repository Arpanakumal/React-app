import React, { useContext, useState } from "react";
import "./loginpopup.css";
import * as assets from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginPopup = ({ setShowLogin }) => {
    const navigate = useNavigate();
    const { setToken, setRole, setUserName, setUserId } =
        useContext(StoreContext);

    const [mode, setMode] = useState("login");
    const [loginType, setLoginType] = useState("user");
    const [showPassword, setShowPassword] = useState(false);

    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const togglePassword = () => setShowPassword((prev) => !prev);

    const handleRedirect = (type) => {
        if (type === "admin") {
            window.location.href = "http://localhost:5173/login";
        } else if (type === "provider") {
            window.location.href = "http://localhost:5173/provider/login";
        } else {
            setLoginType("user");
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();


        if (loginType !== "user") return;

        try {
            let url = mode === "signup"
                ? `${process.env.REACT_APP_API_URL}/api/user/register`
                : `${process.env.REACT_APP_API_URL}/api/user/login`;

            const response = await axios.post(url, data);

            if (!response.data.success) {
                alert(response.data.message || "Authentication failed");
                return;
            }

            const { token, role, name, id } = response.data;

            localStorage.setItem("user_token", token);
            localStorage.setItem("user_role", role);
            localStorage.setItem("user_name", name);
            localStorage.setItem("user_id", id);

            setToken(token);
            setRole(role);
            setUserName(name);
            setUserId(id);

            setShowLogin(false);
            navigate("/");

        } catch (error) {
            console.error("Login error:", error);
            alert("Server error. Please try again.");
        }
    };

    return (
        <div className="login-popup">
            <form className="login-popup-container" onSubmit={onSubmit}>
                <div className="login-popup-title">
                    <h2>{mode === "signup" ? "Sign Up" : "Login"}</h2>
                    <img
                        src={assets.cross}
                        alt="close"
                        onClick={() => setShowLogin(false)}
                    />
                </div>

                {loginType === "user" && (
                    <div className="login-popup-inputs">
                        {mode === "signup" && (
                            <input
                                type="text"
                                name="name"
                                placeholder="Your Name"
                                value={data.name}
                                onChange={onChangeHandler}
                                required
                            />
                        )}

                        <input
                            type="email"
                            name="email"
                            placeholder="Your Email"
                            value={data.email}
                            onChange={onChangeHandler}
                            required
                        />

                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                value={data.password}
                                onChange={onChangeHandler}
                                required
                            />
                            <span className="eye-icon" onClick={togglePassword}>
                                <img
                                    src={showPassword ? assets.eyeOpen : assets.eyeClosed}
                                    alt="toggle"
                                />
                            </span>
                        </div>
                    </div>
                )}

                <div className="login-type">
                    <label>
                        <input
                            type="radio"
                            value="user"
                            checked={loginType === "user"}
                            onChange={() => handleRedirect("user")}
                        />
                        User
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="admin"
                            checked={loginType === "admin"}
                            onChange={() => handleRedirect("admin")}
                        />
                        Admin
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="provider"
                            checked={loginType === "provider"}
                            onChange={() => handleRedirect("provider")}
                        />
                        Provider
                    </label>
                </div>

                {loginType === "user" && (
                    <button type="submit">
                        {mode === "signup" ? "Create Account" : "Login"}
                    </button>
                )}

                <div className="login-toggle">
                    {mode === "signup" ? (
                        <p>
                            Already have an account?{" "}
                            <span onClick={() => setMode("login")}>Login</span>
                        </p>
                    ) : (
                        <p>
                            Don’t have an account?{" "}
                            <span onClick={() => setMode("signup")}>Sign Up</span>
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
};

export default LoginPopup;
