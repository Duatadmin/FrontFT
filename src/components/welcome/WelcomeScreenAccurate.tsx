import { useNavigate } from 'react-router-dom';

export function WelcomeScreenAccurate() {
  const navigate = useNavigate();

  return (
    <div className="w-[375px] h-[812px] bg-black flex flex-col relative overflow-hidden mx-auto">
      {/* Status Bar - Exact iPhone Status Bar */}
      <div className="h-[44px] flex items-end pb-[8px]">
        <div className="w-full flex justify-between items-center px-[27px]">
          {/* Time */}
          <div className="w-[54px]">
            <span className="text-white text-[15px] font-semibold leading-[20px] tracking-[-0.24px]" style={{ fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              9:41
            </span>
          </div>
          
          {/* Status Icons */}
          <div className="flex items-center gap-[5px]">
            {/* Cellular Signal */}
            <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M1 7.66663C1 7.29844 1.29848 6.99996 1.66667 6.99996H2.66667C3.03486 6.99996 3.33333 7.29844 3.33333 7.66663V10.3333C3.33333 10.7015 3.03486 11 2.66667 11H1.66667C1.29848 11 1 10.7015 1 10.3333V7.66663Z" fill="white"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M5.66669 5.33337C5.66669 4.96518 5.96516 4.66671 6.33335 4.66671H7.33335C7.70154 4.66671 8.00002 4.96518 8.00002 5.33337V10.3334C8.00002 10.7016 7.70154 11 7.33335 11H6.33335C5.96516 11 5.66669 10.7016 5.66669 10.3334V5.33337Z" fill="white"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M10.3333 2.99996C10.3333 2.63177 10.6318 2.33329 11 2.33329H12C12.3682 2.33329 12.6667 2.63177 12.6667 2.99996V10.3333C12.6667 10.7015 12.3682 11 12 11H11C10.6318 11 10.3333 10.7015 10.3333 10.3333V2.99996Z" fill="white"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M15 0.666626C15 0.298436 15.2985 0 15.6667 0H16.3333C16.7015 0 17 0.298436 17 0.666626V10.3333C17 10.7015 16.7015 11 16.3333 11H15.6667C15.2985 11 15 10.7015 15 10.3333V0.666626Z" fill="white" fillOpacity="0.4"/>
            </svg>
            
            {/* WiFi */}
            <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M7.67168 2.7796C9.35166 2.78253 10.9621 3.45202 12.1535 4.64839C12.2352 4.73019 12.3662 4.73093 12.4489 4.65035L13.8655 3.24304C13.9074 3.20152 13.9309 3.14486 13.9307 3.08577C13.9304 3.02667 13.9064 2.97029 13.864 2.929C10.6266 -0.281963 5.37294 -0.281963 2.13557 2.929C2.09307 2.97029 2.06911 3.02667 2.06886 3.08577C2.06862 3.14486 2.0921 3.20152 2.1341 3.24304L3.55113 4.65035C3.63366 4.73093 3.76457 4.73019 3.84613 4.64839C5.03811 3.45153 6.64917 2.78205 8.32918 2.7796H7.67168ZM7.50022 6.21655C8.40611 6.21655 9.27535 6.57306 9.91459 7.20741C9.99665 7.28825 10.1271 7.28825 10.2091 7.20741L11.6242 5.80005C11.6662 5.75829 11.6897 5.70137 11.6892 5.64225C11.6887 5.58313 11.6642 5.52671 11.6217 5.48593C9.5688 3.45792 6.18165 3.45792 4.12861 5.48593C4.08611 5.52671 4.06165 5.58313 4.06116 5.64225C4.06067 5.70137 4.08413 5.75829 4.12615 5.80005L5.54122 7.20741C5.62328 7.28825 5.7537 7.28825 5.83576 7.20741C6.475 6.57306 7.34424 6.21655 8.25013 6.21655H7.50022ZM9.51402 9.15765C9.5155 9.2165 9.49252 9.27342 9.45099 9.31542L7.66223 11.092C7.62266 11.1316 7.5704 11.1545 7.51571 11.1545C7.46102 11.1545 7.40876 11.1316 7.36919 11.092L5.58011 9.31542C5.53858 9.27342 5.51561 9.2165 5.51709 9.15765C5.51856 9.09879 5.54398 9.04285 5.58745 9.00155C6.58463 8.01143 8.19706 8.01143 9.19424 9.00155C9.23771 9.04285 9.26313 9.09879 9.26461 9.15765H9.51402Z" fill="white"/>
            </svg>
            
            {/* Battery */}
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
              <rect x="0.832031" y="0.833374" width="21" height="10.3333" rx="2.16667" stroke="white" strokeOpacity="0.35"/>
              <path opacity="0.4" d="M23 4V8C23.8047 7.66122 24.3333 6.87313 24.3333 6C24.3333 5.12687 23.8047 4.33878 23 4Z" fill="white"/>
              <rect x="2.16602" y="2.16675" width="18.3333" height="7.66667" rx="1.33333" fill="white"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex-1 flex flex-col">
        {/* Image Section */}
        <div className="h-[445px] relative">
          {/* Fitness Couple Image */}
          <img 
            src="/images/hero/fitness-couple.jpg" 
            alt="Fitness couple"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to placeholder if image not found
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzc1IiBoZWlnaHQ9IjQ0NSIgdmlld0JveD0iMCAwIDM3NSA0NDUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzNzUiIGhlaWdodD0iNDQ1IiBmaWxsPSIjMUIxQjFCIi8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzE1MCA3MCAxNzAgNTAgMjAwIDUwQzIzMCA1MCAyNTAgNzAgMjUwIDEwMEMyNTAgMTMwIDIzMCAxNTAgMjAwIDE1MEMxNzAgMTUwIDE1MCAxMzAgMTUwIDEwMFoiIGZpbGw9IiMzMzMzMzMiLz4KPHBhdGggZD0iTTE3NSAzNTBDMTc1IDMyMCAxOTUgMzAwIDIyNSAzMDBDMjU1IDMwMCAyNzUgMzIwIDI3NSAzNTBDMjc1IDM4MCAyNTUgNDAwIDIyNSA0MDBDMTk1IDQwMCAxNzUgMzgwIDE3NSAzNTBaIiBmaWxsPSIjMzMzMzMzIi8+Cjwvc3ZnPg==';
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent via-[50%] to-black" />
        </div>

        {/* Text Content */}
        <div className="px-6 pt-[30px] pb-[24px]">
          <h1 className="text-[34px] leading-[41px] font-bold text-white text-center tracking-[0.374px] mb-[8px]" style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            Welcome to the<br />
            ultimate sandbox UI Kit!
          </h1>
          <p className="text-[17px] leading-[22px] text-[#999999] text-center tracking-[-0.408px]" style={{ fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            Intelligent fitness to enhance and grow<br />
            your endurance, anytime anywhere.
          </p>
        </div>

        {/* CTA Button */}
        <div className="px-6 pb-[16px]">
          <button
            onClick={() => navigate('/welcome/2')}
            className="w-full h-[50px] bg-[#FF6B00] hover:bg-[#E55A00] rounded-full flex items-center justify-center gap-[8px] transition-colors"
          >
            <span className="text-white text-[17px] font-semibold leading-[22px] tracking-[-0.408px]" style={{ fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              Get Started
            </span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Sign In Link */}
        <div className="px-6 pb-[24px]">
          <p className="text-center">
            <span className="text-[15px] leading-[20px] tracking-[-0.24px] text-[#999999]" style={{ fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              Already have an account?{' '}
            </span>
            <button 
              onClick={() => navigate('/login')}
              className="text-[15px] leading-[20px] tracking-[-0.24px] text-[#FF6B00] underline underline-offset-2"
              style={{ fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              Sign In.
            </button>
          </p>
        </div>

        {/* Page Indicators */}
        <div className="flex items-center justify-center gap-[5px] pb-[34px]">
          {/* Active indicator */}
          <div className="w-[30px] h-[3px] bg-white rounded-full" />
          {/* Inactive indicators */}
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-[6px] h-[3px] bg-white/30 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}