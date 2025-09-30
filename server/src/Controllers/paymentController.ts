import { Request, Response } from 'express';
import Stripe from 'stripe';
import { Wallet } from '../Models/Wallet';
import { User } from '../Models/user';
import { sendEmail } from '../services/emailService'; // helper wrapping nodemailer
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// // ------------------ Deposit ------------------
// export const deposit = async (req: Request, res: Response) => {
//     try {
//         const { amount } = req.body;
//         const userId = (req as any).user.id; // from protect middleware

//         if (!amount || isNaN(amount) || amount <= 0) {
//             return res.status(400).json({ message: "Invalid deposit amount" });
//         }

//         // ✅ Create Stripe Checkout Session
//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ["card"],
//             mode: "payment",
//             line_items: [
//                 {
//                     price_data: {
//                         currency: "usd",
//                         product_data: { name: "Wallet Deposit" },
//                         unit_amount: Math.round(amount * 100), // Stripe expects cents
//                     },
//                     quantity: 1,
//                 },
//             ],
//             success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
//             cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
//             metadata: { userId, type: "deposit" },
//         });

//         console.log(session.url)

//         return res.json({ url: session.url });
//     } catch (error) {
//         console.error("❌ Deposit Error:", error);
//         return res.status(500).json({ message: "Server error in deposit" });
//     }
// };

// ------------------ Deposit ------------------
export const deposit = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    const userId = (req as any).user.id; // from protect middleware

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Invalid deposit amount' });
    }

    // ✅ Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Wallet Deposit' },
            unit_amount: Math.round(amount * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: { userId, type: 'deposit' },
    });

    // ✅ Send email to user about deposit initiation
    // const user = await User.findById(userId).select('email name');
    // if (user) {
    //   await sendEmail(
    //     user.email,
    //     'Deposit Initiated',
    //     `<p>Hello ${user.name || 'User'},</p>
    //              <p>You initiated a deposit of <strong>$${amount}</strong>.</p>
    //              <p>Please complete the payment through Stripe checkout.</p>`
    //   );
    // }

    console.log(session.url);
    return res.json({ url: session.url });
  } catch (error) {
    console.error('❌ Deposit Error:', error);
    return res.status(500).json({ message: 'Server error in deposit' });
  }
};

export const confirmDeposit = async (req: Request, res: Response) => {
  try {
    const { session_id } = req.query;
    const userId = (req as any).user.id;

    if (!session_id) {
      return res.status(400).json({ message: 'Missing session_id' });
    }

    // Expand payment_intent so we can record it (optional)
    const session = await stripe.checkout.sessions.retrieve(
      session_id as string,
      {
        expand: ['payment_intent'],
      }
    );

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    const amount = Number(session.amount_total) / 100; // cents -> dollars
    const stripeSessionId = session.id;
    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : (session.payment_intent as any)?.id;

    const ledgerEntry = {
      type: 'Deposit',
      amount,
      note: `$${amount} deposit in account`,
      createdAt: new Date(),
      stripeSessionId,
      paymentIntentId,
    };

    // 1) Try an atomic update: only update if there is no ledger entry with this session id
    const filter = {
      userId: new mongoose.Types.ObjectId(userId),
      'ledger.stripeSessionId': { $ne: stripeSessionId }, // match only if session id not present
    };

    const update = {
      $inc: { availableBalance: amount },
      $push: { ledger: ledgerEntry },
    };

    // Try to update an existing wallet atomically
    let wallet = await Wallet.findOneAndUpdate(filter, update, { new: true });

    if (wallet) {
      // success: we updated and returned the new wallet
      return res.json({ message: 'Deposit successful', wallet });
    }

    // If we get here, either:
    // - wallet didn't exist (so update didn't match), OR
    // - wallet exists but already has this stripeSessionId (deposit already applied)
    const existingWallet = await Wallet.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (existingWallet) {
      // if ledger already contains this session id -> deposit already confirmed
      const already = existingWallet.ledger?.some(
        (l: any) =>
          l.stripeSessionId === stripeSessionId ||
          l.paymentIntentId === paymentIntentId
      );

      if (already) {
        return res.json({
          message: 'Deposit already confirmed',
          wallet: existingWallet,
        });
      }

      // Unexpected branch: wallet exists but atomic update failed — fall back to adding entry atomically using $push
      // (should be rare). We try one more time safely without assuming anything.
      wallet = await Wallet.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId) },
        update,
        { new: true }
      );
      return res.json({ message: 'Deposit successful', wallet });
    }

    // Wallet didn't exist at all — create a new wallet with the ledger entry
    const newWallet = await Wallet.create({
      userId: new mongoose.Types.ObjectId(userId),
      availableBalance: amount,
      pendingBalance: 0,
      totalEarning: 0,
      totalWithdraw: 0,
      ledger: [ledgerEntry],
    });

    return res.json({ message: 'Deposit successful', wallet: newWallet });
  } catch (error) {
    console.error('❌ Confirm Deposit Error:', error);
    return res.status(500).json({ message: 'Server error in confirm deposit' });
  }
};

