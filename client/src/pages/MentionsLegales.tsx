export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-[#FFF8E7] py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-[#0D6EB2] mb-6">Mentions légales</h1>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Éditeur du site</h2>
          <p className="text-gray-700 leading-relaxed">
            Le site de consultation citoyenne est édité par l'équipe <strong>Veauche Mérite Mieux</strong>, représentée par <strong>Florian Chaux</strong>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Directeur de la publication</h2>
          <p className="text-gray-700 leading-relaxed">
            Florian Chaux, représentant de l'équipe Veauche Mérite Mieux.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Hébergement</h2>
          <p className="text-gray-700 leading-relaxed">
            Ce site est hébergé par un prestataire dont les serveurs sont situés en Europe, garantissant ainsi la conformité avec la réglementation européenne sur la protection des données.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Propriété intellectuelle</h2>
          <p className="text-gray-700 leading-relaxed">
            L'ensemble des contenus présents sur ce site (textes, images, logos) est la propriété de l'équipe Veauche Mérite Mieux, sauf mention contraire. Toute reproduction, distribution, modification ou utilisation à des fins commerciales sans autorisation préalable est strictement interdite.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Données personnelles</h2>
          <p className="text-gray-700 leading-relaxed">
            Pour toute information concernant la collecte et le traitement de vos données personnelles, veuillez consulter notre <a href="/rgpd" className="text-[#0D6EB2] underline hover:text-[#DF9F14]">politique de confidentialité (RGPD)</a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact</h2>
          <p className="text-gray-700 leading-relaxed">
            Pour toute question ou demande concernant ce site, vous pouvez nous contacter via les canaux de communication de l'équipe Veauche Mérite Mieux.
          </p>
        </section>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <a href="/" className="text-[#0D6EB2] hover:text-[#DF9F14] underline">
            ← Retour à la consultation citoyenne
          </a>
        </div>
      </div>
    </div>
  );
}
