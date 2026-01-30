'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Camera, Glasses, Rotate3D, Sparkles, ArrowRight, QrCode, ChefHat, Eye } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const features = [
    {
      icon: <Rotate3D className="w-8 h-8" />,
      title: "360° View",
      description: "Rotate and explore dishes from every angle",
      gradient: "from-orange-500 to-pink-500"
    },
    {
      icon: <Camera className="w-8 h-8" />,
      title: "AR Experience",
      description: "Place dishes on your table using camera",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Glasses className="w-8 h-8" />,
      title: "VR Mode",
      description: "Immerse yourself with gyro-based viewing",
      gradient: "from-purple-500 to-indigo-500"
    }
  ];

  const steps = [
    { step: 1, title: "Scan QR Code", icon: <QrCode className="w-6 h-6" /> },
    { step: 2, title: "Browse Menu", icon: <ChefHat className="w-6 h-6" /> },
    { step: 3, title: "View in 3D/AR", icon: <Eye className="w-6 h-6" /> }
  ];

  return (
    <main className="min-h-screen bg-gray-950 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 mb-8"
          >
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-300">The Future of Digital Menus</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6"
          >
            <span className="text-white">Experience Food in</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500">
              Immersive 3D
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
          >
            Scan the QR code at your table to view the menu with stunning 3D models,
            AR visualization, and VR experiences – all from your mobile phone.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/menu/demo')}
              className="group flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold text-lg shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all"
            >
              View Demo Menu
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/5 text-white font-semibold text-lg border border-white/10 hover:bg-white/10 transition-all"
            >
              <QrCode className="w-5 h-5" />
              Scan QR Code
            </motion.button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-white/50"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Multiple Ways to Experience
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Choose how you want to view dishes – from simple 360° rotation to full AR experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl blur-xl -z-10 from-orange-500/20 to-pink-500/20" />
                <div className="p-8 rounded-3xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 backdrop-blur-lg">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-white mb-6`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-400">
              Simple 3-step process to view your food in 3D
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-8 sm:gap-4 justify-between items-center">
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="flex-1 text-center relative"
              >
                {index < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-8 left-[60%] w-full h-0.5 bg-gradient-to-r from-orange-500/50 to-transparent" />
                )}
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center text-white mx-auto mb-4 relative z-10">
                  {item.icon}
                </div>
                <div className="text-sm font-semibold text-orange-400 mb-1">Step {item.step}</div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            © 2024 Immersive 3D Menu. Powered by Mobile Camera Technology.
          </p>
        </div>
      </footer>
    </main>
  );
}
