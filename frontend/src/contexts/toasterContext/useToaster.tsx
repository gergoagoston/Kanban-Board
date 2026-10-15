import { useContext } from "react";
import { ToastContext } from "./ToasterContex";

export const useToast = () => useContext(ToastContext);