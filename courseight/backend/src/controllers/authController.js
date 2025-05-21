const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || "student",
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Login a user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Store user data in session
    req.session.userId = user._id;
    req.session.isLoggedIn = true;

    res.status(200).json({
      message: "Login successful",
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Logout user
exports.logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.status(200).json({ message: "Logout successful" });
  });
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token (in a real app, send this via email)
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    res.status(200).json({
      message: "Password reset token generated",
      resetToken, // In production, don't send this in the response
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password successfully reset" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = {};
    const allowedUpdates = ['username', 'email'];
    
    // Only allow specific fields to be updated
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    const user = await User.findByIdAndUpdate(
      req.user._id, 
      updates, 
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifySession = async (req, res) => {
  try {
    // Jika req.user ada, berarti middleware auth sudah memverifikasi session
    if (req.user) {
      return res.status(200).json({
        isAuthenticated: true,
        user: {
          id: req.user._id,
          username: req.user.username,
          email: req.user.email,
          role: req.user.role,
        },
      });
    }

    // Jika tidak ada session
    return res.status(401).json({
      isAuthenticated: false,
      message: "Session not valid or expired",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};