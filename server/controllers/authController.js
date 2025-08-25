const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { supabase } = require('../config/database');
const { sendOTP, verifyOTP } = require('../services/otpService');
const { generateTokens, verifyRefreshToken } = require('../services/tokenService');

class AuthController {
  // Send OTP for authentication
  async sendOTP(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { contact, method } = req.body;
      
      // Send OTP
      const otpResult = await sendOTP(contact, method);
      
      res.json({
        success: true,
        message: 'OTP sent successfully',
        data: { 
          otpId: otpResult.otpId,
          expiresIn: 300 // 5 minutes
        }
      });
    } catch (error) {
      console.error('Send OTP Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP'
      });
    }
  }

  // Verify OTP and check user existence
  async verifyOTP(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { contact, otp, method } = req.body;
      
      // Verify OTP
      const isValid = await verifyOTP(contact, otp);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP'
        });
      }

      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .or(method === 'email' ? `email.eq.${contact}` : `phone.eq.${contact}`)
        .eq('is_active', true)
        .single();

      res.json({
        success: true,
        message: 'OTP verified successfully',
        data: {
          userExists: !!existingUser,
          user: existingUser || null,
          requiresRegistration: !existingUser
        }
      });
    } catch (error) {
      console.error('Verify OTP Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify OTP'
      });
    }
  }

  // Register new user
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { name, email, phone, role, region, schoolCode, schoolName } = req.body;
      let schoolId;

      // Handle school logic based on role
      if (role === 'admin') {
        if (schoolCode) {
          // Join existing school as admin
          const { data: school, error } = await supabase
            .from('schools')
            .select('id')
            .eq('code', schoolCode)
            .single();

          if (error || !school) {
            return res.status(400).json({
              success: false,
              message: 'Invalid school code'
            });
          }
          schoolId = school.id;
        } else if (schoolName) {
          // Create new school
          const newSchoolCode = `SCH${Date.now()}`;
          const { data: newSchool, error } = await supabase
            .from('schools')
            .insert({
              name: schoolName,
              code: newSchoolCode,
              region: region || 'Default Region',
              admin_email: email
            })
            .select()
            .single();

          if (error) {
            return res.status(400).json({
              success: false,
              message: 'Failed to create school'
            });
          }
          schoolId = newSchool.id;
        } else {
          return res.status(400).json({
            success: false,
            message: 'School code or name is required for admin registration'
          });
        }
      } else {
        // Non-admin users must provide school code
        if (!schoolCode) {
          return res.status(400).json({
            success: false,
            message: 'School code is required'
          });
        }

        const { data: school, error } = await supabase
          .from('schools')
          .select('id')
          .eq('code', schoolCode)
          .single();

        if (error || !school) {
          return res.status(400).json({
            success: false,
            message: 'Invalid school code'
          });
        }
        schoolId = school.id;
      }

      // Create user
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          name,
          email,
          phone,
          role,
          school_id: schoolId,
          is_active: true
        })
        .select()
        .single();

      if (userError) {
        if (userError.code === '23505') {
          return res.status(409).json({
            success: false,
            message: 'User with this email already exists'
          });
        }
        throw userError;
      }

      // Generate tokens
      const tokens = generateTokens({
        userId: user.id,
        schoolId: user.school_id,
        role: user.role
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            schoolId: user.school_id
          },
          ...tokens
        }
      });
    } catch (error) {
      console.error('Registration Error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed'
      });
    }
  }

  // Login existing user
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { contact, method } = req.body;

      // Find user
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .or(method === 'email' ? `email.eq.${contact}` : `phone.eq.${contact}`)
        .eq('is_active', true)
        .single();

      if (error || !user) {
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive'
        });
      }

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      // Generate tokens
      const tokens = generateTokens({
        userId: user.id,
        schoolId: user.school_id,
        role: user.role
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            schoolId: user.school_id
          },
          ...tokens
        }
      });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed'
      });
    }
  }

  // Refresh access token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required'
        });
      }

      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      // Verify user still exists and is active
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .eq('is_active', true)
        .single();

      if (error || !user) {
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive'
        });
      }

      // Generate new tokens
      const tokens = generateTokens({
        userId: user.id,
        schoolId: user.school_id,
        role: user.role
      });

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: tokens
      });
    } catch (error) {
      console.error('Refresh Token Error:', error);
      res.status(500).json({
        success: false,
        message: 'Token refresh failed'
      });
    }
  }

  // Logout user
  async logout(req, res) {
    try {
      // In a production app, you might want to blacklist the token
      // For now, we'll just return success
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout Error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select(`
          *,
          schools(name, code, region)
        `)
        .eq('id', req.userId)
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get Profile Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile'
      });
    }
  }
}

module.exports = new AuthController();
