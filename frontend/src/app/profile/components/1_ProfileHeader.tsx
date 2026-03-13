'use client'
import React from 'react'

// Main Comment File 
export function ProfileHeader() {

  /* 
  Const - Create a variable that should not be reasigned 
  stats - statistics
  value - it means data for each stat item (default value is 0) -> means there is no active campaign and no total raised yet
  pulse - decide whether the dot should animate -> if pulse is true then use animation(blink), if false then no animation(normal)
   */

  const stats =  
  [
    {
      value: 0,
      label: "Active Campaigns",
      borderColor: "border-emerald-500/20",
      hoverBorderColor: "hover:border-emerald-500/40",
      gradient: "from-emerald-500/5 to-teal-500/5",
      dotColor: "bg-emerald-400",
      textColor: "text-emerald-400",
      pulse: true
    },
    {
      value: 0,
      label: "Total Raised",
      borderColor: "border-cyan-500/20",
      hoverBorderColor: "hover:border-cyan-500/40",
      gradient: "from-cyan-500/5 to-blue-500/5",
      dotColor: "bg-cyan-400",
      textColor: "text-cyan-400",
      pulse: false
    }
  ];

  return (
    <div className="mb-12 relative"> 
    {/*
    mb-12 relative (tailwind spacing class) 

    mb-12 : means margin bottom 
    Visual Idea:
    [ Header Section ]
        space
    [ Next Section ]

    relative : means the element is positioned relative to its normal position, and it can be moved using top, right, bottom, left properties. 
    In this case, it allows the 'absolutely positioned' background effect to be placed correctly within the header section.
    */}



      {/* Background effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl"></div> 
      {/* 
      -inset-4 : expands the element slightly outside the container 
      bg-gradient-to-r : background gradient left to right
      from-cyan-500/10 via-blue-500/10 to-purple-500/10 : cyan to blue to purple with low opacity (10%)
      rounded-3xl : rounded corners
      blur-2xl : adds blue effect to make glow smoother
      */}
      
      
      <div className="relative"> 
      {/* classname = "relative" : elements inside can be positioned properly */}

        {/* Main heading - Organizer Dashboard */}
        <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight">
          {/* 
          text-5xl : controls the big title style
          md:text-7xl : on medium screens and above, the text size even larger
          mb-4 : margin bottom for adding space under the title
          leading-tight : line spacing is tighter
          */}
                    
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"> {/*bg-clip-text : background is clipped into the text shape*/}
            Organizer
          </span>
          {' '}
          <span className="text-white">Dashboard</span>
        </h1>
        
        
        {/* Subtitle - Manage your campaigns */}
        <div className="flex items-center gap-3"> 
        {/* 
        flex : flexbox 
        items-center : vertically center the items 
        gap-3 : spacing between items
        */}

          <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
          {/*
          w-1 : width small
          h-6 : height taller
          bg-gradient-to-b : background gradient from top to bottom
          rounded-full : fully rounded (pill shape)
          */}
          
          <p className="text-slate-400 text-lg md:text-xl font-semibold"> 
            {/* 
            text-slate-400 :
            text-lg :
            md:text-xl :
            font-semibold : 
            */}
            Manage your campaigns and build your impact
          </p>
        </div>
      </div>
    </div>
  )
}