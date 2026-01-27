import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginType } from "../types/login-schema";
import { useLoginMutation } from "./use-login-mutation";

export const useLoginForm = () => {
  const form = useForm<LoginType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate, isPending } = useLoginMutation();

  function onSubmit(values: LoginType) {
    mutate(values);
  }

  return {
    form,
    onSubmit,
    isPending,
  };
};
