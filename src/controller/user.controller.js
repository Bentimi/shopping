const User = require("../models/user.models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const crypto = require("crypto");


const signup = async (req, res) => {
    const { name, email, password, gender } = req.body;

    try { 
        if (!name || !email || !password || !gender) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);


        const newuser = new User({
            name,
            email,
            gender,
            password: hashedPassword,
        })

        await newuser.save();

        return res.status(201).json({ message: "User created successfully" });
    } catch (e) {
        console.error("Error during signup", e);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });

        if (!user){
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: "user not verified, please verify your account" });
        }

        const comparePassword = await bcrypt.compare(password, user.password);

        if (!comparePassword) {
            return res.status(401).json({ message: "Inalid Credentials" });
        }

        const token = await jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "2h",
        })

        return res.status(200).json({ message: 'Login successful', token });
    } catch (e) {
        console.error('Error during login', e);
        return res.status(500).json({ message: "internal server error" });
    }
}

const getAllUsers = async (req, res) => {
    const { userId } = req.user;

    try {
        const adminuser = await User.findById(userId);
        if (adminuser.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const users = await User.find().select('-password -otp -otpexpiry');
        return res.status(200).json({ users });
    } catch (e) {
        console.error('Error fetching users', e);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const updateprofile = async (req, res) => {
    const  { userId } = req.user;
    const { name, gender } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updatedData = await User.findByIdAndUpdate(
            userId,
            { name, gender },
            { new: true }
        )

        return res.status(200).json({ message: 'Profile updated successfully', updatedData });
    } catch (e) {
        console.error('Error updating profile', e);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const editprofile = async (req, res) => {

    const { userId } = req.user;
    const { profileId } = req.params;
    const { name, gender, role } = req.body;

    try {
        const userAuth = await User.findById(userId);

        if (userAuth.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        const updatedProfile = await User.findByIdAndUpdate(
            profileId,
            { name, gender, role }
        )
        return res.status(200).json({ message: "Profile updated successfully", updatedProfile });
    } catch (e) {
        console.error('Error updating profile', e);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const deleteprofile =  async (req, res) => {
    const { userId } = req.user;
    const { profileId } = req.params;
    try {
        const userAuth = await User.findById(userId);

        if (!userAuth && userAuth.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        const deletedProfile = await User.findByIdAndDelete(profileId);
        if (!deletedProfile) {
            return res.status(404).json({ message: "Profile not found" });
        }



        return res.status(200).json({ message: "Profile deleted successfully" });
    } catch (e) {
        console.error('Error deleting profile', e);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = { signup, login, getAllUsers, updateprofile, editprofile, deleteprofile };