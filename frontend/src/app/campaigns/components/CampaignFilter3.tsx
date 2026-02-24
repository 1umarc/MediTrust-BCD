'use client'
import { useState } from 'react'

/*
  FilterType defines all possible filter values.
  This is a UNION TYPE - meaning the value must be
  one of these exact strings.

  This prevents mistakes like:
  activeFilter = "wrongValue" 
*/
export type FilterType = 'all' | 'pending' | 'approved' | 'completed'

/* This interface defines what props this component MUST receive. */
interface CampaignFiltersProps 
{
    // The currently selected filter
    // Must be one of FilterType
    activeFilter: FilterType

    /*
    Function that runs when user clicks a filter button.
    It receives the selected filter value.
    It returns nothing (void).
    */
    onFilterChange: (filter: FilterType) => void

    /*
    campaignCounts is an object that stores
    how many campaigns exist in each category.

    The keys must match FilterType values.
    */
    campaignCounts: 
    {
        all: number
        pending: number
        approved: number
        completed: number
    }
}


/*
  This component renders filter buttons dynamically
  using the filters array + .map().

  It does NOT manage campaign data itself -
  it only displays filters and informs parent
  when a filter is selected.
*/
export function CampaignFilters({ activeFilter, onFilterChange, campaignCounts }: CampaignFiltersProps) {
    
    /*
    This is a configuration array for the filter buttons.

    Each object represents ONE button.

    id    -> internal value (must match FilterType)
    label -> text shown on button
    icon  -> emoji icon
    */

    const filters:
     { id: FilterType; label: string; icon: string }[] = 
     [
        { 
            id: 'all',
            label: 'All Campaigns', 
            icon: '📋' 
        },

        { 
            id: 'pending', 
            label: 'Pending', 
            icon: '⏳' 
        },

        { 
            id: 'approved', 
            label: 'Active', 
            icon: '🔥' 
        },

        { 
            id: 'completed', 
            label: 'Completed', 
            icon: '✅' 
        }
    ]

    return (
        <div className="flex flex-wrap gap-3">
            {/* use .map() to dynamically generate one button for each filter object */}
            {filters.map((filter) => (
                <button
                    key={filter.id}
                    /* When button is clicked, we notify parent component and send the selected filter id.*/
                    onClick={() => onFilterChange(filter.id)}
                    className={`group relative px-6 py-3 rounded-xl font-bold transition-all ${
                        activeFilter === filter.id
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                            : 'bg-slate-900/50 border border-slate-700 text-slate-300 hover:border-cyan-500/50'
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <span className="text-lg">{filter.icon}</span>
                        {filter.label}
                        {/* Count badge - We access campaignCounts dynamically using filter.id as the key */}
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                            activeFilter === filter.id
                                ? 'bg-white/20'
                                : 'bg-slate-800'
                        }`}>
                            {campaignCounts[filter.id]}
                        </span>
                    </span>
                </button>
            ))}
        </div>
    )
}