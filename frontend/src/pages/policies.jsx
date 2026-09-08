import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PoliciesPage.css';

// Very small markdown -> JSX renderer.
// Supports: # / ## / ### headings, - bullet lists, 1. numbered lists,
// blank-line-separated paragraphs, and plain text.
function renderMarkdown(markdown) {
  const lines = markdown.split('\n');
  const elements = [];
  let listBuffer = [];
  let listType = null; // 'ul' | 'ol'

  const flushList = (key) => {
    if (listBuffer.length === 0) return;
    const items = listBuffer.map((item, i) => <li key={i}>{item}</li>);
    if (listType === 'ol') {
      elements.push(<ol key={`list-${key}`}>{items}</ol>);
    } else {
      elements.push(<ul key={`list-${key}`}>{items}</ul>);
    }
    listBuffer = [];
    listType = null;
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();

    if (line === '') {
      flushList(index);
      return;
    }

    if (line.startsWith('### ')) {
      flushList(index);
      elements.push(<h3 key={index}>{line.slice(4)}</h3>);
      return;
    }
    if (line.startsWith('## ')) {
      flushList(index);
      elements.push(<h2 key={index}>{line.slice(3)}</h2>);
      return;
    }
    if (line.startsWith('# ')) {
      flushList(index);
      elements.push(<h1 key={index}>{line.slice(2)}</h1>);
      return;
    }

    const bulletMatch = line.match(/^-\s+(.*)/);
    if (bulletMatch) {
      if (listType && listType !== 'ul') flushList(index);
      listType = 'ul';
      listBuffer.push(bulletMatch[1]);
      return;
    }

    const numberedMatch = line.match(/^\d+\.\s+(.*)/);
    if (numberedMatch) {
      if (listType && listType !== 'ol') flushList(index);
      listType = 'ol';
      listBuffer.push(numberedMatch[1]);
      return;
    }

    flushList(index);
    elements.push(<p key={index}>{line}</p>);
  });

  flushList('end');
  return elements;
}

