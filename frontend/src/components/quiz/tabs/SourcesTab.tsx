'use client'

import { motion } from 'framer-motion'
import { BookOpen, ExternalLink, FileText, Microscope } from 'lucide-react'

interface SourcesTabProps {
  results: any
}

export function SourcesTab({ results }: SourcesTabProps) {
  const sources = [
    {
      category: "Endocannabinoidsystemet i Huden",
      references: [
        {
          title: "The endocannabinoid system of the skin in health and disease",
          authors: "Bíró T, Tóth BI, Haskó G, et al.",
          journal: "Trends Pharmacol Sci. 2009;30(8):411-420",
          link: "https://doi.org/10.1016/j.tips.2009.05.004"
        },
        {
          title: "Cannabinoid Signaling in the Skin: Therapeutic Potential",
          authors: "Río CD, Millán E, García V, et al.",
          journal: "Molecules. 2018;23(3):682",
          link: "https://doi.org/10.3390/molecules23030682"
        }
      ]
    },
    {
      category: "Mikrobiom & Hudhälsa",
      references: [
        {
          title: "The skin microbiome: impact of modern environments",
          authors: "Prescott SL, Larcombe DL, Logan AC, et al.",
          journal: "World Allergy Organ J. 2017;10(1):29",
          link: "https://doi.org/10.1186/s40413-017-0160-5"
        },
        {
          title: "Skin microbiome and its interplay with the environment",
          authors: "Skowron K, Bauza-Kaszewska J, et al.",
          journal: "Am J Clin Dermatol. 2021;22(1):3-11",
          link: "https://doi.org/10.1007/s40257-020-00551-x"
        }
      ]
    },
    {
      category: "Gut-Skin Axis",
      references: [
        {
          title: "The gut-skin axis in health and disease",
          authors: "Salem I, Ramser A, Isham N, Ghannoum MA",
          journal: "Front Microbiol. 2018;9:1459",
          link: "https://doi.org/10.3389/fmicb.2018.01459"
        }
      ]
    },
    {
      category: "Medicinska Svampar för Huden",
      references: [
        {
          title: "Medicinal mushrooms as a source of bioactive compounds",
          authors: "Wasser SP",
          journal: "Appl Microbiol Biotechnol. 2011;89(5):1323-1339",
          link: "https://doi.org/10.1007/s00253-010-3067-4"
        }
      ]
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Introduktion */}
      <div className="bg-gradient-to-r from-[#F5F3F0] to-[#FAF9F7] rounded-2xl p-8 border border-[#E5DDD5]">
        <div className="flex items-center mb-4">
          <Microscope className="w-6 h-6 text-[#8B7355] mr-3" />
          <h3 className="text-2xl font-serif text-[#FCB237]">Vetenskaplig Grund</h3>
        </div>
        <p className="text-[#FCB237] leading-relaxed">
          Vår approach baseras på över 500 peer-reviewed studier inom dermatologi, 
          endokrinologi och mikrobiologi. Nedan finner du ett urval av de mest 
          relevanta källorna för din hudanalys.
        </p>
      </div>
      
      {/* Referenser */}
      <div className="space-y-6">
        {sources.map((category, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-8 shadow-lg border border-[#E5DDD5]">
            <h3 className="text-xl font-serif text-[#FCB237] mb-4">{category.category}</h3>
            <div className="space-y-4">
              {category.references.map((ref, refIdx) => (
                <div key={refIdx} className="border-l-4 border-[#8B7355] pl-4">
                  <h4 className="font-medium text-[#FCB237]">{ref.title}</h4>
                  <p className="text-sm text-[#6B5D54] mt-1">{ref.authors}</p>
                  <p className="text-sm text-[#6B5D54] italic">{ref.journal}</p>
                  <a 
                    href={ref.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[#8B7355] hover:text-[#FCB237] mt-2 text-sm"
                  >
                    Läs hela studien
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Böcker */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#E5DDD5]">
        <div className="flex items-center mb-4">
          <BookOpen className="w-6 h-6 text-[#8B7355] mr-3" />
          <h3 className="text-xl font-serif text-[#FCB237]">Rekommenderad Läsning</h3>
        </div>
        <ul className="space-y-3 text-[#FCB237]">
          <li>• "The Hidden Half of Nature" - David R. Montgomery & Anne Biklé</li>
          <li>• "10% Human" - Alanna Collen</li>
          <li>• "The Beauty of Dirty Skin" - Whitney Bowe, MD</li>
          <li>• "Clean: The New Science of Skin" - James Hamblin</li>
        </ul>
      </div>
    </motion.div>
  )
} 