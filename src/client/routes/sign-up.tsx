import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/web/components/ui/button";
import { trpc } from "@/web/utils/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/web/components/ui/card";

import * as z from "zod";
import AutoForm, { AutoFormSubmit } from "../components/auto-form";
import { useId } from "react";
import { toast } from "sonner";

const signUpSchema = z.object({
  email: z
    .string({
      required_error: "Username is required.",
    })
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .email(),

  password: z
    .string({
      required_error: "Password is required.",
    })

    .describe("Password")
    .min(8, {
      message: "Password must be at least 8 characters.",
    }),
});

export const Route = createFileRoute("/sign-up")({
  component: SignUp,
});

function SignUp() {
  const formId = useId();
  const { mutate } = trpc.auth.sign_up.useMutation();

  return (
    <div className="flex items-center justify-center gap-3 flex-wrap h-screen p-3">
      <Card className="max-w-sm w-full">
        <CardHeader>
          <CardTitle>Sing Up</CardTitle>
          <CardDescription>
            Create an account and start using the app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AutoForm
            formId={formId}
            formSchema={signUpSchema}
            onSubmit={(values, formResetHandler) => {
              mutate(values, {
                onSuccess: (data) => {
                  toast.success(data.message);
                  formResetHandler();
                },
              });
            }}
            fieldConfig={{
              password: {
                inputProps: {
                  type: "password",
                  placeholder: "••••••••",
                },
              },
            }}
          />
        </CardContent>
        <CardFooter>
          <AutoFormSubmit form={formId}>Register</AutoFormSubmit>
        </CardFooter>
      </Card>
    </div>
  );
}
