import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
  Search,
} from "lucide-react";
import React, { useState } from "react";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const FAQPage: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const faqData: FAQItem[] = [
    {
      id: 1,
      question: "What is TanFishMarket?",
      answer:
        "TanFishMarket is a digital marketplace designed to help fishers, processors, and seafood vendors in Tanzania sell their products directly to buyers through a mobile phone or computer. The platform promotes fair trade, wider market access, and sustainable business practices.",
    },
    {
      id: 2,
      question: "Who can use TanFishMarket?",
      answer:
        "Any registered fisher, fish processor, trader, or transporter in Tanzania can sign up to sell products. Buyers—including individuals, restaurants, retailers, and exporters—can also use the platform to order fresh or processed fish products.",
    },
    {
      id: 3,
      question: "How do I register on the platform?",
      answer:
        'Simply download the TanFishMarket app from the Play Store or visit www.tanfishmarket.com. Click on "Register", fill in your details, and follow the steps to create your account.',
    },
    {
      id: 4,
      question: "Who handles delivery?",
      answer:
        "Delivery is handled by verified transporters listed on the platform or arranged between the buyer and seller. The system allows tracking and communication to ensure smooth delivery and handover.",
    },
    {
      id: 5,
      question: "Do I need a business license or TIN to join as a seller?",
      answer:
        "Yes. To ensure trust and transparency, sellers are required to upload a valid business license or Tax Identification Number (TIN). This helps attract institutional and bulk buyers.",
    },
    {
      id: 6,
      question: "What types of products can I sell?",
      answer:
        "You can sell a variety of seafood products, including fresh fish, dried fish, smoked fish, frozen fish, dagaa, shellfish, and value-added fish products—provided they meet safety and quality standards.",
    },
    {
      id: 7,
      question: "Can I upload photos of my products?",
      answer:
        "Yes! We encourage you to upload clear, real photos of your products. Good photos help attract buyers and increase your chances of making a sale.",
    },
    {
      id: 8,
      question: "Is the platform available in Swahili?",
      answer:
        "Absolutely. TanFishMarket supports both Swahili and English to ensure accessibility for all users in Tanzania.",
    },
    {
      id: 9,
      question: "What if I need help or face technical issues?",
      answer:
        "Our support team is here to help! Contact us via WhatsApp, call, or email. You can also visit the Help Center section in the app for guides, videos, and troubleshooting tips.",
    },
  ];

  const toggleItem = (id: number) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFAQs = faqData.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white opacity-5 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-white opacity-5 rounded-full"></div>
          <div className="absolute top-1/2 right-10 w-24 h-24 bg-white opacity-5 rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <HelpCircle size={40} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
              Your Questions, Answered.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search frequently asked questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 pl-12 text-lg border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
              />
              <Search
                size={24}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
            {searchTerm && (
              <p className="mt-4 text-center text-gray-600">
                Found {filteredFAQs.length} question(s) matching "{searchTerm}"
              </p>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No questions found
                </h3>
                <p className="text-gray-500">
                  Try searching with different keywords or browse all questions.
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Show All Questions
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFAQs.map((faq, index) => (
                  <div
                    key={faq.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    <button
                      onClick={() => toggleItem(faq.id)}
                      className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                          <span className="text-primary-600 font-bold text-sm">
                            {index + 1}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 pr-4">
                          {faq.question}
                        </h3>
                      </div>
                      <div className="flex-shrink-0">
                        {openItems.includes(faq.id) ? (
                          <ChevronUp size={24} className="text-primary-600" />
                        ) : (
                          <ChevronDown size={24} className="text-gray-400" />
                        )}
                      </div>
                    </button>

                    {openItems.includes(faq.id) && (
                      <div className="px-6 pb-6">
                        <div className="ml-12 pl-4 border-l-2 border-primary-100">
                          <p className="text-gray-700 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Still have questions?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Can't find the answer you're looking for? Our support team is here
              to help you get started.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <a
                href="/contact"
                className="flex flex-col items-center p-6 bg-primary-50 rounded-2xl hover:bg-primary-100 transition-colors group"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary-200 transition-colors">
                  <Mail size={24} className="text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Email Support
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  Get detailed help via email
                </p>
              </a>

              <a
                href="tel:+255123456789"
                className="flex flex-col items-center p-6 bg-green-50 rounded-2xl hover:bg-green-100 transition-colors group"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
                  <Phone size={24} className="text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Call Us</h3>
                <p className="text-sm text-gray-600 text-center">
                  Speak directly with our team
                </p>
              </a>

              <a
                href="https://wa.me/255123456789"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-6 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                  <MessageCircle size={24} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">WhatsApp</h3>
                <p className="text-sm text-gray-600 text-center">
                  Quick chat support
                </p>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="py-16 bg-gradient-to-r from-primary-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of fishers, traders, and buyers who are already
              using TanFishMarket to grow their seafood business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register-seller"
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-8 rounded-lg transition-colors inline-block"
              >
                Start Selling
              </a>
              <a
                href="/products"
                className="bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-bold py-4 px-8 rounded-lg transition-colors inline-block"
              >
                Browse Products
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;
