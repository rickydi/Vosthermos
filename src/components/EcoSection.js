export default function EcoSection() {
  return (
    <section className="bg-[var(--color-background)] py-16 border-t border-[var(--color-border)]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 md:p-12 border border-green-100">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-green-100 rounded-2xl flex items-center justify-center shrink-0">
              <i className="fas fa-leaf text-green-600 text-3xl md:text-4xl"></i>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-extrabold mb-3">
                Reparer plutot que remplacer : un geste pour la planete
              </h2>
              <p className="text-[var(--color-muted)] leading-relaxed mb-4">
                Chaque fenetre reparee par Vosthermos, c'est une fenetre de moins dans un site d'enfouissement. En reparant plutot qu'en remplacant, vous prolongez la duree de vie de vos fenetres, reduisez les dechets et economisez en moyenne 60 a 70% du cout d'une fenetre neuve.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-recycle text-green-600"></i>
                  </div>
                  <div>
                    <strong className="block text-sm">Moins de dechets</strong>
                    <span className="text-xs text-[var(--color-muted)]">Verre et PVC recuperes</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-piggy-bank text-green-600"></i>
                  </div>
                  <div>
                    <strong className="block text-sm">60-70% d'economie</strong>
                    <span className="text-xs text-[var(--color-muted)]">vs remplacement complet</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-bolt text-green-600"></i>
                  </div>
                  <div>
                    <strong className="block text-sm">Efficacite energetique</strong>
                    <span className="text-xs text-[var(--color-muted)]">Argon + Low-E restaures</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
