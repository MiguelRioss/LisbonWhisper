import React, { useState } from 'react';
import { sendContactForm } from '../services/contactService';

function ContactUs() {
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      message: String(formData.get('message') || '').trim(),
    };

    try {
      setIsSubmitting(true);
      setStatus('');
      await sendContactForm(payload);
      setStatus('Message sent successfully. We will get back to you soon.');
      form.reset();
    } catch (error) {
      console.error(error);
      setStatus('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="about-page contact-page">
      <section className="about-hero-full">
        <div className="about-hero-media">
          <img
            className="about-hero-image"
            src="/res/image-doors2.jpg"
            alt="Lisbon doors"
          />
        </div>
        <div className="about-hero-overlay">
          <p className="about-hero-kicker">Lisbon Whisper</p>
          <h1 className="about-hero-title">Contact Us</h1>
          <p className="about-hero-description">
            Reach out with your dates, group size, or special requests and we will reply with the
            best options for your Lisbon experience.
          </p>
        </div>
      </section>

      <section className="contact-form-section">
        <div className="container mx-auto px-6">
          <div className="contact-template">
            <div className="contact-panel">
              <h2 className="contact-panel-title">Have a question?</h2>
              <p className="contact-panel-text">
                We are here to help you plan the perfect Lisbon experience. Fill out the form or
                reach us via email or phone and we will reply within one business day.
              </p>
              <p className="contact-panel-text">
                Our team is available Monday to Friday, 9:00 to 17:00 (Lisbon time).
              </p>
              <div className="contact-panel-links">
                <a className="contact-panel-link" href="mailto:geral@lisbonwhisper.pt">
                  geral@lisbonwhisper.pt
                </a>
                <a className="contact-panel-link" href="tel:+351965398865">
                  (+351) 965398865
                </a>
                <a className="contact-panel-link" href="tel:+351969923328">
                  (+351) 969923328
                </a>
              </div>
            </div>

            <div className="contact-form-shell">
              <form className="contact-form-grid" onSubmit={handleSubmit}>
                <div className="contact-field">
                  <label className="contact-label" htmlFor="contact-name">
                    Name <span className="contact-required">*</span>
                  </label>
                  <input
                    className="contact-input"
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="Your full name"
                  />
                </div>

                <div className="contact-field">
                  <label className="contact-label" htmlFor="contact-email">
                    Email <span className="contact-required">*</span>
                  </label>
                  <input
                    className="contact-input"
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                  />
                </div>

                <div className="contact-field">
                  <label className="contact-label" htmlFor="contact-phone">
                    Phone (optional)
                  </label>
                  <input
                    className="contact-input"
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+351 9XX XXX XXX"
                  />
                </div>

                <div className="contact-field contact-field--full">
                  <label className="contact-label" htmlFor="contact-message">
                    Message <span className="contact-required">*</span>
                  </label>
                  <textarea
                    className="contact-textarea"
                    id="contact-message"
                    name="message"
                    required
                    placeholder="Tell us about your ideal tour..."
                  />
                </div>

                <div className="contact-field contact-field--full">
                  <p className="contact-help">* Required fields</p>
                  {status ? <p className="contact-help">{status}</p> : null}
                  <button
                    type="submit"
                    className="contact-submit contact-submit--dark"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactUs;
