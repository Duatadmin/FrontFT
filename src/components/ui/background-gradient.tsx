import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "motion/react";

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
  borderRadius = "rounded-3xl",
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
  borderRadius?: string;
}) => {
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };
  return (
    <div className={cn("relative p-[4px] group", containerClassName)}>
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }
            : undefined
        }
        style={{
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className={cn(
          "absolute inset-0 z-[1] opacity-60 group-hover:opacity-100 blur-xl  transition duration-500 will-change-transform",
          "bg-[radial-gradient(circle_farthest-side_at_0_100%,#DFF250,transparent),radial-gradient(circle_farthest-side_at_100%_0,#DFF250,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#DFF250,transparent),radial-gradient(circle_farthest-side_at_0_0,#DFF250,transparent)]",
          borderRadius
        )}
      />
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }
            : undefined
        }
        style={{
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className={cn(
          "absolute inset-0 z-[1] will-change-transform",
          "bg-[radial-gradient(circle_farthest-side_at_0_100%,#DFF250,transparent),radial-gradient(circle_farthest-side_at_100%_0,#DFF250,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#DFF250,transparent),radial-gradient(circle_farthest-side_at_0_0,#DFF250,transparent)]",
          borderRadius
        )}
      />

      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};
