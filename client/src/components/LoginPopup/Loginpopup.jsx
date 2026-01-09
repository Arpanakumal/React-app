import React, { useState } from 'react'
import './loginpopup.css';
import * as assets from '../../assets/assets';

const Loginpopup = ({ setShowLogin }) => {

    const [currState, setCurrState] = useState("Sign up")

    return (
        <div className='login-popup'>
            <form className='login-popup-container'>
                <div className="login-popup-title">
                    <h2>{currState}</h2>
                    <img onClick={() => setShowLogin(false)} src={assets.cross} alt="" />
                </div>
                <div className="login-popup-inputs">
                    {currState === "Login" ? <></> : <input type="text" placeholder='Your Name' required />}

                    <input type="email" placeholder='Your Email' required />
                    <input type="password" placeholder='Password' required />
                </div>
                <button>{currState === "Sign up" ? "Create Account" : "Login"}</button>
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
