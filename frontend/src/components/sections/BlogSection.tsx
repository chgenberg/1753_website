'use client'

export function BlogSection() {
  return (
    <section className="section-padding bg-neutral-50">
      <div className="container-custom">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900">
            Hudvårdsguider & Tips
          </h2>
          <p className="text-lg text-neutral-600">
            Lär dig mer om hudvård och naturliga ingredienser
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <article key={i} className="card p-6 bg-white">
              <div className="aspect-video bg-primary-100 rounded-xl mb-4"></div>
              <h3 className="font-semibold text-lg mb-2">Bloggpost {i}</h3>
              <p className="text-neutral-600 text-sm mb-4">
                Läs mer om hudvård och hur CBD kan hjälpa din hud...
              </p>
              <span className="text-primary-600 text-sm font-medium">Läs mer →</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
} 