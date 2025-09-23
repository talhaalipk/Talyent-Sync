// emailService.ts
import nodemailer from 'nodemailer';
import { IUser } from '../Models/user';
import { IJob } from '../Models/job';
import { IProposal } from '../Models/proposal';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};

// 📩 Existing function: when freelancer sends proposal
export const sendProposalNotificationEmail = async (
  client: IUser,
  freelancer: IUser,
  job: IJob,
  proposal: IProposal
) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: client.email,
      subject: `New Proposal Received for "${job.title}"`,
      html: `
        <h2>New Proposal Received!</h2>
        <p><strong>Job:</strong> ${job.title}</p>
        <p><strong>From:</strong> ${freelancer.name || freelancer.UserName}</p>
        <p><strong>Description:</strong> ${proposal.proposalDesc}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Proposal notification email sent to ${client.email}`);
  } catch (error) {
    console.error('❌ Error sending proposal notification email:', error);
  }
};

// 📩 New function: when client accepts/rejects proposal
export const sendProposalStatusEmail = async (
  freelancer: IUser,
  job: IJob,
  status: 'accepted' | 'rejected'
) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: freelancer.email,
      subject: `Your Proposal has been ${status}`,
      html: `
        <h2>Your Proposal has been ${status}!</h2>
        <p><strong>Job:</strong> ${job.title}</p>
        <p>The client has <strong>${status}</strong> your proposal.</p>
        <a href="${process.env.FRONTEND_URL}/proposals"
           style="background-color:#007bff;color:white;padding:10px 20px;
                  text-decoration:none;border-radius:5px;">
          View Proposal
        </a>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Proposal ${status} email sent to ${freelancer.email}`);
  } catch (error) {
    console.error('❌ Error sending proposal status email:', error);
  }
};