// // ------------------ Withdraw ------------------
// export const withdraw = async (req: Request, res: Response) => {
//     try {
//         const { amount } = req.body;
//         const userId = (req as any).user.id;

//         if (!amount || isNaN(amount) || amount <= 0) {
//             return res.status(400).json({ message: "Invalid withdraw amount" });
//         }

//         const wallet = await Wallet.findOne({ userId });
//         if (!wallet) {
//             return res.status(404).json({ message: "Wallet not found" });
//         }

//         if (wallet.availableBalance < amount) {
//             return res.status(400).json({ message: "Insufficient balance" });
//         }

//         // ✅ Update wallet balances
//         wallet.availableBalance -= amount;
//         wallet.totalWithdraw = (wallet.totalWithdraw || 0) + amount; // increment withdraw total
//         wallet.ledger.push({
//             type: "withdraw",
//             amount,
//             note: `$${amount} withdrawn from account`,
//             createdAt: new Date(),
//         });

//         await wallet.save();

//         // ✅ Send email
//         const user = await User.findById(userId).select("email name");
//         if (user) {
//             await sendEmail(
//                 user.email,
//                 "Withdrawal Successful",
//                 `<p>Hello ${user.name || "User"},</p>
//          <p>Your withdrawal of <strong>$${amount}</strong> was successful.</p>`
//             );
//         }

//         return res.json({ message: "Withdrawal successful" });
//     } catch (error) {
//         console.error("❌ Withdraw Error:", error);
//         return res.status(500).json({ message: "Server error in withdraw" });
//     }
// };

// ------------------ Withdraw ------------------
export const withdraw = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    const userId = (req as any).user.id;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Invalid withdraw amount' });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (wallet.availableBalance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // ✅ Update wallet balances
    wallet.availableBalance -= amount;
    wallet.totalWithdraw = (wallet.totalWithdraw || 0) + amount; // increment withdraw total
    wallet.ledger.push({
      type: 'withdraw',
      amount,
      note: `$${amount} withdrawn from account`,
      createdAt: new Date(),
    });

    await wallet.save();

    // ✅ Send email (already present, just confirming)
    const user = await User.findById(userId).select('email name');
    if (user) {
      await sendEmail(
        user.email,
        'Withdrawal Successful',
        `<p>Hello ${user.name || 'User'},</p>
                 <p>Your withdrawal of <strong>$${amount}</strong> was successful.</p>`
      );
    }

    return res.json({ message: 'Withdrawal successful' });
  } catch (error) {
    console.error('❌ Withdraw Error:', error);
    return res.status(500).json({ message: 'Server error in withdraw' });
  }
};

