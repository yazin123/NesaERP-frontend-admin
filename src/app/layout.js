// src/app/layout.js
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "ERP",
  description: "ERP build by yazin",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
      <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#000',
                color: '#fff',
              },
            }}
          />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}