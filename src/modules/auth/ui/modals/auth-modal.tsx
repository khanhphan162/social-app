"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, User, UserCheck } from "lucide-react";
import { useState } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    title?: string;
}

export const AuthModal = () => {

    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState('login'); // 'login' or 'register'
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        username: '',
        fullName: '',
        password: '',
        role: ''
    });
    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRoleChange = (value) => {
        setFormData({
            ...formData,
            role: value
        });

    };
    const handleSubmit = () => {
        // Handle form submission logic here
        console.log('Form submitted:', { mode, formData });
    };

    const switchMode = () => {
        setMode(mode === 'login' ? 'register' : 'login');
        // Reset form when switching modes
        setFormData({
            email: '',
            username: '',
            fullName: '',
            password: '',
            role: ''
        });
        setShowPassword(false);
    };
    return (<div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-full">
                    Open Auth Modal
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden">
                <div className="bg-white">
                    <DialogHeader className="p-6 pb-4">
                        <DialogTitle className="text-xl font-semibold text-center">
                            {mode === 'login' ? 'Log In' : 'Sign Up'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="px-6 pb-6">
                        <div className="space-y-4">
                            {/* Username field */}
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                                    Username
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        id="username"
                                        name="username"
                                        type="text"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className="pl-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                                        placeholder="Choose a username"
                                        required
                                    />
                                </div>
                            </div>
                            {/* Full Name Field - Only for Register */}
                            {mode === 'register' && (
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                                        Full Name
                                    </Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            type="text"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            className="pl-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                </div>
                            )}
                            {/* Role Selection - Only for Register */}
                            {mode === 'register' && (
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium text-gray-700">
                                        Choose Your Role
                                    </Label>
                                    <RadioGroup value={formData.role} onValueChange={handleRoleChange} className="space-y-2">
                                        <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                            <RadioGroupItem value="user" id="user" className="text-orange-500" />
                                            <div className="flex items-center space-x-2">
                                                <User className="h-4 w-4 text-gray-500" />
                                                <Label htmlFor="user" className="text-sm font-medium cursor-pointer">
                                                    User
                                                </Label>
                                            </div>
                                            <span className="text-xs text-gray-500 ml-auto">Standard access</span>
                                        </div>
                                        <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                            <RadioGroupItem value="admin" id="admin" className="text-orange-500" />
                                            <div className="flex items-center space-x-2">
                                                <UserCheck className="h-4 w-4 text-gray-500" />
                                                <Label htmlFor="admin" className="text-sm font-medium cursor-pointer">
                                                    Admin
                                                </Label>
                                            </div>
                                            <span className="text-xs text-gray-500 ml-auto">Full platform access</span>
                                        </div>
                                    </RadioGroup>
                                </div>
                            )}

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="pl-10 pr-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                                        placeholder={mode === 'login' ? "Enter your password" : "Create a password"}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Forgot Password - Only for Login */}
                            {mode === 'login' && (
                                <div className="text-right">
                                    <button
                                        type="button"
                                        className="text-sm text-orange-500 hover:text-orange-600 hover:underline"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-full mt-6"
                            >
                                {mode === 'login' ? 'Log In' : 'Sign Up'}
                            </Button>
                        </div>

                        {/* Switch Mode Link */}
                        <div className="text-center mt-6 pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                {mode === 'login' ? "New to this? " : "Already have an account? "}
                                <button
                                    type="button"
                                    onClick={switchMode}
                                    className="text-orange-500 hover:text-orange-600 hover:underline font-medium"
                                >
                                    {mode === 'login' ? 'Sign Up' : 'Log In'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    </div>
    )
}