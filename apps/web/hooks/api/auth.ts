import { trpc } from "~/trpc/client";

export function useSignUp() {
    const {
        mutateAsync: createUserWithEmailAndPasswordAsync, 
        mutate: createUserWithEmailAndPassword, 
        error, 
        failureCount, 
        isError, 
        isIdle, 
        isSuccess, 
        isPending, 
        status,
        reset,
        context
    } = trpc.auth.createUserWithEmailAndPassword.useMutation();

    return {
        createUserWithEmailAndPasswordAsync,
        createUserWithEmailAndPassword,
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        isPending,
        status,
        reset,
        context,
    }
}