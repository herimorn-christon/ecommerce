import { Award, Fish, Globe, Heart, Target, Users } from "lucide-react";
import React from "react";

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white opacity-5 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-white opacity-5 rounded-full"></div>
          <div className="absolute top-1/2 right-10 w-24 h-24 bg-white opacity-5 rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Fish size={40} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              About TanFishMarket
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
              From the Waters of Tanzania to the World
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Tanzania's Premier Digital Fish Marketplace
              </h2>
              <div className="w-24 h-1 bg-primary-500 mx-auto mb-8"></div>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                TanFishMarket is Tanzania's premier digital marketplace
                dedicated to connecting local fishers, processors, and seafood
                traders directly with buyers across the country and beyond.
                Built with the needs of artisanal and small-scale fishery
                communities in mind, the platform enables seamless trade of
                fresh, processed, and high-quality fish and seafood products
                through a reliable, transparent, and inclusive digital system.
              </p>
            </div>

            {/* Mission Statement */}
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-8 md:p-12 mb-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target size={32} className="text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Our Mission
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
                  Launched as part of a broader initiative to transform
                  Tanzania's fisheries sector, TanFishMarket empowers local
                  fishing communities by offering access to wider markets, fair
                  pricing, and real-time order management—all from the
                  convenience of a mobile phone or computer.
                </p>
              </div>
            </div>

            {/* Key Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <div className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={32} className="text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                  Community Focused
                </h4>
                <p className="text-gray-600">
                  Built specifically for artisanal and small-scale fishery
                  communities, ensuring their needs are at the heart of
                  everything we do.
                </p>
              </div>

              <div className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe size={32} className="text-green-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                  Wider Market Access
                </h4>
                <p className="text-gray-600">
                  Connecting local fishers with buyers across Tanzania and
                  beyond, opening up new opportunities for growth and
                  prosperity.
                </p>
              </div>

              <div className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart size={32} className="text-purple-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                  Fair & Transparent
                </h4>
                <p className="text-gray-600">
                  Ensuring fair pricing and transparent transactions through our
                  reliable and inclusive digital platform.
                </p>
              </div>
            </div>

            {/* Statistics Section */}
            <div className="bg-gray-50 rounded-2xl p-8 md:p-12 mb-16">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
                Making a Difference
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                    1000+
                  </div>
                  <p className="text-gray-600 font-medium">
                    Local Fishers Connected
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                    50+
                  </div>
                  <p className="text-gray-600 font-medium">
                    Communities Served
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                    24/7
                  </div>
                  <p className="text-gray-600 font-medium">
                    Platform Availability
                  </p>
                </div>
              </div>
            </div>

            {/* Technology & Innovation */}
            <div className="text-center mb-16">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award size={32} className="text-orange-600" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                Innovation for Impact
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                Our platform combines cutting-edge technology with deep
                understanding of local fishing communities. From mobile-first
                design to real-time order management, every feature is crafted
                to make seafood trading more accessible, efficient, and
                profitable for everyone in the value chain.
              </p>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-center text-white">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Join the TanFishMarket Community
              </h3>
              <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                Whether you're a fisher, trader, or seafood lover, become part
                of our mission to transform Tanzania's fisheries sector.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/register"
                  className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-3 rounded-full font-bold text-lg transition-colors inline-block"
                >
                  Get Started Today
                </a>
                <a
                  href="/products"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-full font-bold text-lg transition-colors inline-block"
                >
                  Explore Products
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
