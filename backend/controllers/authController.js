const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register a new user and send OTP
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if verified user exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists && userExists.isVerified) {
      return res.status(400).json({ message: 'An account with this email already exists. Please sign in.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    let user;
    if (userExists && !userExists.isVerified) {
      // Update existing unverified account
      userExists.name = name;
      userExists.password = password; // Will be hashed by pre('save')
      userExists.otp = otp;
      userExists.otpExpires = otpExpires;
      user = await userExists.save();
    } else {
      // Create new unverified user
      user = await User.create({
        name,
        email: normalizedEmail,
        password,
        isVerified: false,
        otp,
        otpExpires,
      });
    }

    // Send OTP via email
    await sendEmail({
      to: normalizedEmail,
      subject: 'Your LifeFlow Verification Code',
      text: `Welcome to LifeFlow! Your 6-digit verification code is: ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background-color: #111827; color: #ffffff; border-radius: 12px; border: 1px solid #374151;">
          <h2 style="color: #3b82f6; margin-top: 0; font-size: 22px;">Welcome to LifeFlow! ⚡</h2>
          <p style="color: #9ca3af; font-size: 14px; line-height: 1.5;">
            Thank you for signing up. Please enter the verification code below in the LifeFlow app to activate your account:
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 14px 28px; background-color: #1f2937; border: 1px solid #3b82f6; border-radius: 8px; color: #60a5fa;">
              ${otp}
            </span>
          </div>
          <p style="color: #9ca3af; font-size: 12px;">
            This code will expire in <strong>10 minutes</strong>. If you did not create a LifeFlow account, please safely ignore this email.
          </p>
        </div>
      `,
    });

    res.status(200).json({
      message: 'Verification code sent to your email. Please verify to complete registration.',
      email: normalizedEmail,
      requiresOtp: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and activate account
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'Account not found. Please register first.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified. Please log in.' });
    }

    // Check code match
    if (!user.otp || user.otp !== String(otp).trim()) {
      return res.status(400).json({ message: 'Invalid verification code. Please check and try again.' });
    }

    // Check expiration
    if (user.otpExpires && user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new code.' });
    }

    // Activate user and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
      message: 'Email verified successfully! Welcome to LifeFlow.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account is already verified. Please sign in.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail({
      to: normalizedEmail,
      subject: 'Your New LifeFlow Verification Code',
      text: `Your new 6-digit verification code is: ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background-color: #111827; color: #ffffff; border-radius: 12px; border: 1px solid #374151;">
          <h2 style="color: #3b82f6; margin-top: 0;">New Verification Code ⚡</h2>
          <p style="color: #9ca3af; font-size: 14px;">Here is your requested verification code:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 14px 28px; background-color: #1f2937; border: 1px solid #3b82f6; border-radius: 8px; color: #60a5fa;">
              ${otp}
            </span>
          </div>
          <p style="color: #9ca3af; font-size: 12px;">This code expires in 10 minutes.</p>
        </div>
      `,
    });

    res.json({ message: 'A fresh verification code has been sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email ? email.toLowerCase().trim() : '';
    const user = await User.findOne({ email: normalizedEmail });

    if (user && (await user.matchPassword(password))) {
      // Check if user has verified their email
      if (user.isVerified === false) {
        return res.status(401).json({
          message: 'Please verify your email before signing in. An OTP is required.',
          requiresOtp: true,
          email: user.email,
        });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Initiate forgot password request and send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    // Send OTP via email
    await sendEmail({
      to: normalizedEmail,
      subject: 'LifeFlow Password Reset Code',
      text: `Your 6-digit password reset code is: ${otp}. It will expire in 15 minutes.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background-color: #111827; color: #ffffff; border-radius: 12px; border: 1px solid #374151;">
          <h2 style="color: #3b82f6; margin-top: 0; font-size: 22px;">Reset Your Password 🔒</h2>
          <p style="color: #9ca3af; font-size: 14px; line-height: 1.5;">
            We received a request to reset your password for your LifeFlow account. Use the verification code below to set a new password:
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 14px 28px; background-color: #1f2937; border: 1px solid #3b82f6; border-radius: 8px; color: #60a5fa;">
              ${otp}
            </span>
          </div>
          <p style="color: #9ca3af; font-size: 12px;">
            This code will expire in <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    res.json({
      message: 'Password reset code sent to your email.',
      email: normalizedEmail,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Reset password using OTP
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, verification code, and new password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Check code match
    if (!user.resetPasswordOtp || user.resetPasswordOtp !== String(otp).trim()) {
      return res.status(400).json({ message: 'Invalid password reset code. Please check and try again.' });
    }

    // Check expiration
    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: 'Password reset code has expired. Please request a new code.' });
    }

    // Set new password (pre-save hook will hash it)
    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    // Also mark as verified if previously unverified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.json({
      message: 'Password has been successfully reset! You can now sign in with your new password.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -otp -otpExpires -resetPasswordOtp -resetPasswordExpires');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user with Google
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential token is missing' });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({ message: 'Google email is not verified' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    // NEW LOGIC: Block new users
    if (!user) {
      return res.status(400).json({ message: 'Account not found. Please sign up first.' });
    }

    // User exists, log them in (also ensure they are verified if not already)
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      message: 'Logged in with Google successfully!',
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Google authentication failed' });
  }
};

module.exports = { registerUser, verifyOTP, resendOTP, loginUser, getMe, forgotPassword, resetPassword, googleLogin };