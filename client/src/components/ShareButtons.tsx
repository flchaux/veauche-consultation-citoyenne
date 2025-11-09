import { Facebook, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ShareButtons() {
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareTitle = "Consultation citoyenne - Veauche Mérite Mieux";
  const shareText = "Participez à la consultation citoyenne de Veauche Mérite Mieux pour construire ensemble le programme des municipales 2026 !";

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(shareTitle);
    const body = encodeURIComponent(`${shareText}\n\nParticipez ici : ${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="flex flex-col items-center gap-3 mt-6">
      <p className="text-sm text-gray-600 font-medium">Partagez cette consultation :</p>
      <div className="flex gap-3">
        <Button
          onClick={handleFacebookShare}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-[#1877F2] text-white hover:bg-[#166FE5] border-[#1877F2] hover:border-[#166FE5]"
        >
          <Facebook className="w-4 h-4" />
          Facebook
        </Button>
        <Button
          onClick={handleEmailShare}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-gray-600 text-white hover:bg-gray-700 border-gray-600 hover:border-gray-700"
        >
          <Mail className="w-4 h-4" />
          Email
        </Button>
      </div>
    </div>
  );
}
