import React, { useState } from 'react';
import {
  FaSearch, FaChevronDown, FaChevronUp, FaEnvelope, FaWhatsapp,
  FaPhoneAlt, FaComments, FaArrowRight, FaLightbulb, FaHeadset, FaTimes
} from 'react-icons/fa';
import './HelpSupportPage.css';

const faqsData = [
  {
    q: 'What is this assessment about?',
    a: 'This career assessment uses psychometric, aptitude, personality, and interest scoring algorithms to evaluate your strengths and map them to the best-matching job roles and career paths.'
  },
  {
    q: 'How long does the assessment take?',
    a: 'The test typically takes between 20 to 30 minutes. You can answer questions at your own pace.'
  },
  {
    q: 'Can I save my assessment and continue later?',
    a: 'Yes! Your progress is automatically saved question-by-question. If you log out or close your browser, you can resume right from where you left off.'
  },
  {
    q: 'How will I get my results?',
    a: 'As soon as you submit the final question, your scores and top 3 recommended careers are generated instantly. You can view them online or download a full PDF report.'
  },
  {
    q: 'Is my information secure?',
    a: 'Absolutely. Your response data and profile information are encrypted and protected under strict data privacy policies.'
  },
  {
    q: 'How can I download my report?',
    a: 'You can click on "Download Report" on your Results page or the Assessment Complete screen to download your official PDF report.'
  },
  {
    q: 'Who can see my results?',
    a: 'Only you and authorized system administrators can access your individual assessment performance reports.'
  }
];

const HelpSupportPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaq, setOpenFaq] = useState(0); // first faq open by default
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [formStatus, setFormStatus] = useState({ loading: false, msg: '', error: false });

  const filteredFaqs = faqsData.filter(faq =>
    faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ loading: true, msg: '', error: false });
    try {
      const res = await fetch('/api/support/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setFormStatus({ loading: false, msg: data.message, error: false });
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setShowModal(false), 2500);
      } else {
        setFormStatus({ loading: false, msg: data.message || 'Error submitting request', error: true });
      }
    } catch (err) {
      setFormStatus({ loading: false, msg: 'Network error. Please try again.', error: true });
    }
  };

  return (
    <div className="help-support-container">
      {/* Page Header */}
      <div className="help-header">
        <h1 className="help-title">Help & Support</h1>
        <p className="help-subtitle">We're here to help you at every step.</p>
      </div>

      <div className="help-grid">
        {/* Left Column: Search & FAQs */}
        <div className="help-left-col">
          {/* Search Box */}
          <div className="help-search-card glass-card">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search for help (e.g., assessment, results, report)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-search">Search</button>
          </div>

          {/* FAQs Accordion */}
          <div className="faqs-card glass-card">
            <h2>Frequently Asked Questions</h2>

            <div className="faqs-list">
              {filteredFaqs.map((faq, idx) => (
                <div key={idx} className={`faq-item ${openFaq === idx ? 'open' : ''}`}>
                  <div className="faq-question" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                    <span>{faq.q}</span>
                    {openFaq === idx ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                  {openFaq === idx && (
                    <div className="faq-answer">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="quick-tips-card glass-card">
            <div className="tips-title">
              <FaLightbulb className="tips-icon" />
              <span>Quick Tips</span>
            </div>

            <div className="tips-grid">
              <div className="tip-item">
                <span className="tip-dot purple-dot"></span>
                <div>
                  <strong>Take Assessment</strong>
                  <p>Answer honestly for better career suggestions.</p>
                </div>
              </div>
              <div className="tip-item">
                <span className="tip-dot green-dot"></span>
                <div>
                  <strong>Check Results</strong>
                  <p>View your strengths and recommended careers.</p>
                </div>
              </div>
              <div className="tip-item">
                <span className="tip-dot orange-dot"></span>
                <div>
                  <strong>Download Report</strong>
                  <p>Download your report and plan your future.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Channels & Submit Request */}
        <div className="help-right-col">
          <div className="contact-card glass-card">
            <h2>Contact Support</h2>
            <p className="contact-sub">Choose the way that is easy for you.</p>

            <div className="contact-channel">
              <div className="channel-icon icon-bg-purple">
                <FaEnvelope />
              </div>
              <div>
                <strong>Email Us</strong>
                <a href="mailto:support@careerassessment.com">support@careerassessment.com</a>
                <span className="channel-sub">We usually reply within 24 hours.</span>
              </div>
            </div>

            <div className="contact-channel">
              <div className="channel-icon icon-bg-green">
                <FaWhatsapp />
              </div>
              <div>
                <strong>WhatsApp</strong>
                <p>+91 98765 43210</p>
                <span className="channel-sub">Mon - Sat: 9:00 AM - 6:00 PM</span>
              </div>
            </div>

            <div className="contact-channel">
              <div className="channel-icon icon-bg-amber">
                <FaPhoneAlt />
              </div>
              <div>
                <strong>Call Us</strong>
                <p>+91 98765 43210</p>
                <span className="channel-sub">Mon - Sat: 9:00 AM - 6:00 PM</span>
              </div>
            </div>

            <div className="contact-channel">
              <div className="channel-icon icon-bg-blue">
                <FaComments />
              </div>
              <div>
                <strong>Live Chat</strong>
                <p>Chat with our support team</p>
                <span className="channel-sub">Mon - Sat: 9:00 AM - 6:00 PM</span>
              </div>
            </div>
          </div>

          {/* Still Need Help Card */}
          <div className="still-need-card glass-card">
            <h3>Still need help?</h3>
            <p>Describe your issue and we will get back to you.</p>
            <button className="btn-submit-request" onClick={() => setShowModal(true)}>
              <span>Submit a Request</span>
              <FaArrowRight />
            </button>
          </div>
        </div>
      </div>

      {/* Submit Request Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="request-modal glass-card">
            <div className="modal-header">
              <h3>Submit a Support Request</h3>
              <button className="btn-close-modal" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>

            {formStatus.msg && (
              <div className={`form-alert ${formStatus.error ? 'alert-error' : 'alert-success'}`}>
                {formStatus.msg}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="request-form">
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label>Your Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email address"
                />
              </div>

              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="E.g., Issue downloading PDF report"
                />
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your issue or query in detail..."
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-send-request" disabled={formStatus.loading}>
                  {formStatus.loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpSupportPage;
