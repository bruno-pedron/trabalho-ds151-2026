import { AuthContext } from "@/contexts/AuthContext";
import { useContext } from "react";

// 3. Hook customizado para facilitar o uso nas telas
export const useAuth = () => useContext(AuthContext);
