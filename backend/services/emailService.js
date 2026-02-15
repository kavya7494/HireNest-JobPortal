const { getTransporter } = require('../config/email');

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = getTransporter();
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'HireNest Elite'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[EMAIL] Failed to send to ${to}: ${error.message}`);
    return null;
  }
};

const emailTemplates = {
  otpVerification: ({ userName, otp }) => ({
    subject: 'Verify Your Email - HireNest Elite',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 32px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .header p { color: #E0E7FF; margin: 8px 0 0; font-size: 14px; }
          .content { padding: 32px; text-align: center; }
          .content h2 { color: #1F2937; margin: 0 0 16px; font-size: 20px; }
          .content p { color: #4B5563; line-height: 1.6; margin: 0 0 12px; }
          .otp-box { background: linear-gradient(135deg, #EEF2FF, #E0E7FF); border: 2px solid #C7D2FE; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center; }
          .otp-code { color: #4F46E5; font-size: 36px; font-weight: 800; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace; }
          .otp-expiry { color: #6B7280; font-size: 13px; margin-top: 8px; }
          .warning { background: #FEF3C7; border: 1px solid #FDE68A; border-radius: 8px; padding: 12px; margin: 16px 0; }
          .warning p { color: #92400E; font-size: 13px; margin: 0; }
          .footer { background: #F9FAFB; padding: 20px 32px; text-align: center; border-top: 1px solid #E5E7EB; }
          .footer p { color: #9CA3AF; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>HireNest Elite</h1>
            <p>Email Verification</p>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Welcome to HireNest Elite! Please use the verification code below to complete your registration:</p>
            <div class="otp-box">
              <p class="otp-code">${otp}</p>
              <p class="otp-expiry">This code expires in 5 minutes</p>
            </div>
            <div class="warning">
              <p>If you didn't create an account on HireNest Elite, please ignore this email.</p>
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} HireNest Elite. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  applicationSubmitted: ({ candidateName, jobTitle, company, matchScore }) => ({
    subject: `Application Received - ${jobTitle} at ${company}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 32px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .header p { color: #E0E7FF; margin: 8px 0 0; font-size: 14px; }
          .content { padding: 32px; }
          .content h2 { color: #1F2937; margin: 0 0 16px; font-size: 20px; }
          .content p { color: #4B5563; line-height: 1.6; margin: 0 0 12px; }
          .badge { display: inline-block; background: #EEF2FF; color: #4F46E5; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600; }
          .detail-box { background: #F9FAFB; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E5E7EB; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { color: #6B7280; font-size: 14px; }
          .detail-value { color: #1F2937; font-size: 14px; font-weight: 600; }
          .footer { background: #F9FAFB; padding: 20px 32px; text-align: center; border-top: 1px solid #E5E7EB; }
          .footer p { color: #9CA3AF; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>HireNest Elite</h1>
            <p>Your Career, Elevated</p>
          </div>
          <div class="content">
            <h2>Application Submitted Successfully!</h2>
            <p>Hi <strong>${candidateName}</strong>,</p>
            <p>Your application has been submitted successfully. Here are the details:</p>
            <div class="detail-box">
              <div class="detail-row">
                <span class="detail-label">Position</span>
                <span class="detail-value">${jobTitle}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Company</span>
                <span class="detail-value">${company}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Match Score</span>
                <span class="detail-value"><span class="badge">${matchScore}%</span></span>
              </div>
            </div>
            <p>The recruiter will review your application shortly.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} HireNest Elite. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  statusUpdated: ({ candidateName, jobTitle, company, status }) => {
    const statusColors = { shortlisted: '#10B981', interview: '#F59E0B', rejected: '#EF4444', hired: '#10B981' };
    const statusMessages = {
      shortlisted: 'Congratulations! You have been shortlisted for the next round.',
      interview: 'Great news! An interview has been scheduled.',
      rejected: 'Unfortunately, the recruiter has decided to move forward with other candidates.',
      hired: 'Congratulations! You have been selected for the position!',
    };
    return {
      subject: `Application Update - ${jobTitle} at ${company}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 32px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
            .content { padding: 32px; }
            .content h2 { color: #1F2937; margin: 0 0 16px; font-size: 20px; }
            .content p { color: #4B5563; line-height: 1.6; margin: 0 0 12px; }
            .status-badge { display: inline-block; background: ${statusColors[status] || '#6B7280'}20; color: ${statusColors[status] || '#6B7280'}; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
            .detail-box { background: #F9FAFB; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
            .footer { background: #F9FAFB; padding: 20px 32px; text-align: center; border-top: 1px solid #E5E7EB; }
            .footer p { color: #9CA3AF; font-size: 12px; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>HireNest Elite</h1>
            </div>
            <div class="content">
              <h2>Application Status Update</h2>
              <p>Hi <strong>${candidateName}</strong>,</p>
              <p>Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been updated.</p>
              <div class="detail-box">
                <p style="margin-bottom: 8px; color: #6B7280; font-size: 13px;">Current Status</p>
                <div class="status-badge">${status}</div>
              </div>
              <p>${statusMessages[status] || 'Your application status has been updated.'}</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} HireNest Elite. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  },

  interviewScheduled: ({ candidateName, jobTitle, company, interviewDate }) => ({
    subject: `Interview Scheduled - ${jobTitle} at ${company}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 32px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .content { padding: 32px; }
          .content h2 { color: #1F2937; margin: 0 0 16px; font-size: 20px; }
          .content p { color: #4B5563; line-height: 1.6; margin: 0 0 12px; }
          .interview-box { background: linear-gradient(135deg, #EEF2FF, #E0E7FF); border: 2px solid #C7D2FE; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; }
          .interview-date { color: #4F46E5; font-size: 22px; font-weight: 700; margin: 8px 0; }
          .footer { background: #F9FAFB; padding: 20px 32px; text-align: center; border-top: 1px solid #E5E7EB; }
          .footer p { color: #9CA3AF; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>HireNest Elite</h1>
          </div>
          <div class="content">
            <h2>Interview Scheduled!</h2>
            <p>Hi <strong>${candidateName}</strong>,</p>
            <p>Your interview for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been scheduled.</p>
            <div class="interview-box">
              <p style="color: #6B7280; margin: 0; font-size: 13px;">INTERVIEW DATE</p>
              <p class="interview-date">${new Date(interviewDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p style="color: #4F46E5; margin: 0; font-size: 15px;">${new Date(interviewDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <p>Please ensure you are available at the scheduled time. Good luck!</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} HireNest Elite. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  recruiterApproved: ({ recruiterName, companyName }) => ({
    subject: 'Account Approved - Welcome to HireNest Elite!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #10B981, #059669); padding: 32px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .content { padding: 32px; }
          .content h2 { color: #1F2937; margin: 0 0 16px; }
          .content p { color: #4B5563; line-height: 1.6; margin: 0 0 12px; }
          .footer { background: #F9FAFB; padding: 20px 32px; text-align: center; border-top: 1px solid #E5E7EB; }
          .footer p { color: #9CA3AF; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Account Approved!</h1>
          </div>
          <div class="content">
            <h2>Welcome to HireNest Elite!</h2>
            <p>Hi <strong>${recruiterName}</strong>,</p>
            <p>Your recruiter account for <strong>${companyName}</strong> has been approved.</p>
            <p>You can now:</p>
            <ul style="color: #4B5563; line-height: 2;">
              <li>Post job listings</li>
              <li>Review applications</li>
              <li>Manage your hiring pipeline</li>
              <li>Access recruiter analytics</li>
            </ul>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} HireNest Elite. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

const sendOtpEmail = async (userEmail, data) => {
  const template = emailTemplates.otpVerification(data);
  return sendEmail({ to: userEmail, ...template });
};

const sendApplicationEmail = async (candidateEmail, data) => {
  const template = emailTemplates.applicationSubmitted(data);
  return sendEmail({ to: candidateEmail, ...template });
};

const sendStatusUpdateEmail = async (candidateEmail, data) => {
  const template = emailTemplates.statusUpdated(data);
  return sendEmail({ to: candidateEmail, ...template });
};

const sendInterviewEmail = async (candidateEmail, data) => {
  const template = emailTemplates.interviewScheduled(data);
  return sendEmail({ to: candidateEmail, ...template });
};

const sendApprovalEmail = async (recruiterEmail, data) => {
  const template = emailTemplates.recruiterApproved(data);
  return sendEmail({ to: recruiterEmail, ...template });
};

module.exports = {
  sendEmail,
  sendOtpEmail,
  sendApplicationEmail,
  sendStatusUpdateEmail,
  sendInterviewEmail,
  sendApprovalEmail,
};
