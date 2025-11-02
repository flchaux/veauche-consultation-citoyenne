import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { toast } from "sonner";

const ADMIN_PASSWORD = "vmm4Ever";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      // Stocker l'authentification dans sessionStorage
      sessionStorage.setItem("admin_authenticated", "true");
      setLocation("/admin-secret");
    } else {
      toast.error("Mot de passe incorrect");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-amber-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 border-t-4 border-[#0D6EB2]">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0D6EB2] rounded-full mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Accès Back-Office</h1>
          <p className="text-gray-600 mt-2">Veuillez entrer le mot de passe</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="password" className="text-gray-700">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 border-2 border-gray-300 focus:border-[#0D6EB2]"
              placeholder="Entrez le mot de passe"
              autoFocus
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#0D6EB2] hover:bg-[#0a5a94] text-white py-3"
          >
            Se connecter
          </Button>
        </form>
      </div>
    </div>
  );
}
