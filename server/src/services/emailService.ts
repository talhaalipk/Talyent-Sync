// emailService.ts
import nodemailer from 'nodemailer';
import { IUser } from '../Models/user';
import { IJob } from '../Models/job';
import { IProposal } from '../Models/proposal';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true, // ✅ Reuse connections
  maxConnections: 5,
  maxMessages: 100,
  connectionTimeout: 10000, // 10 seconds (reduced)
  greetingTimeout: 10000,
  socketTimeout: 10000,
  // ✅ Disable TLS verification if needed (only for development)
  // tls: { rejectUnauthorized: false }
});

// ✅ Verify connection on startup (optional)
transporter.verify((error) => {
  if (error) {
    console.error('❌ Email transporter error:', error.message);
  } else {
    console.log('✅ Email service ready');
  }
});

// ✅ Improved retry with faster timeouts
const sendEmailWithRetry = async (
  to: string,
  subject: string,
  html: string,
  retries = 2 // Reduced from 3
) => {
  for (let i = 0; i < retries; i++) {
    try {
      await transporter.sendMail({
        from: `"Your App" <${process.env.EMAIL_USER}>`, // Better sender name
        to,
        subject,
        html,
      });
      
      // Only log in development
      if (process.env.NODE_ENV !== 'production') {
        console.log(`✅ Email sent to ${to}`);
      }
      return;
    } catch (error: any) {
      const isLastAttempt = i === retries - 1;
      
      if (isLastAttempt) {
        // Log error but don't break functionality
        console.error(`❌ Email failed for ${to}:`, error.message);
        
        // TODO: Add to dead letter queue or error tracking service
        // e.g., Sentry.captureException(error);
        return;
      }
      
      // Shorter backoff: 1s, 2s (total max 3s vs your 12s)
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// ✅ Async wrapper - ensures emails never block responses
export const sendEmail = (to: string, subject: string, html: string) => {
  // Fire and forget
  setImmediate(() => {
    sendEmailWithRetry(to, subject, html).catch(err => {
      console.error('Background email error:', err.message);
    });
  });
};

// 📩 When freelancer sends proposal
export const sendProposalNotificationEmail = async (
  client: IUser,
  freelancer: IUser,
  job: IJob,
  proposal: IProposal
) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { background-color: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>New Proposal Received!</h2>
          <p><strong>Job:</strong> ${job.title}</p>
          <p><strong>From:</strong> ${freelancer.name || freelancer.UserName}</p>
          <p><strong>Description:</strong> ${proposal.proposalDesc}</p>
          <a href="${process.env.FRONTEND_URL}/jobs/${job._id}" class="button">
            View Proposal
          </a>
        </div>
      </body>
    </html>
  `;

  sendEmail(
    client.email,
    `New Proposal for "${job.title}"`,
    html
  );
};

// 📩 When client accepts/rejects proposal
export const sendProposalStatusEmail = async (
  freelancer: IUser,
  job: IJob,
  status: 'accepted' | 'rejected'
) => {
  const statusColor = status === 'accepted' ? '#28a745' : '#dc3545';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .status { color: ${statusColor}; font-weight: bold; text-transform: uppercase; }
          .button { background-color: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Proposal Update</h2>
          <p><strong>Job:</strong> ${job.title}</p>
          <p>Your proposal has been <span class="status">${status}</span></p>
          <a href="${process.env.FRONTEND_URL}/proposals" class="button">
            View All Proposals
          </a>
        </div>
      </body>
    </html>
  `;

  sendEmail(
    freelancer.email,
    `Proposal ${status.charAt(0).toUpperCase() + status.slice(1)} - ${job.title}`,
    html
  );
};

// ✅ Graceful shutdown
process.on('SIGTERM', () => {
  transporter.close();
  console.log('Email transporter closed');
});