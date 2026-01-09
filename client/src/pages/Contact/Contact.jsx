import React from 'react';
import './Contact.css';
import Title from '../../components/Title/title';
import * as assets from '../../assets/assets';

const Contact = () => {
    return (
        <div className="contact-page">

            <div className="text-2xl text-center pt-8 border-t">
                <Title text1="Contact" text2="Us" />
            </div>

            <div className="contact-container">

                <div className="contact-image">
                    <img src={assets.contact} alt="Contact Us" />
                </div>


                <div className="contact-form">
                    <form>
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input type="text" id="name" placeholder="Your Name" required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" placeholder="Your Email" required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">Message</label>
                            <textarea id="message" rows="5" placeholder="Your Message" required></textarea>
                        </div>

                        <button type="submit" className="submit-btn">Send Message</button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Contact;
