import React, { useContext, useState } from 'react';
import './loginpopup.css';
import * as assets from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPopup = ({ setShowLogin }) => {
    const navigate = useNavigate();
    const { setToken, setRole, setUserName, setUserId } = useContext(StoreContext);

    const [currState, setCurrState] = useState("Sign up");
    const [data, setData] = useState({ name: "", email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const togglePassword = () => setShowPassword(prev => !prev);

    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            let endpoint = "";

            if (currState === "Login") {
                // Admin login
                if (data.email.toLowerCase().trim() === process.env.REACT_APP_ADMIN_EMAIL.toLowerCase().trim()) {
                    endpoint = "admin/login";
                } else {
                    endpoint = "user/login-all";
                }
            } else {
                endpoint = "user/register";
            }

            const response = await axios.post(`${process.env.REACT_APP_API_URL}/${endpoint}`, data);

            if (response.data.success) {
                const { token, role, name, id } = response.data;


                setToken(token);
                setRole(role);
                setUserName(name);
                setUserId(id);

                localStorage.setItem("token", token);
                localStorage.setItem("role", role);
                localStorage.setItem("name", name);
                localStorage.setItem("id", id);

                setShowLogin(false);

//redirect basen on admin/user/provider
                if (role === "admin") {

                    window.location.href = "http://localhost:5174/dashboard";
                } else {

                    navigate("/");
                }
            } else {
                alert(response.data.message || "Login failed. Check your credentials.");
            }

        } catch (err) {
            console.error(err);
            alert("Login failed. Check backend URL or credentials.");
        }
    };

    return (
        <div className='login-popup'>
            <form onSubmit={onSubmit} className='login-popup-container'>
                <div className="login-popup-title">
                    <h2>{currState}</h2>
                    <img onClick={() => setShowLogin(false)} src={assets.cross} alt="close" />
                </div>

                <div className="login-popup-inputs">
                    {currState === "Sign up" && (
                        <input
                            name='name'
                            onChange={onChangeHandler}
                            value={data.name}
                            type="text"
                            placeholder='Your Name'
                            required
                        />
                    )}

                    <input
                        name='email'
                        onChange={onChangeHandler}
                        value={data.email}
                        type="email"
                        placeholder='Your Email'
                        required
                    />

                    <div className="password-wrapper">
                        <input
                            name='password'
                            onChange={onChangeHandler}
                            value={data.password}
                            type={showPassword ? "text" : "password"}
                            placeholder='Password'
                            required
                        />
                        <span className="eye-icon" onClick={togglePassword}>
                            {showPassword ? (
                                <img src={assets.eyeOpen} alt="Hide" />
                            ) : (
                                <img src={assets.eyeClosed} alt="Show" />
                            )}
                        </span>
                    </div>
                </div>

                <button type='submit'>
                    {currState === "Sign up" ? "Create Account" : "Login"}
                </button>

                <div className="login-toggle">
                    {currState === "Sign up" ? (
                        <p>
                            Already have an account?{' '}
                            <span onClick={() => setCurrState("Login")}>Login</span>
                        </p>
                    ) : (
                        <p>
                            Don't have an account?{' '}
                            <span onClick={() => setCurrState("Sign up")}>Sign Up</span>
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
};

export default LoginPopup;
