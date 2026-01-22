import React, { useContext, useState } from 'react'
import './loginpopup.css';
import * as assets from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const Loginpopup = ({ setShowLogin }) => {

    const { url, setToken } = useContext(StoreContext)

    const [currState, setCurrState] = useState("Sign up")
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",

    })
    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }))
    }

    const onLogin = async (event) => {
        event.preventDefault()
        let newUrl = url;
        if (!newUrl.endsWith("/")) newUrl += "/";
        newUrl += currState === "Login" ? "api/user/login" : "api/user/register";


        const response = await axios.post(newUrl, data);
        if (response.data.success) {
            setToken(response.data.token);
            localStorage.setItem("token", response.data.token);
            setShowLogin(false)
        } else {
            alert(response.data.message);
        }

    }

    return (
        <div className='login-popup'>
            <form onSubmit={onLogin} className='login-popup-container'>
                <div className="login-popup-title">
                    <h2>{currState}</h2>
                    <img onClick={() => setShowLogin(false)} src={assets.cross} alt="" />
                </div>
                <div className="login-popup-inputs">
                    {currState === "Login" ? <></> : <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Your Name' required />}

                    <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Your Email' required />
                    <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder='Password' required />
                </div>
                <button type='submit'>{currState === "Sign up" ? "Create Account" : "Login"}</button>
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
    )
}

export default Loginpopup
