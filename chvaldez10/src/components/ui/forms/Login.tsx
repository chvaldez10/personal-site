"use client";

/**
 * v0 by Vercel.
 * @see https://v0.dev/t/1ADs2FRNaQg
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */

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
import React, { useState } from "react";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);

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
        <div className="flex flex-col justify-start space-y-4 ">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>

          {/* Confirm Password */}
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" required />
            </div>
          )}

          {/* Submit */}
          <Button type="submit" className="bg-sky-600">
            {isLogin ? "Login" : "Sign Up"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Login;
