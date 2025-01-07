"use client";

/**
 * v0 by Vercel.
 * @see https://v0.dev/t/1ADs2FRNaQg
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */

import { FC, useState } from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/buttons/button";

import { login, signup } from "@/app/(main)/login/actions";

const Login: FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Setup formData
    const formData = new FormData(e.target as HTMLFormElement);
    formData.set("email", email);
    formData.set("password", password);

    // Check if signup and passwords match
    if (!isLogin) {
      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }
    }

    try {
      if (isLogin) {
        await login(formData);
      } else {
        await signup(formData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card className="h-screen md:h-auto flex flex-col justify-center w-full md:max-w-lg mx-auto">
      <CardHeader className="space-y-1">
        {/* Title */}
        <CardTitle className="text-2xl font-bold">
          {isLogin ? "Welcome Back!" : "Join the Party!"}
        </CardTitle>

        {/* Description */}
        <CardDescription>
          {isLogin
            ? "Hope you remember your password."
            : "Create an account to get started."}{" "}
          <button
            className="text-pink-500 cursor-pointer"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </CardDescription>
      </CardHeader>

      {/* Form */}
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-start space-y-4 "
        >
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Confirm Password */}
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          {/* Submit */}
          <Button type="submit" className="bg-sky-600">
            {isLogin ? "Login" : "Sign Up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default Login;
