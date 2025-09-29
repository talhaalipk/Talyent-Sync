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
  // Add timeout configurations
  connectionTimeout: 60000, // 60 seconds
  greetingTimeout: 30000,   // 30 seconds
  socketTimeout: 60000,     // 60 seconds
});

// Helper function with retry logic
const sendEmailWithRetry = async (to: string, subject: string, html: string, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
      });
      console.log(`✅ Email sent successfully to ${to}`);
      return; // Success, exit retry loop
    } catch (error: any) {
      console.log(`❌ Email attempt ${i + 1} failed for ${to}:`, error.message);
      
      if (i === retries - 1) {
        // Last attempt failed, log but don't throw to prevent breaking the main process
        console.error(`❌ Final email attempt failed for ${to}:`, error);
        return; // Don't throw error to prevent breaking deposit/main functionality
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1))); // Exponential backoff
    }
  }
};

export const sendEmail = sendEmailWithRetry;

// 📩 Existing function: when freelancer sends proposal
export const sendProposalNotificationEmail = async (
  client: IUser,
  freelancer: IUser,
  job: IJob,
  proposal: IProposal
) => {
  try {
    const html = `
      <h2>New Proposal Received!</h2>
      <p><strong>Job:</strong> ${job.title}</p>
      <p><strong>From:</strong> ${freelancer.name || freelancer.UserName}</p>
      <p><strong>Description:</strong> ${proposal.proposalDesc}</p>
    `;

    await sendEmailWithRetry(
      client.email,
      `New Proposal Received for "${job.title}"`,
      html
    );
    
    console.log(`📧 Proposal notification email sent to ${client.email}`);
  } catch (error) {
    console.error('❌ Error sending proposal notification email:', error);
    // Don't throw error to prevent breaking the main functionality
  }
};

// 📩 New function: when client accepts/rejects proposal
export const sendProposalStatusEmail = async (
  freelancer: IUser,
  job: IJob,
  status: 'accepted' | 'rejected'
) => {
  try {
    const html = `
      <h2>Your Proposal has been ${status}!</h2>
      <p><strong>Job:</strong> ${job.title}</p>
      <p>The client has <strong>${status}</strong> your proposal.</p>
      <a href="${process.env.FRONTEND_URL}/proposals"
         style="background-color:#007bff;color:white;padding:10px 20px;
                text-decoration:none;border-radius:5px;">
        View Proposal
      </a>
    `;

    await sendEmailWithRetry(
      freelancer.email,
      `Your Proposal has been ${status}`,
      html
    );

    console.log(`📧 Proposal ${status} email sent to ${freelancer.email}`);
  } catch (error) {
    console.error('❌ Error sending proposal status email:', error);
    // Don't throw error to prevent breaking the main functionality
  }
};