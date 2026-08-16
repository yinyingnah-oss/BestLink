import { useAppContext } from "./useAppContext";

export function useAuth() {
  const { currentUser } = useAppContext();
  return {
    user: currentUser,
    isAuthenticated: !!currentUser,
  };
}
