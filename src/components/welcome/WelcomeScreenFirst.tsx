import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function WelcomeScreenFirst() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-[27px] pt-[14px] pb-[12px]">
        <span className="text-white text-[15px] font-semibold leading-[20px] tracking-[-0.24px]">9:41</span>
        <div className="flex items-center gap-[5px]">
          {/* Cellular Signal */}
          <svg width="17" height="12" viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M1 7.66667C1 7.29848 1.29848 7 1.66667 7H2.66667C3.03486 7 3.33333 7.29848 3.33333 7.66667V10.3333C3.33333 10.7015 3.03486 11 2.66667 11H1.66667C1.29848 11 1 10.7015 1 10.3333V7.66667Z" fill="white"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M5.66667 5.33333C5.66667 4.96514 5.96514 4.66667 6.33333 4.66667H7.33333C7.70152 4.66667 8 4.96514 8 5.33333V10.3333C8 10.7015 7.70152 11 7.33333 11H6.33333C5.96514 11 5.66667 10.7015 5.66667 10.3333V5.33333Z" fill="white"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M10.3333 3C10.3333 2.63181 10.6318 2.33333 11 2.33333H12C12.3682 2.33333 12.6667 2.63181 12.6667 3V10.3333C12.6667 10.7015 12.3682 11 12 11H11C10.6318 11 10.3333 10.7015 10.3333 10.3333V3Z" fill="white"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M15 0.666667C15 0.298477 15.2985 0 15.6667 0H16.3333C16.7015 0 17 0.298477 17 0.666667V10.3333C17 10.7015 16.7015 11 16.3333 11H15.6667C15.2985 11 15 10.7015 15 10.3333V0.666667Z" fill="white" fillOpacity="0.4"/>
          </svg>
          {/* WiFi */}
          <svg width="15" height="11" viewBox="0 0 15 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M7.67188 2.77978C9.35156 2.78271 10.9619 3.45215 12.1533 4.64844C12.235 4.73022 12.366 4.73096 12.4487 4.65039L13.8652 3.24316C13.9072 3.20166 13.9307 3.14502 13.9304 3.08594C13.9302 3.02686 13.9062 2.97051 13.8638 2.92920C10.6265 -0.281494 5.37305 -0.281494 2.13574 2.92920C2.09326 2.97051 2.06934 3.02686 2.06909 3.08594C2.06885 3.14502 2.09229 3.20166 2.13428 3.24316L3.55127 4.65039C3.63379 4.73096 3.76465 4.73022 3.8462 4.64844C5.03809 3.45166 6.64893 2.78223 8.32861 2.77978H7.67188ZM7.50049 6.21631C8.40625 6.21631 9.27539 6.57275 9.91455 7.20703C9.99658 7.28784 10.127 7.28784 10.209 7.20703L11.624 5.79980C11.666 5.75806 11.6895 5.70117 11.689 5.64209C11.6885 5.58301 11.6641 5.52661 11.6216 5.48584C9.56885 3.45801 6.18115 3.45801 4.1284 5.48584C4.08594 5.52661 4.06152 5.58301 4.06104 5.64209C4.06055 5.70117 4.08398 5.75806 4.12598 5.79980L5.54102 7.20703C5.62305 7.28784 5.75342 7.28784 5.83545 7.20703C6.47461 6.57275 7.34375 6.21631 8.24951 6.21631H7.50049ZM9.51367 9.15723C9.51514 9.21606 9.49219 9.27295 9.45068 9.31494L7.66211 11.0913C7.62256 11.1309 7.57031 11.1538 7.51562 11.1538C7.46094 11.1538 7.40869 11.1309 7.36914 11.0913L5.58008 9.31494C5.53857 9.27295 5.51562 9.21606 5.5171 9.15723C5.51855 9.09839 5.54395 9.04248 5.58740 9.00122C6.58447 8.01123 8.19678 8.01123 9.19385 9.00122C9.2373 9.04248 9.2627 9.09839 9.26416 9.15723H9.51367Z" fill="white"/>
          </svg>
          {/* Battery */}
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.832031" y="0.833333" width="21" height="10.3333" rx="2.16667" stroke="white" strokeOpacity="0.35"/>
            <path d="M23 4V8C23.8047 7.66122 24.3333 6.87313 24.3333 6C24.3333 5.12687 23.8047 4.33878 23 4Z" fill="white" fillOpacity="0.4"/>
            <rect x="2.16602" y="2.16667" width="18.3333" height="7.66667" rx="1.33333" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6">
        {/* Hero Image Container */}
        <div className="flex-1 flex items-center justify-center relative mt-8">
          <div className="relative w-full max-w-[375px] h-[400px]">
            {/* Background Image - Fitness couple 
               TODO: Replace with actual image from Figma export */
            <svg width="375" height="400" viewBox="0 0 375 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
              <defs>
                <pattern id="fitnessImage" patternUnits="userSpaceOnUse" width="375" height="400">
                  <image href="/images/hero/fitness-couple-hero-placeholder.svg" width="375" height="400"/>
                </pattern>
              </defs>
              <rect width="375" height="400" fill="url(#fitnessImage)"/>
              {/* Gradient overlay */}
              <rect width="375" height="400" fill="url(#gradient)" />
              <defs>
                <linearGradient id="gradient" x1="187.5" y1="0" x2="187.5" y2="400" gradientUnits="userSpaceOnUse">
                  <stop stopColor="black" stopOpacity="0"/>
                  <stop offset="0.7" stopColor="black" stopOpacity="0.4"/>
                  <stop offset="1" stopColor="black" stopOpacity="0.9"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center px-4 pb-6">
          <h1 className="text-[34px] leading-[41px] font-bold text-white tracking-[0.374px] mb-2">
            Welcome to the<br />
            ultimate sandbox UI Kit!
          </h1>
          <p className="text-[#999999] text-[17px] leading-[22px] tracking-[-0.408px] font-normal">
            Intelligent fitness to enhance and grow<br />
            your endurance, anytime anywhere.
          </p>
        </div>

        {/* CTA Section */}
        <div className="px-4 pb-8">
          {/* Get Started Button */}
          <button
            onClick={() => navigate('/welcome/onboarding')}
            className="w-full h-[50px] bg-[#FF6B00] hover:bg-[#E55A00] rounded-full flex items-center justify-center gap-2 transition-colors mb-4"
          >
            <span className="text-white text-[17px] font-semibold tracking-[-0.408px] leading-[22px]">Get Started</span>
            <ArrowRight className="w-5 h-5 text-white" strokeWidth={2.5} />
          </button>

          {/* Sign In Link */}
          <p className="text-center text-[15px] leading-[20px] tracking-[-0.24px]">
            <span className="text-[#999999]">Already have an account? </span>
            <button 
              onClick={() => navigate('/login')}
              className="text-[#FF6B00] font-normal underline"
            >
              Sign In.
            </button>
          </p>
        </div>

        {/* Page Indicators */}
        <div className="flex items-center justify-center gap-[5px] pb-[34px]">
          <div className="w-[30px] h-[3px] bg-white rounded-full"></div>
          <div className="w-[6px] h-[3px] bg-white/30 rounded-full"></div>
          <div className="w-[6px] h-[3px] bg-white/30 rounded-full"></div>
          <div className="w-[6px] h-[3px] bg-white/30 rounded-full"></div>
          <div className="w-[6px] h-[3px] bg-white/30 rounded-full"></div>
          <div className="w-[6px] h-[3px] bg-white/30 rounded-full"></div>
          <div className="w-[6px] h-[3px] bg-white/30 rounded-full"></div>
          <div className="w-[6px] h-[3px] bg-white/30 rounded-full"></div>
          <div className="w-[6px] h-[3px] bg-white/30 rounded-full"></div>
          <div className="w-[6px] h-[3px] bg-white/30 rounded-full"></div>
          <div className="w-[6px] h-[3px] bg-white/30 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}