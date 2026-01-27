import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, type RegisterType } from "../types/register-schema";
import { useRegisterMutation } from "./use-register-mutation";

export const useRegisterForm = () => {
  const form = useForm<RegisterType>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      organizationName: "",
      organizationSlug: "",
      organizationAddress: "",
      organizationPhone: "",
      organizationEmail: "",
    },
  });

  const { mutate, isPending } = useRegisterMutation();

  function onSubmit(values: RegisterType) {
    mutate(values, {
      onSuccess: (data) => {
        console.log("Register Values:", values);
        console.log("Response:", data);
        alert("Register form submitted! Check console for values.");
      },
      onError: (error) => {
        console.error("Register error:", error);
        alert("Register failed. Please try again.");
      }
    });
  }

  return {
    form,
    onSubmit,
    isPending,
  };
};
