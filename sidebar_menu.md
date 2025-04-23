SIDEBAR MENU – NEW INFORMATION ARCHITECTURE


Page Name	Purpose	Content (key sections / UI elements)	Connections	Data Used / Collected
Home	Quick “command center” landing screen	• Today’s greeting & next scheduled action
• “Start Workout” CTA (leg day etc.)
• Snap widgets: last PR, streak counter, recent coach tip	Links into Coach, Training Diary, Progress	• User profile
• Today’s plan excerpt
• Motivation snippets
Coach	Live conversational workout assistant (chat & voice)	• Chat thread
• Mic button (voice STT)
• Current‐exercise card (timer, reps left)
• “End session” button	Writes sessions to Training Diary; pulls plan from Programs	• Real-time workout events
• User input (RPE, feedback)
Programs	Manage training plans & goals	• Current program summary
• Plan browser / template library
• Goal settings (strength, weight, endurance)	Drives schedules shown in Home & executed in Coach	• training_plans table
• goals table
Training Diary	Historical record & today’s scheduled workout	• Today card (inline start if missed)
• Filtered table / card list of past sessions
• Session detail drawer	Feeds charts in Progress; links back to Coach for redo	• workout_sessions table
• user feedback notes
Progress	Visual analytics of performance & consistency	• KPI grid (volume, PRs, streak)
• Charts: 1RM trend, volume by muscle, consistency heat-map
• Weekly summary insights	Reads data from Diary; highlights goal status for Programs	• Aggregated metrics, PR log
Nutrition (optional / scalable)	Log meals & macros; alignment with goals	• Daily macro targets
• Meal log 🙁 barcode / quick add
• Water & supplement tracker	Future link to Coach for pre/post-workout fuel tips	• meals table
• targets table
Settings	Personalization & app preferences	• Account & profile
• Units, dark-mode, notifications
• Connected devices / wearables	Global; affects all modules	• auth user record
• preference flags
HOW TO USE THIS STRUCTURE
Home is the new default route – keeps users oriented and funnels them to action.

Coach handles real-time workout flow; on session completion it POSTs to workout_sessions and triggers toast linking to Diary.

Programs owns CRUD of plans / goals; other modules treat it as single source of truth.

Training Diary remains the detailed log but now shares components (SessionDrawer) with Coach to avoid duplication.

Progress only reads aggregated data – no direct editing.

Nutrition is optional: can be disabled in features flags without breaking nav.

Settings sits last, separated visually to reduce accidental taps.

This hierarchy is scannable, groups tasks by mental model (Do → Plan → Review), and leaves room for future modules (e.g., Community) without re-ordering core items.