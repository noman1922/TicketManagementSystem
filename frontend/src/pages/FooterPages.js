import React from "react";
import "./FooterPages.css";

export const Contact = () => (
    <div className="footer-page-container">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you! Reach out to us for any inquiries.</p>

        <div className="contact-details">
            <div className="contact-card">
                <h3>📍 Visit Us</h3>
                <p>House 6, Road 16, Block D<br />Mirpur 6, Dhaka 1216</p>
            </div>
            <div className="contact-card">
                <h3>📞 Call Us</h3>
                <p>+88 01400019228</p>
            </div>
            <div className="contact-card">
                <h3>✉️ Email Us</h3>
                <p>mdnomanahamed22@gmail.com</p>
            </div>
        </div>
    </div>
);

export const FAQ = () => (
    <div className="footer-page-container">
        <h1>Frequently Asked Questions</h1>
        <div className="faq-list">
            <div className="faq-item">
                <h3>How do I book a ticket?</h3>
                <p>Simply browse our events, select the one you like, choose your ticket category, and proceed to payment.</p>
            </div>
            <div className="faq-item">
                <h3>Can I get a refund?</h3>
                <p>Refund policies vary by event. Please check the specific event's policy section or our general Refund Policy page.</p>
            </div>
            <div className="faq-item">
                <h3>Do I need to print my ticket?</h3>
                <p>No! You can show your digital ticket (QR code) at the entrance.</p>
            </div>
        </div>
    </div>
);

export const Terms = () => (
    <div className="footer-page-container">
        <h1>Terms & Conditions</h1>
        <p>Welcome to Ticket Broker. By using our services, you agree to the following terms...</p>
        <ul>
            <li>All ticket sales are final unless otherwise stated.</li>
            <li>You must be at least 18 years old to make a purchase.</li>
            <li>We strictly prohibit the resale of tickets at inflated prices.</li>
            <li>Event organizers reserve the right to change schedules.</li>
        </ul>
    </div>
);

export const Privacy = () => (
    <div className="footer-page-container">
        <h1>Privacy Policy</h1>
        <p>Your privacy is important to us. This policy outlines how we handle your data.</p>
        <h3>Data We Collect</h3>
        <p>We collect your name, email, and payment details explicitly for processing bookings.</p>
        <h3>How We Use It</h3>
        <p>To issue tickets, send event updates, and improve our services. We never sell your data.</p>
    </div>
);

export const Refund = () => (
    <div className="footer-page-container">
        <h1>Refund Policy</h1>
        <p>We understand that plans change. Here is our refund structure:</p>
        <ul>
            <li><strong>Canceled Events:</strong> Full refund automatically processed.</li>
            <li><strong>Rescheduled Events:</strong> Tickets remain valid or full refund upon request.</li>
            <li><strong>User Cancellation:</strong> 70% refund if cancelled 7 days prior to event. No refund within 24 hours.</li>
        </ul>
    </div>
);

export const Legals = () => (
    <div className="footer-page-container">
        <h1>Legal Information</h1>
        <p>Ticket Broker is a registered entity operating under the laws of Bangladesh.</p>
        <p><strong>Trade License:</strong> TRAD/DNCC/141845/2022</p>
        <p><strong>Parent Company:</strong> Adventor Global Limited</p>
    </div>
);
