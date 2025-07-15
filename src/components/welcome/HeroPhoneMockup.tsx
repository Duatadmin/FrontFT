import { motion } from 'framer-motion';
import { useInViewport } from '@/hooks/useInViewport';

export function HeroPhoneMockup() {
  const [ref, isInView] = useInViewport<HTMLDivElement>();

  return (
    <div ref={ref} className="relative w-full h-full flex items-center justify-center">
      {/* 3D Floating Phone Mockup - Responsive sizing */}
      <motion.div
        className="relative w-full max-w-[200px] aspect-[9/19]"
        animate={isInView ? {
          y: [0, -10, 0],
        } : {}}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5 rounded-[2.5rem] border border-white/20 backdrop-blur-xl p-2">
          <div className="w-full h-full bg-dark-bg rounded-[2rem] overflow-hidden">
            {/* Minimalist Chat Bubbles */}
            <div className="p-4 space-y-3 h-full flex flex-col justify-center">
              {/* User Message 1 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                className="flex justify-end"
              >
                <div className="h-9 bg-gradient-to-r from-accent-lime/20 to-accent-orange/20 rounded-2xl rounded-tr-sm w-[55%]" />
              </motion.div>

              {/* AI Message 1 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, type: "spring", stiffness: 200 }}
              >
                <div className="h-12 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl rounded-tl-sm w-[75%]" />
              </motion.div>

              {/* User Message 2 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
                className="flex justify-end"
              >
                <div className="h-8 bg-gradient-to-r from-accent-lime/20 to-accent-orange/20 rounded-2xl rounded-tr-sm w-[45%]" />
              </motion.div>

              {/* AI Message 2 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2, type: "spring", stiffness: 200 }}
              >
                <div className="h-14 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl rounded-tl-sm w-[80%]" />
              </motion.div>

              {/* User Message 3 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.5, type: "spring", stiffness: 200 }}
                className="flex justify-end"
              >
                <div className="h-8 bg-gradient-to-r from-accent-lime/20 to-accent-orange/20 rounded-2xl rounded-tr-sm w-[40%]" />
              </motion.div>

              {/* AI Message with typing indicator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 3, type: "spring", stiffness: 200 }}
              >
                <div className="h-9 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl rounded-tl-sm w-[50%] flex items-center justify-center gap-1.5">
                  <motion.div
                    animate={isInView ? { opacity: [0.3, 1, 0.3] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 rounded-full bg-white/40"
                  />
                  <motion.div
                    animate={isInView ? { opacity: [0.3, 1, 0.3] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                    className="w-2 h-2 rounded-full bg-white/40"
                  />
                  <motion.div
                    animate={isInView ? { opacity: [0.3, 1, 0.3] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                    className="w-2 h-2 rounded-full bg-white/40"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Floating Elements - Adjusted for responsive sizing */}
        <motion.div
          className="absolute -top-[15%] -right-[15%] w-[40%] h-[40%] bg-accent-lime/20 rounded-full blur-xl"
          animate={isInView ? {
            scale: [1, 1.5, 1],
            opacity: [0.5, 0.8, 0.5],
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-[15%] -left-[15%] w-[50%] h-[50%] bg-accent-orange/20 rounded-full blur-xl"
          animate={isInView ? {
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.7, 0.5],
          } : {}}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </motion.div>
    </div>
  );
}