// ------------------ Add Ledger Entry ------------------
export const addLedgerEntry = async (req: Request, res: Response) => {
  try {
    const { clientId, freelancerId, contractId, type, amount, note } = req.body;

    if (!clientId || !freelancerId || !contractId || !type || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Load both wallets
    const clientWallet = await Wallet.findOne({ userId: clientId });
    const freelancerWallet = await Wallet.findOne({ userId: freelancerId });

    if (!clientWallet || !freelancerWallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Load users for email
    const clientUser = await User.findById(clientId).select('email name');
    const freelancerUser =
      await User.findById(freelancerId).select('email name');

    switch (type) {
      case 'escrow_funded':
        // Client side
        clientWallet.availableBalance -= amount;
        clientWallet.ledger.push({
          type: 'escrow_funded',
          amount: -amount,
          contractId,
          note,
          createdAt: new Date(),
        });

        // Freelancer side
        freelancerWallet.pendingBalance += amount;
        freelancerWallet.ledger.push({
          type: 'escrow_funded',
          amount: +amount,
          contractId,
          note,
          createdAt: new Date(),
        });

        break;

      case 'escrow_released':
        // Client ledger only (balance already dropped earlier)
        clientWallet.ledger.push({
          type: 'escrow_released',
          amount: -amount,
          contractId,
          note,
          createdAt: new Date(),
        });

        // Freelancer balance moves from pending → available
        freelancerWallet.pendingBalance -= amount;
        freelancerWallet.availableBalance += amount;
        freelancerWallet.totalEarning =
          (freelancerWallet.totalEarning || 0) + amount;
        freelancerWallet.ledger.push({
          type: 'escrow_released',
          amount: +amount,
          contractId,
          note,
          createdAt: new Date(),
        });

        break;

      case 'refund':
        // Client refunded
        clientWallet.availableBalance += amount;
        clientWallet.ledger.push({
          type: 'refund',
          amount: +amount,
          contractId,
          note,
          createdAt: new Date(),
        });

        // Freelancer loses pending
        freelancerWallet.pendingBalance -= amount;

        freelancerWallet.ledger.push({
          type: 'refund',
          amount: -amount,
          contractId,
          note,
          createdAt: new Date(),
        });

        break;

      default:
        return res.status(400).json({ message: 'Invalid ledger type' });
    }

    await clientWallet.save();
    await freelancerWallet.save();

    // ✅ Send notification emails
    if (clientUser && freelancerUser) {
      await sendEmail(
        clientUser.email,
        `Wallet Update - ${type}`,
        `<p>Hello ${clientUser.name || 'Client'},</p>
         <p>Your wallet was updated with transaction:</p>
         <p><strong>${note}</strong></p>
         <p>Amount: $${amount}</p>`
      );

      await sendEmail(
        freelancerUser.email,
        `Wallet Update - ${type}`,
        `<p>Hello ${freelancerUser.name || 'Freelancer'},</p>
         <p>Your wallet was updated with transaction:</p>
         <p><strong>${note}</strong></p>
         <p>Amount: $${amount}</p>`
      );
    }

    return res.json({ message: 'Ledger entry added successfully' });
  } catch (error) {
    console.error('❌ Ledger Entry Error:', error);
    return res.status(500).json({ message: 'Server error in addLedgerEntry' });
  }
};

// ------------------ Get Wallet ------------------
export const getWallet = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const wallet = await Wallet.findOne({ userId }).populate(
      'userId',
      'name email role'
    );

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    return res.json({
      user: wallet.userId,
      availableBalance: wallet.availableBalance,
      pendingBalance: wallet.pendingBalance,
      ledger: wallet.ledger.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      ), // newest first
      createdAt: wallet.createdAt,
      totalEarning: wallet.totalEarning, // from Freelancer
      totalWithdraw: wallet.totalWithdraw,
    });
  } catch (error) {
    console.error('❌ Get Wallet Error:', error);
    return res.status(500).json({ message: 'Server error in getWallet' });
  }
};
