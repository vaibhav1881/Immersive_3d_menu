const jwt = require('jsonwebtoken');
const { User, Restaurant } = require('../models');
const { asyncHandler } = require('../middleware');

/**
 * Generate JWT token
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
    const { email, password, name, phone, restaurantName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: 'User already exists with this email'
        });
    }

    // Create user
    const user = await User.create({
        email,
        password,
        name,
        phone,
        role: 'restaurant_owner'
    });

    // If restaurant name provided, create restaurant
    if (restaurantName) {
        const restaurant = await Restaurant.create({
            name: restaurantName,
            owner: user._id
        });

        user.restaurant = restaurant._id;
        await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                restaurant: user.restaurant
            },
            token
        }
    });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password').populate('restaurant');

    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
        });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
        });
    }

    // Check if user is active
    if (!user.isActive) {
        return res.status(401).json({
            success: false,
            message: 'Your account has been deactivated'
        });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                restaurant: user.restaurant
            },
            token
        }
    });
});

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).populate('restaurant');

    res.json({
        success: true,
        data: {
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                role: user.role,
                restaurant: user.restaurant,
                isEmailVerified: user.isEmailVerified
            }
        }
    });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
    const { name, phone } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user.id,
        { name, phone },
        { new: true, runValidators: true }
    ).populate('restaurant');

    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
    });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        return res.status(400).json({
            success: false,
            message: 'Current password is incorrect'
        });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    res.json({
        success: true,
        message: 'Password changed successfully',
        data: { token }
    });
});

/**
 * @desc    Request OTP for verification
 * @route   POST /api/auth/otp/request
 * @access  Private
 */
const requestOTP = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    const otp = user.generateOTP();
    await user.save();

    // In production, send OTP via SMS/email
    // For now, we'll return it in response (dev only)
    console.log(`OTP for ${user.email}: ${otp}`);

    res.json({
        success: true,
        message: 'OTP sent successfully',
        ...(process.env.NODE_ENV === 'development' && { otp })
    });
});

/**
 * @desc    Verify OTP
 * @route   POST /api/auth/otp/verify
 * @access  Private
 */
const verifyOTP = asyncHandler(async (req, res) => {
    const { otp } = req.body;

    const user = await User.findById(req.user.id);

    if (!user.verifyOTP(otp)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or expired OTP'
        });
    }

    // Clear OTP and mark email as verified
    user.otp = undefined;
    user.isEmailVerified = true;
    await user.save();

    res.json({
        success: true,
        message: 'OTP verified successfully'
    });
});

/**
 * @desc    Logout user (client-side token removal)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
    requestOTP,
    verifyOTP,
    logout
};
