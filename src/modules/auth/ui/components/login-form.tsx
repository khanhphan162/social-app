"use client";

import * as z from "zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { loginSchema } from "@/db/schema"
import { zodResolver } from "@hookform/resolvers/zod";

import CardWrapper from "./card-wrapper"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { FormError } from "@/components/ui/form-error";
import { FormSuccess } from "@/components/ui/form-success";

import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

export const LoginForm = () => {
    const trpc = useTRPC();
    const mutation = useMutation(trpc.session.login.mutationOptions());

    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        }
    });

    const loginMutation = useMutation(trpc.session.login.mutationOptions({
        onSuccess: (data) => {
            setSuccess("Login successful!");
            setError("");

            document.cookie = `sessionToken=${data.session.token}; path=/; secure; samesite=strict`;

            setTimeout(() => {
                router.push('/');
            }, 1000);
        },
        onError: (error) => {
            setError(error.message);
            setSuccess("");
        },
    })
    );

    const onSubmit = (values: z.infer<typeof loginSchema>) => {
        startTransition(() => {
            setError("");
            setSuccess("");

            loginMutation.mutate({
                ...values,
                ipAddress: undefined,
                userAgent: navigator.userAgent,
            });
        })
    };

    return (
        <CardWrapper
            headerLabel="Log In"
            backButtonLabel="Don't have an account? Sign up."
            backButtonHref="/register"
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isPending || loginMutation.isPending}
                                            {...field}
                                            placeholder="Username"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isPending || loginMutation.isPending}
                                            {...field}
                                            placeholder="******"
                                            type="password"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormError message={error} />
                    <FormSuccess message={success} />
                    <Button
                        disabled={isPending || loginMutation.isPending}
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 cursor-pointer"
                    >
                        Login
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}