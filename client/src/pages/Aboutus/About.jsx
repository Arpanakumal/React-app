import React from 'react';
import './About.css';
import Title from '../../components/Title/title';
import * as assets from '../../assets/assets';

const About = () => {
    return (
        <div>
            <div className="text-2xl text-center pt-8 border-t">
                <Title text1="About" text2="Us" />
            </div>

            <div className='container'>
                <img src={assets.about2} alt="" />
                <div className='about-text'>
                    <p>At HomeEase, we make home services simple, reliable, and stress-free. From plumbing and electrical work to cleaning, gardening, and interior services, our team of skilled professionals is committed to delivering high-quality solutions right at your doorstep.</p><br></br>
                    <p>With a focus on trust, transparency, and convenience, HomeEase ensures that every service is done efficiently and to your satisfaction.We’re here to make your home a more comfortable and well-maintained place, so you can spend less time worrying and more time enjoying your space.</p>
                    <br></br>
                    <b className='about-text'>Our Mission</b><br></br>
                    <p>At HomeEase, our mission is to simplify and enhance everyday living by providing reliable, high-quality home services that you can trust. We strive to connect homeowners with skilled professionals who bring convenience, transparency,comfortable, and well-maintained homes for all. We are committed to excellence, customer satisfaction, and making home care effortless.</p>

                </div>
            </div>
            <div className="text-2xl text-center pt-8 border-t">
                <Title text1="Why Choose" text2="Us" />
            </div><br></br>

            <div className="why-choose-us">
                <div className="why-box">
                    <b>Experienced Professionals</b>
                    <p>Our team consists of skilled and certified experts dedicated to delivering top-quality home services.</p>
                    <b>Reliable & Punctual</b>
                    <p>We value your time and always arrive on schedule to get the job done right the first time.</p>
                </div>

                <div className="why-box">
                    <b>Customer Satisfaction</b>
                    <p>Your happiness is our priority — we strive to exceed expectations with every service.</p>
                    <b>Easy Booking & Support</b>
                    <p>Simple online scheduling and friendly customer service make working with us effortless.</p>
                </div>

                <div className="why-box">
                    <b>Safety & Trust</b>
                    <p>Our professionals are background-checked and fully insured for your peace of mind.</p>
                    <b>Committed to Quality</b>
                    <p>We use high-quality materials and follow best practices to ensure lasting results.</p>
                </div>
            </div>

        </div>
    );
};

export default About;
