import React, { useState } from "react";

interface Partner {
  id: number;
  logo: string;
}

const partners: Partner[] = [
  {
    id: 1,
    logo: "/partners/acp.png",
  },
  {
    id: 2,
    logo: "/partners/fao.png",
  },
  {
    id: 3,
    logo: "/partners/germany.png",
  },
  {
    id: 4,
    logo: "/partners/stars.jpg",
  },
  {
    id: 5,
    logo: "/partners/tanzania.jpg",
  },
];

const PartnerLogos: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate the partners array for seamless infinite scroll
  const duplicatedPartners = [...partners, ...partners];

  return (
    <div className="w-full bg-white/5 backdrop-blur-sm py-8 overflow-hidden">
      <div className="container mx-auto px-4">
        <h3 className="text-center text-sm font-semibold text-blue-200 uppercase tracking-wider mb-6">
          Funded & Supported By
        </h3>

        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-primary-700 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-primary-700 to-transparent z-10 pointer-events-none" />

          <div
            className={`flex gap-12 ${isPaused ? "" : "animate-scroll"}`}
            style={{
              width: "fit-content",
            }}
          >
            {duplicatedPartners.map((partner, index) => (
              <div
                key={`${partner.id}-${index}`}
                className="flex-shrink-0 flex items-center justify-center"
              >
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block transition-transform duration-300 hover:scale-110"
                >
                  <div className="bg-white rounded-lg p-4 shadow-lg transition-all duration-300 group-hover:shadow-xl">
                    <img
                      src={partner.logo}
                      className="h-16 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                      loading="lazy"
                    />
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }

          .animate-scroll {
            animation: scroll 30s linear infinite;
          }

          .animate-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>
      </div>
    </div>
  );
};

export default PartnerLogos;
