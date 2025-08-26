"use client";

import * as z from "zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { registerSchema } from "../../schemas";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { FormError } from "@/components/ui/form-error";
import { FormSuccess } from "@/components/ui/form-success";

import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

export const RegisterForm = () => {
    const trpc = useTRPC();

    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: "",
            name: "",
            password: "",
            confirmPassword: "",
            role: "user",
        }
    });

    const registerMutation = useMutation(trpc.session.register.mutationOptions({
        onSuccess: (data) => {
            setSuccess("Registration successful!");
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

    const onSubmit = (values: z.infer<typeof registerSchema>) => {
        startTransition(() => {
            setError("");
            setSuccess("");

            registerMutation.mutate({
                ...values,
                ipAddress: undefined,
                userAgent: navigator.userAgent,
            });
        })
    };

    return (
        <CardWrapper
            headerLabel="Create an account"
            backButtonLabel="Already have an account? Log in."
            backButtonHref="/login"
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
                                            disabled={isPending}
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
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full name</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isPending || registerMutation.isPending}
                                            {...field}
                                            placeholder="Full name"
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
                                            disabled={isPending || registerMutation.isPending}
                                            {...field}
                                            placeholder="******"
                                            type="password"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm password</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isPending || registerMutation.isPending}
                                            {...field}
                                            placeholder="******"
                                            type="password"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select
                                        disabled={isPending || registerMutation.isPending}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormError message={error} />
                    <FormSuccess message={success} />
                    <Button
                        disabled={isPending || registerMutation.isPending}
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 cursor-pointer"
                    >
                        Register
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}