const PoliciesPage = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('terms');

  const termsContent = `# Terms of Service

Last Updated: June 30, 2026

## 1. Agreement to Terms
By accessing or using Cloud File Sharing ("Service", "we", "us", "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.

## 2. Description of Service
Cloud File Sharing lets registered users upload, organize, preview, and share files and folders, with optional password-protected private storage and shareable links.

## 3. Account Registration
- You must provide a valid email address and complete email verification to create an account.
- You are responsible for maintaining the confidentiality of your password and for all activity under your account.
- You must notify us promptly of any unauthorized use of your account.

## 4. Acceptable Use
You agree not to use the Service to:
- Upload or share files that infringe on someone else's intellectual property rights
- Upload malware, viruses, or other harmful code
- Store or distribute illegal content
- Attempt to gain unauthorized access to other users' accounts or data
- Interfere with or disrupt the integrity or performance of the Service

## 5. Your Content
You retain ownership of files you upload. By uploading content, you grant us a limited license to store, process, and display that content solely to provide the Service to you. We do not claim ownership of your files.

## 6. Storage and Availability
While we take reasonable measures to protect your data, we do not guarantee uninterrupted availability of the Service and recommend keeping independent backups of important files.

## 7. Termination
We may suspend or terminate accounts that violate these Terms. You may delete your account at any time, which will remove your files from active storage subject to our data retention practices described in the Privacy Policy.

## 8. Limitation of Liability
The Service is provided "as is" without warranties of any kind. We are not liable for indirect, incidental, or consequential damages arising from your use of the Service.

## 9. Changes to These Terms
We may update these Terms from time to time. Continued use of the Service after changes take effect constitutes acceptance of the revised Terms.

## 10. Contact
Questions about these Terms can be sent to the support contact listed on our website.`;

  const privacyContent = `# Privacy Policy

Last Updated: June 30, 2026

## 1. Introduction
Cloud File Sharing ("we", "us", "our") operates this website and related services. This Privacy Policy explains what information we collect, how we use it, and the choices you have.

## 2. Information We Collect
- Account information: full name, email address, and password (stored as a secure hash)
- Files and folders you upload, including file names and metadata
- Usage data such as login times, storage usage, and feature activity
- Technical data such as IP address and browser type, collected automatically

## 3. How We Use Your Information
- To create and manage your account
- To store, organize, and let you share your files
- To send verification codes, security alerts, and service-related emails
- To maintain and improve the security and performance of the Service

## 4. How We Protect Your Data
Files are encrypted in transit and at rest. Passwords are hashed and never stored in plain text. Access to your files is restricted to your authenticated account, except where you explicitly create a shared link.

## 5. Sharing of Information
We do not sell your personal data. We do not share your files or account information with third parties, except:
- When required by law or a valid legal request
- With service providers who help operate our infrastructure (e.g. cloud storage and email delivery), under confidentiality obligations

## 6. Data Retention
We retain your account data and files for as long as your account is active. Deleted files are moved to Trash and permanently removed after the retention period shown in the app, or immediately upon permanent deletion.

## 7. Your Rights
You may access, update, or delete your account information at any time from your account settings. You may also request a copy of your data or its deletion by contacting support.

## 8. Children's Privacy
The Service is not directed to children under 13, and we do not knowingly collect personal information from children under 13.

## 9. Changes to This Policy
We may update this Privacy Policy periodically. We will indicate the "Last Updated" date at the top of this page when changes are made.

## 10. Contact
For privacy-related questions, please reach out through the support contact listed on our website.`;

  const cookiesContent = `# Cookies Policy

Last Updated: June 30, 2026

## 1. Introduction
This Cookies Policy explains how Cloud File Sharing uses cookies and similar technologies when you visit or use our website and Service.

## 2. What Are Cookies
Cookies are small text files stored on your device that help websites remember information about your visit, such as your login session and preferences.

## 3. Cookies We Use
- Essential cookies: required to keep you logged in and to maintain session security. The Service cannot function properly without these.
- Preference cookies: remember settings such as your chosen theme or layout.
- Analytics cookies: help us understand how the Service is used so we can improve performance and features.

## 4. Local Storage
In addition to cookies, we use browser local storage to keep your session token and basic profile information on your device so you stay signed in between visits.

## 5. Managing Cookies
Most browsers let you view, delete, or block cookies through their settings. Blocking essential cookies may prevent you from signing in or using core features of the Service.

## 6. Third-Party Cookies
We do not use third-party advertising cookies. Any cookies set are used solely to operate and improve the Service.

## 7. Changes to This Policy
We may update this Cookies Policy from time to time. Changes will be reflected in the "Last Updated" date above.

## 8. Contact
Questions about our use of cookies can be sent through the support contact listed on our website.`;

  const getContent = () => {
    switch (activePage) {
      case 'terms':
        return termsContent;
      case 'privacy':
        return privacyContent;
      case 'cookies':
        return cookiesContent;
      default:
        return termsContent;
    }
  };

  return (
    <div className="policies-container">
      <button className="policies-back-btn" onClick={() => navigate('/signup')}>
        ← Back 
      </button>

      {/* Navigation Tabs */}
      <div className="policies-nav">
        <button
          className={`nav-btn ${activePage === 'terms' ? 'active' : ''}`}
          onClick={() => setActivePage('terms')}
        >
          Terms of Service
        </button>
        <button
          className={`nav-btn ${activePage === 'privacy' ? 'active' : ''}`}
          onClick={() => setActivePage('privacy')}
        >
          Privacy Policy
        </button>
        <button
          className={`nav-btn ${activePage === 'cookies' ? 'active' : ''}`}
          onClick={() => setActivePage('cookies')}
        >
          Cookies Policy
        </button>
      </div>

      {/* Content */}
      <div className="policies-content">
        <div className="content-text">
          {renderMarkdown(getContent())}
        </div>
      </div>
    </div>
  );
};

export default PoliciesPage;