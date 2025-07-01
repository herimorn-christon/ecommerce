import {
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Twitter,
} from "lucide-react";
import React from "react";

const ContactPage: React.FC = () => {
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
                <MessageCircle size={40} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Contact Us
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
              Get in touch with us - we're here to help you with your seafood
              needs
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Contact Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {/* Email Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border-t-4 border-primary-500">
                <div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mx-auto mb-6">
                  <Mail size={32} className="text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  Email
                </h3>
                <div className="space-y-3 text-center">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      General Inquiries
                    </p>
                    <a
                      href="mailto:info@tanfishmarket.com"
                      className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    >
                      info@tanfishmarket.com
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Customer Support
                    </p>
                    <a
                      href="mailto:support@tanfishmarket.com"
                      className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    >
                      support@tanfishmarket.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Website Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border-t-4 border-green-500">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-6">
                  <Globe size={32} className="text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  Website
                </h3>
                <div className="text-center">
                  <a
                    href="https://www.tanfishmarket.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 font-medium text-lg transition-colors inline-flex items-center"
                  >
                    www.tanfishmarket.com
                    <Send size={16} className="ml-2" />
                  </a>
                  <p className="text-gray-500 mt-2 text-sm">
                    Visit our main website for more information
                  </p>
                </div>
              </div>

              {/* Social Media Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border-t-4 border-blue-500 md:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-6">
                  <MessageCircle size={32} className="text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  Social Media
                </h3>
                <p className="text-center text-gray-600 mb-6">
                  Follow us on social media
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <a
                    href="https://facebook.com/TanFishMarket"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                  >
                    <Facebook
                      size={20}
                      className="text-blue-600 mr-2 group-hover:scale-110 transition-transform"
                    />
                    <span className="text-blue-700 font-medium text-sm">
                      Facebook
                    </span>
                  </a>
                  <a
                    href="https://instagram.com/TanFishMarket"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors group"
                  >
                    <Instagram
                      size={20}
                      className="text-pink-600 mr-2 group-hover:scale-110 transition-transform"
                    />
                    <span className="text-pink-700 font-medium text-sm">
                      Instagram
                    </span>
                  </a>
                  <a
                    href="https://twitter.com/TanFishMarket"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-3 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors group"
                  >
                    <Twitter
                      size={20}
                      className="text-sky-600 mr-2 group-hover:scale-110 transition-transform"
                    />
                    <span className="text-sky-700 font-medium text-sm">
                      Twitter
                    </span>
                  </a>
                  <a
                    href="https://linkedin.com/company/TanFishMarket"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                  >
                    <Linkedin
                      size={20}
                      className="text-blue-800 mr-2 group-hover:scale-110 transition-transform"
                    />
                    <span className="text-blue-900 font-medium text-sm">
                      LinkedIn
                    </span>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-16">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Send Us a Message
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Have a question or need assistance? Fill out the form below
                  and we'll get back to you as soon as possible.
                </p>
              </div>

              <form className="max-w-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                      placeholder="Your first name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                      placeholder="Your last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                      placeholder="+255 XXX XXX XXX"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    placeholder="What is this regarding?"
                  />
                </div>

                <div className="mb-8">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-vertical"
                    placeholder="Please provide details about your inquiry..."
                  ></textarea>
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-8 rounded-lg transition-colors inline-flex items-center"
                  >
                    <Send size={20} className="mr-2" />
                    Send Message
                  </button>
                </div>
              </form>
            </div>

            {/* Additional Info Section */}
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-8 md:p-12 text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                We're Here to Help
              </h3>
              <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
                Whether you're a fisher looking to sell your catch, a buyer
                searching for fresh seafood, or someone interested in joining
                our platform, we're here to assist you every step of the way.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Phone size={24} className="text-primary-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Quick Response
                  </h4>
                  <p className="text-sm text-gray-600">
                    We respond to all inquiries within 24 hours
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageCircle size={24} className="text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Multiple Channels
                  </h4>
                  <p className="text-sm text-gray-600">
                    Reach us via email, phone, or social media
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin size={24} className="text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Local Support
                  </h4>
                  <p className="text-sm text-gray-600">
                    Based in Tanzania, understanding local needs
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
