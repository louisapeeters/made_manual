const VIDEOS = {
  lastpass: 'foHJV6Vs12A',
  slack: '2CGppw8cHyU',
  gdpr: 'DNVKp9QfazU',
  figmaCrashCourse: 'jQ1sfKIl50E',
  figmaDevMode: 'xCJsRuH7v9w',
  miro: 'kRdtn8G4tII',
  adobeCC: 'YSr9VCCTNr4',
  productive: 'HbIVOAsF_Xc',
}

export const TEAMS = ['Design', 'Development', 'Strategy', 'Leads / Support', 'Other']

export const PHASES = [
  {
    id: 'day1',
    label: 'Day 1',
    subtitle: 'Setup',
    description: 'Get your tools, accounts and access sorted.',
    illustration: '/assets/compass.svg',
    gif: '/assets/compass.gif',
    longDescription:
      "Get set up and ready to go. You'll activate your accounts, access key tools, and go through essential company and HR information. By the end of the day, you'll understand how things work, where to find what you need, and be connected through the main communication channels.",
  },
  {
    id: 'week1',
    label: 'Week 1',
    subtitle: 'Understand',
    description: 'Learn the workflows, meet your team, and find your rhythm.',
    illustration: '/assets/folder.svg',
    gif: '/assets/folder.gif',
    longDescription:
      "Your first week is about settling in. You'll set up your team-specific tools, read the documentation that matters, meet the people you'll work with, and start understanding how Made delivers work.",
  },
  {
    id: 'month1',
    label: 'Month 1',
    subtitle: 'Deliver',
    description: 'Work independently and deepen your knowledge.',
    illustration: '/assets/rocket.svg',
    gif: '/assets/rocket.gif',
    longDescription:
      "By the end of your first month, you'll know the company, the values, and have a personal growth journey mapped out. You'll also have had a first check-in to reflect on what went well and where you need support.",
  },
]

const DAY1_CHAPTERS = [
  {
    id: 'account-setup',
    title: 'Account setup',
    overview: {
      description:
        "Let's get your core accounts in place. You'll set up a password manager and your HR account so you can access everything else you need.",
    },
    tasks: [
      {
        id: 'lastpass',
        title: 'Set up LastPass',
        description:
          'LastPass is our shared password manager. Everything you log in to — tools, internal dashboards, client systems — runs through it. Let\'s get you on it first, because the rest of today depends on it.',
        setupUrl: 'https://lastpass.com/?ac=1',
        logo: 'lastpass',
        videos: [
          { title: 'How to use LastPass — step by step', youtubeId: VIDEOS.lastpass },
        ],
        steps: [
          'Open the welcome email from IT (subject: "Welcome to Made — your LastPass invite") and click the activation link.',
          'Create a strong master password. Write it down somewhere safe — IT cannot recover it for you.',
          'Install the LastPass browser extension and sign in on your work machine.',
          'Accept the shared folders IT has assigned to you — you\'ll see "Made shared", plus any team-specific folders.',
          'Pin the extension to your browser toolbar so you can always reach it in one click.',
        ],
        tip: 'Turn on biometric unlock on your laptop — it means you can approve LastPass without typing the master password every single time.',
      },
      {
        id: 'officient-account',
        title: 'Set up your Officient account',
        description:
          'Officient is our HR platform — it\'s where contracts, personal information, bank details and leave all live. Activating it today means HR can finalise your admin without chasing you.',
        setupUrl: 'https://app.officient.io/login',
        logo: 'officient',
        steps: [
          'Open the activation email from Officient and click through to set your password.',
          'Fill in your personal details: legal name, address, phone number and emergency contact.',
          'Add your Belgian bank account number — this is where your salary will be paid.',
          'Upload a recent photo for your profile so colleagues can put a face to the name in Slack.',
          'Double-check your contract details at the top of your profile page and flag anything wrong to HR.',
        ],
        tip: 'Your IBAN needs to be in the correct format (BE... + 14 digits). Officient won\'t let you save an incorrect one — if it refuses, that\'s usually the reason.',
      },
      {
        id: 'officient-hr',
        title: 'Find your HR information',
        description:
          'While you\'re in Officient, take five minutes to get familiar with where everything lives. You\'ll come back here every time you need to check a payslip, request leave, or update personal info.',
        steps: [
          'Under "My profile" → "Documents", find your signed contract and bookmark the page.',
          'Under "Leave", check your starting vacation balance and Made days.',
          'Under "Payslips", confirm you can see the section — your first payslip will appear here at the end of the month.',
          'Under "Expense notes", have a look at how expense submissions work (you\'ll use this later).',
        ],
      },
    ],
  },
  {
    id: 'basic-info',
    title: 'Basic info',
    overview: {
      description:
        'A quick read-through of office and practical info from the handbook. Nothing to install — just orient yourself so the rest of today makes sense.',
    },
    tasks: [
      {
        id: 'office-info',
        title: 'Office info',
        description:
          'Where the office is, when it\'s open, and how to find what you need. The handbook article covers the floor plan, meeting rooms and common areas.',
        handbook: { chapterId: 'office-practical-info', articleId: 'layout-floor-plan' },
      },
      {
        id: 'practical-info',
        title: 'Practical info',
        description:
          'How to request leave, report sick days, handle expenses and travel. All the practical bits you\'ll want to know in your first weeks — summarised in the handbook article linked below.',
        handbook: { chapterId: 'working-at-made', articleId: 'absence-time-off' },
      },
    ],
  },
  {
    id: 'legal-documents',
    title: 'Legal documents',
    overview: {
      description:
        "One thing you can't skip: GDPR. Work through the slides, watch the short video, and confirm you've read and understood the policy.",
    },
    tasks: [
      {
        id: 'gdpr',
        type: 'gdpr',
        title: 'GDPR',
        description:
          'Review the GDPR slides and watch the short explainer video below. You must confirm you\'ve read and understood the policy before you can move on — this step is mandatory for everyone at Made.',
        slides: [
          {
            title: 'What is GDPR?',
            body: 'The General Data Protection Regulation is the EU law that defines how organisations may collect, store and use personal data. It applies to every employee at Made, regardless of role.',
          },
          {
            title: 'Personal data — what counts',
            body: 'Names, emails, phone numbers, IP addresses, photographs, location data, customer records. If it identifies a person, it counts. Treat it as such.',
          },
          {
            title: 'Made\'s six golden rules',
            body: 'Lawful basis · Minimal collection · Accurate · Stored only as long as needed · Kept secure · Used transparently. Every project decision should be testable against these six.',
          },
          {
            title: 'Practical do\'s',
            body: 'Use shared LastPass folders for credentials. Anonymise client data in research. Delete exports when a project closes. Ask Legal when unsure — they\'d much rather get the question.',
          },
          {
            title: 'Practical don\'ts',
            body: 'Don\'t email spreadsheets of personal data. Don\'t reuse client data outside the project it was collected for. Don\'t store anything sensitive on your local desktop. Don\'t screenshot real user data into Slack.',
          },
          {
            title: 'If something goes wrong',
            body: 'Suspect a breach — even a small one — and you contact the DPO within the hour: dpo@made.be. No blame for honest mistakes; the only mistake is silence.',
          },
        ],
        videos: [
          { title: 'GDPR in 5 minutes', youtubeId: VIDEOS.gdpr },
        ],
      },
    ],
  },
  {
    id: 'communication-setup',
    title: 'Communication setup',
    overview: {
      description:
        "Get Slack set up so you can say hi, follow along, and reach your team. It's the fastest way to get unblocked at Made — email is for external, Slack is for everything else.",
    },
    tasks: [
      {
        id: 'slack-setup',
        title: 'Set up Slack',
        description:
          'Install Slack and join the channels that matter. You\'ll be added to your team channel automatically, but you should join a few company-wide ones yourself.',
        setupUrl: 'https://slack.com/downloads',
        logo: 'slack',
        steps: [
          'Download Slack for desktop from slack.com/downloads and install it.',
          'Sign in using your @made.be Google account — SSO will handle the rest.',
          'Join #general for company-wide announcements and #random for the off-topic fun stuff.',
          'Your team channel (#team-design, #team-dev, etc.) should already have you in it — if not, ask your lead.',
          'Post a short hi in #general: your name, role, and something fun about you. People will reply with welcome emojis.',
        ],
        tip: 'Set your Slack status to "🌱 onboarding" for this week — it signals to everyone that you might be slower to reply and new to the tooling.',
      },
      {
        id: 'slack-tutorial',
        title: 'Slack tutorial',
        description:
          'Quick walkthrough on how we actually use Slack at Made — channels vs DMs, threads, status, and mentions. The goal is to avoid the two classic mistakes: DMing when you should use a channel, and replying in a channel when you should use a thread.',
        videos: [
          { title: 'How to use Slack — tutorial for beginners', youtubeId: VIDEOS.slack },
        ],
        steps: [
          'Channels over DMs: if more than one person might care, use a channel. It\'s searchable and doesn\'t die with you.',
          'Always use threads for replies inside a channel. It keeps the main feed readable.',
          'Use @here sparingly — only when the whole channel actually needs to see it right now.',
          'Set your working hours under Preferences → Notifications → "Notification schedule". Slack will hold non-urgent pings outside them.',
          'Star channels you care about to pin them to the top of your sidebar.',
        ],
        tip: 'If you need a direct answer from a specific person, @mention them in the relevant channel instead of DMing. Teammates learn from each other\'s questions.',
      },
    ],
  },
]

const WEEK1_SHARED_AFTER_TEAM = [
  {
    id: 'core-tools',
    title: 'Core tools',
    overview: {
      description:
        'Beyond your team-specific programs, there are a few tools everyone at Made uses. This chapter gets you onboarded to them.',
    },
    tasks: [
      {
        id: 'productive-setup',
        title: 'Set up Productive',
        description:
          'Productive is where time tracking, project planning and capacity management happen. Activating your account and joining your projects is what puts you officially "on" something.',
        setupUrl: 'https://app.productive.io/sign_in',
        logo: 'productive',
        steps: [
          'Open the invite email from Productive and click through to set your password.',
          'Sign in and complete your profile — role, capacity (usually 40h/week) and profile picture.',
          'Check the "My projects" tab. Your lead should have assigned you to an onboarding project plus at least one client project.',
          'If you don\'t see any projects, message your lead — it\'s usually a one-click fix on their side.',
        ],
        tip: 'Install the Productive menu bar timer on your laptop. It makes tracking time something you do in 2 seconds instead of something you forget until Friday.',
      },
      {
        id: 'productive-onboarding',
        title: 'Follow the Productive onboarding',
        description:
          'A short guided tour inside Productive. It covers timers, budgets, and the basics of navigating projects. You don\'t need to become an expert — just know where things live.',
        videos: [
          { title: 'Welcome to Productive', youtubeId: VIDEOS.productive },
        ],
        steps: [
          'Log in to Productive and click the "Getting started" prompt in the top right.',
          'Walk through the tour: timer, budgets view, and the reports tab.',
          'Start a practice timer on your onboarding project and let it run for 5 minutes, then stop it and log the time.',
          'Check that the logged time appears under your "My time" view for today.',
        ],
        tip: 'Time in Productive is logged against a project + service. If you\'re unsure which service to pick, "Internal" or "Onboarding" is almost always the right answer for this week.',
      },
      {
        id: 'lastpass-tutorial',
        title: 'Enter main tools with LastPass',
        description:
          'Now that Productive is set up, practice the LastPass flow: never type a password again. By the end of the week, all of your tool logins should go through LastPass.',
        steps: [
          'Open Productive in a new tab. When the login screen appears, click the LastPass icon in the field — it should autofill.',
          'Repeat for Officient, Slack (web), and any other tools you\'ve set up so far.',
          'If a password isn\'t in your vault yet, add it manually the first time you log in and let LastPass save it.',
          'Check the "Shared with me" folder in LastPass — that\'s where team and company-wide credentials live.',
        ],
        tip: 'If LastPass doesn\'t autofill on a site, click the extension icon → search for the site name → copy the password. The form-fill will improve once you\'ve visited the site once.',
      },
    ],
  },
  {
    id: 'hr-documents',
    title: 'HR documents',
    overview: {
      description:
        'A short chapter to read through the HR documentation that applies to you. All of this lives in the handbook — open the linked article and read it through.',
    },
    tasks: [
      {
        id: 'hr-docs',
        title: 'Read HR documents',
        description:
          'Salary framework, benefits, time off, leave policies — the stuff that applies to every Made employee. Open the handbook article, read it through, and flag anything unclear to HR.',
        handbook: { chapterId: 'working-at-made', articleId: 'salary-framework' },
      },
    ],
  },
  {
    id: 'culture',
    title: 'Culture & intros',
    overview: {
      description:
        "A bit more about who we are — and a chance for us to learn who you are. You'll read up on Made's culture, share a short intro, and complete the first office vibe survey.",
    },
    tasks: [
      {
        id: 'culture-handbook',
        title: 'Made culture',
        description:
          'An introduction to the culture at Made — how we work together, what we value, and what "good" looks like in practice. The handbook article linked below covers it.',
        handbook: { chapterId: 'working-at-made', articleId: 'values' },
      },
      {
        id: 'self-intro',
        title: 'Make an intro presentation about yourself',
        description:
          'Put together a few slides about who you are, what you\'ve worked on, and something fun about you. You\'ll share this at your next team meeting — it\'s the fastest way for people to actually remember you.',
        steps: [
          'Open Google Slides and use the "Made new joiner intro" template (linked on Confluence under "Templates").',
          'Keep it to 3–5 slides: who you are, what you\'ve done, what you\'re excited to work on, and one fun fact.',
          'Pictures > text. A photo of your dog beats a bullet list about your hobbies every time.',
          'Drop a link to the deck in your team channel and tag your lead so they can add it to the next team meeting agenda.',
        ],
        tip: "Don't over-polish it. Rougher slides feel more personal — and everyone remembers the fun fact, not the deck layout.",
      },
      {
        id: 'vibe-survey',
        title: 'Complete the office vibe survey',
        description:
          'A short pulse survey — how\'s your first week going, what\'s working, what\'s not. Your answers directly shape how we keep improving onboarding.',
        steps: [
          'Open the survey link pinned in #general (it rotates weekly).',
          'Answer honestly — it\'s anonymous. The HR team only sees aggregated results.',
          'Use the free-text box if something specific is bothering you; those comments are the ones we actually act on.',
          'Submit. You\'ll get a confirmation screen.',
        ],
      },
      {
        id: 'new-chew-prep',
        title: 'Prep your intro for New & Chew',
        description:
          'New & Chew is our informal monthly new-joiner lunch. Prepare a short spoken intro (2–3 min) — no slides, just you talking. People will ask questions; that\'s the whole point.',
        steps: [
          'Check the calendar invite — New & Chew happens on the last Thursday of every month at 12:30.',
          'Jot down a rough 2–3 minute intro: background, what you\'re working on, one thing you\'d like to learn at Made.',
          'Don\'t memorise it word-for-word. Bullet points on your phone are fine.',
          'Come hungry — lunch is on Made.',
        ],
      },
    ],
  },
  {
    id: 'admin',
    title: 'Admin',
    overview: {
      description: 'One last thing before week 1 wraps up — your first timesheet.',
    },
    tasks: [
      {
        id: 'first-timesheet',
        title: 'Fill in your first timesheet',
        description:
          'Log your hours for the week in Productive. Onboarding hours count — add them against the onboarding project. The goal is to get used to the rhythm, not to report perfect numbers.',
        steps: [
          'Open Productive → "My time".',
          'For each day this week, log the approximate hours you spent: onboarding reading, setup, meetings, introductions.',
          'Use "Onboarding" as the project and "Internal" as the service.',
          'Submit the timesheet at the end of the week — your lead will approve it.',
        ],
        tip: "Don't try to log exact minutes. Rough hour-level tracking is what everyone actually does, and it's what the finance team needs.",
      },
    ],
  },
]

const TEAM_PROGRAMS = {
  Design: {
    overview:
      'As a designer at Made you\'ll be working mostly in Miro, Adobe Creative Cloud and Figma. Let\'s get those set up and give you a short tour of each.',
    tasks: [
      {
        id: 'team-figma-setup',
        title: 'Set up Figma',
        description:
          'Figma is where all Made design work lives. Joining the organisation gives you access to every project file, the Made component library, and the handoff system we use with development.',
        setupUrl: 'https://www.figma.com/login',
        logo: 'figma',
        steps: [
          'Open the Figma invite in your inbox and accept it.',
          'Sign in with your @made.be account — SSO will take you into the Made organisation.',
          'Star the "Made design system" file so you can find it fast.',
          'Open at least one active client project file — your lead will have mentioned which one.',
          'Turn on Dev Mode in the top bar so you can see how handoff looks.',
        ],
        tip: 'Hold the Alt/Option key while hovering over elements — Figma shows distances to neighbouring elements. Game-changer for spacing.',
      },
      {
        id: 'team-figma-tutorial',
        title: 'Figma at Made — tutorial',
        description:
          'How we actually use Figma at Made: file structure, components, and handoff to development. This is less about Figma itself (you probably know that) and more about our conventions.',
        videos: [
          { title: 'Figma crash course for beginners', youtubeId: VIDEOS.figmaCrashCourse },
          { title: 'Figma Dev Mode — collaboration & handoff', youtubeId: VIDEOS.figmaDevMode },
        ],
        steps: [
          'File structure: every project has three top-level pages — Cover, Explorations, Final. Work in Explorations, promote to Final.',
          'Always use components from the Made design system rather than drawing your own. If a component is missing, propose it in #design-system.',
          'Name your frames — "Screen 01 / Home" beats "Frame 234" every time when a dev goes looking for something.',
          'Before handoff, tidy your Final page and mark frames as "Ready for dev".',
          'Development uses Dev Mode for handoff — no more Zeplin, no more exporting assets manually.',
        ],
        tip: 'We do design reviews every Thursday at 15:00. Bring a work-in-progress, not a polished deliverable — it\'s the feedback you want before you\'re too attached.',
      },
      {
        id: 'team-miro-setup',
        title: 'Set up Miro',
        description:
          'Miro is our workshop tool — client workshops, sprint planning, retrospectives. Join the workspace so you\'re in the room when those happen.',
        setupUrl: 'https://miro.com/login/',
        logo: 'miro',
        steps: [
          'Open the Miro invite email and accept.',
          'Sign in with your @made.be account.',
          'Join the "Made" workspace when prompted.',
          'Open the "Templates" board to see the templates we reuse across projects.',
        ],
        tip: 'Miro\'s infinite canvas is both its power and its trap. Always put a title on every board — future-you will thank present-you.',
      },
      {
        id: 'team-miro-tutorial',
        title: 'Miro tutorial',
        description:
          'How we run sessions in Miro at Made — frames, voting, facilitation. You\'ll start facilitating your own bits of sessions by month 2, so this sets you up for that.',
        videos: [
          { title: 'Miro tutorial — get started in 3 minutes', youtubeId: VIDEOS.miro },
        ],
        steps: [
          'Always work inside Frames, not loose on the canvas. Frames are how you navigate to specific sections in a big board.',
          'Use the "Made workshop" template as a starting point — it has the standard structure we use with clients.',
          'Voting dots are your friend in workshops — they turn 30 minutes of "what do you think?" into 5 minutes of clear priorities.',
          'Before a client session, turn off object-locking on your frames so clients can add stickies without hitting permission errors.',
          'After a workshop, always export a PNG of the board and drop it in the project\'s Drive folder as the record.',
        ],
      },
      {
        id: 'team-adobe-setup',
        title: 'Set up Adobe Creative Cloud',
        description:
          'We use Photoshop, Illustrator and InDesign for the things Figma isn\'t built for — high-fidelity image work, vector illustration, and long-form print layouts.',
        setupUrl: 'https://creativecloud.adobe.com/apps/download/creative-cloud',
        logo: 'adobe',
        steps: [
          'Install the Adobe Creative Cloud desktop app from adobe.com/creativecloud.',
          'Sign in with your @made.be account — your Adobe seat is tied to that email.',
          'Install Photoshop, Illustrator and InDesign at minimum. Add others if your project needs them.',
          'Sign in to Adobe Fonts (same account) — it gives you the Made brand typefaces automatically.',
        ],
        tip: 'Creative Cloud syncs settings across machines. If you get a new laptop, just sign in again and your brushes, fonts and workspaces come with you.',
      },
      {
        id: 'team-adobe-tutorial',
        title: 'Adobe at Made — tutorial',
        description:
          'What we actually use each Adobe tool for at Made. Mostly you\'ll live in Figma, but there are specific jobs where Adobe is still the right answer.',
        videos: [
          { title: 'Beginner\'s guide to Adobe Creative Cloud', youtubeId: VIDEOS.adobeCC },
        ],
        steps: [
          'Photoshop: hero images, photo retouching, and anything with heavy raster work. Avoid it for UI — Figma wins there.',
          'Illustrator: vector illustration, icon sets, and print assets. Export SVGs from here for the web.',
          'InDesign: long-form print or PDF deliverables — case studies, proposals, brand guidelines.',
          'Save all working files into the client\'s "03 Design / Adobe" folder in Google Drive. Never keep them only on your laptop.',
          'Export deliverables as PDFs and always name them with a version suffix: "madexxx-brand-guide-v3.pdf".',
        ],
      },
    ],
  },
  Development: {
    overview:
      'Your team works with a specific engineering stack — React, Node, and our internal platform tooling. Let\'s get your environment set up and give you a short tour of each tool.',
    tasks: [
      {
        id: 'team-dev-env',
        title: 'Set up your development environment',
        description:
          'Get the tooling you need on your laptop: git, Node (via nvm), pnpm, and our internal CLI. IT has pre-installed most of it — this task is about configuring it for Made.',
        setupUrl: 'https://github.com/made-be',
        logo: 'github',
        steps: [
          'Open Terminal and run `git --version`, `node --version`, and `pnpm --version` to confirm everything is installed.',
          'Configure git with your Made email: `git config --global user.email you@made.be` and `git config --global user.name "Your Name"`.',
          'Generate an SSH key (`ssh-keygen -t ed25519 -C you@made.be`) and add the public key to your GitHub account.',
          'Install our internal CLI: `pnpm install -g @made/cli`. It handles project scaffolding and deployments.',
          'Run `made doctor` — it checks your setup and tells you what\'s missing.',
        ],
        tip: 'Use nvm rather than a global Node install. Different Made projects pin different Node versions, and switching is a single command with nvm.',
      },
      {
        id: 'team-dev-repo',
        title: 'Clone your first repo',
        description:
          'Get a Made project running on your machine end-to-end. Doesn\'t matter which one — what matters is that the feedback loop (edit → save → see it) works before you\'re asked to actually ship something.',
        steps: [
          'Ask your lead which repo to clone first — usually the project you\'ll be working on.',
          'Clone it: `git clone git@github.com:made-be/<repo>.git`.',
          'Copy `.env.example` to `.env` and fill in the values — they\'re in the shared LastPass folder for the project.',
          'Run `pnpm install` followed by `pnpm dev`.',
          'Open localhost in your browser and confirm the app loads.',
        ],
        tip: 'If `pnpm dev` fails, 90% of the time it\'s a Node version mismatch. Check `.nvmrc` in the repo root and run `nvm use`.',
      },
      {
        id: 'team-dev-codebase',
        title: 'Codebase walkthrough',
        description:
          'Schedule a one-hour session with a senior dev on your team. Focus on architecture, conventions, and the deployment pipeline — not the business logic.',
        steps: [
          'Ask your lead who\'s the best person to walk you through the codebase.',
          'Book a 1-hour slot in their calendar with "Codebase walkthrough" as the title.',
          'Come with questions: "Where does X live?", "How do you handle Y?", "What\'s the deploy flow?".',
          'Take notes — architecture is the hardest bit to remember without writing it down.',
          'Afterwards, write up a one-page summary in the project\'s Confluence space. Future-you will thank you.',
        ],
      },
    ],
  },
  Strategy: {
    overview:
      'As a strategist at Made, you\'ll spend most of your time in Google Slides, Miro, and our research toolkit. Let\'s get you set up and walk through how we work.',
    tasks: [
      {
        id: 'team-strat-slides',
        title: 'Set up Google Slides & our templates',
        description:
          'Slides is where most strategy deliverables live. The Made template library is what keeps everything on-brand without you having to think about it.',
        setupUrl: 'https://slides.google.com/',
        logo: 'google-slides',
        steps: [
          'Open Google Drive and navigate to the shared "Strategy / Templates" folder.',
          'Star the "Made master deck" — that\'s your starting point for every new deliverable.',
          'Note the "Insights card", "Recommendation card" and "Roadmap" templates — you\'ll use these constantly.',
          'Make a copy of the master deck into a sandbox folder so you can experiment without breaking the original.',
        ],
        tip: 'Never start a deck from scratch. Always duplicate the master — it has the right fonts, colours, grids and master slides set up.',
      },
      {
        id: 'team-strat-miro',
        title: 'Set up Miro for strategy work',
        description:
          'Miro is where the messy thinking happens — synthesis, workshops, stakeholder mapping. Join the workspace and learn our templates.',
        setupUrl: 'https://miro.com/login/',
        logo: 'miro',
        steps: [
          'Accept the Miro invite from your inbox.',
          'Sign in with your @made.be account and join the Made workspace.',
          'Open the "Strategy templates" board. The stakeholder map, 2x2 prioritisation, and insights clustering templates are the three you\'ll reach for most.',
          'Duplicate one of them into a personal sandbox so you can poke at it without worrying.',
        ],
      },
      {
        id: 'team-strat-research',
        title: 'Research toolkit walkthrough',
        description:
          'Made uses a curated set of research tools — Dovetail for qualitative analysis, SurveyMonkey for quant, and Airtable for data management. A short tour of each.',
        steps: [
          'Check your inbox for invites to Dovetail, SurveyMonkey and Airtable — all three should have arrived from IT.',
          'Sign in to each and accept the Made workspace / team.',
          'In Dovetail, open any past project to see how interviews are tagged and synthesised.',
          'In Airtable, open the "Strategy knowledge base" — it\'s our library of prior research you can reuse.',
        ],
        tip: 'Our research tag taxonomy in Dovetail is standardised across projects. When tagging interviews, reuse existing tags where possible — it lets us search across projects later.',
      },
    ],
  },
  'Leads / Support': {
    overview:
      'As a lead or support team member, your day runs on Productive, Pipedrive, and Intercom. Let\'s get you onboarded to each.',
    tasks: [
      {
        id: 'team-leads-pipedrive',
        title: 'Set up Pipedrive',
        description:
          'Pipedrive is where the sales pipeline lives. Every client conversation, proposal and deal sits in here — if it\'s not in Pipedrive, it didn\'t happen.',
        setupUrl: 'https://app.pipedrive.com/auth/login',
        logo: 'pipedrive',
        steps: [
          'Accept the Pipedrive invite from your inbox.',
          'Sign in with your @made.be account.',
          'Open the "Made pipeline" view and familiarise yourself with the stages (Lead → Qualified → Proposal → Won/Lost).',
          'Check the "Activities" tab to see how the team logs calls, emails and meetings.',
          'Connect your Gmail to Pipedrive so outgoing emails are automatically logged.',
        ],
        tip: 'Always log a note after a client call, even a short one. Future-you (or a colleague covering for you) will need it.',
      },
      {
        id: 'team-leads-intercom',
        title: 'Set up Intercom',
        description:
          'Intercom is where client support conversations happen — both inbound (clients asking us things) and proactive (us checking in).',
        setupUrl: 'https://app.intercom.com/',
        logo: 'intercom',
        steps: [
          'Accept the Intercom invite in your inbox.',
          'Sign in and set your profile (name, photo, auto-responder).',
          'Join the "All conversations" inbox so you can see what\'s in flight.',
          'Read through 5–10 resolved conversations to get a feel for our tone.',
          'Save the "Standard replies" macros — they cover the most common answers.',
        ],
        tip: 'Our support tone is warm but not fluffy. "Happy to help!" is great. "Super happy to help!!" is overkill.',
      },
      {
        id: 'team-leads-walkthrough',
        title: 'Pipeline & support walkthrough',
        description:
          'Spend an hour with a senior lead — understand how we qualify, how we pitch, and how we hand off won deals to the delivery team.',
        steps: [
          'Book a 1-hour slot with a senior lead titled "Pipeline walkthrough".',
          'Come with questions about the sales motion, pricing, and how objections are handled.',
          'Ask for 2–3 recorded client calls to listen to afterwards (they\'re in Gong).',
          'Write up your notes in the "Leads / onboarding" Confluence page so the next new joiner benefits.',
        ],
      },
    ],
  },
  Other: {
    overview:
      'Your role uses its own mix of tools. This chapter is a placeholder that your lead will tailor in your first 1:1 — they\'ll point you at the specific things you need.',
    tasks: [
      {
        id: 'team-other-tools',
        title: 'Get a tool list from your lead',
        description:
          'Meet with your lead and walk through the tools and systems specific to your role. They\'ll give you a list — install and activate each one.',
        steps: [
          'Book a 30-minute slot with your lead titled "Tool walkthrough".',
          'Write down every tool they mention.',
          'Request access to each one through IT (ticket in Jira service desk).',
          'Activate each account as the invites land in your inbox.',
          'Save the login credentials to LastPass as you go.',
        ],
      },
      {
        id: 'team-other-walkthrough',
        title: 'Role-specific walkthrough',
        description:
          'A longer session with your lead: what your week looks like, which meetings you\'ll be in, and what good looks like for your role in the first month.',
        steps: [
          'Book a 1-hour slot with your lead.',
          'Ask them to walk you through a typical week.',
          'Clarify what success looks like at 30 days, 60 days, 90 days.',
          'Write it up in a Google Doc and share with your lead for sanity check.',
        ],
      },
    ],
  },
}

function teamSpecificChapter(team) {
  const t = TEAM_PROGRAMS[team] || TEAM_PROGRAMS.Other
  return {
    id: 'team-programs',
    title: 'Team specific programs',
    overview: { description: t.overview },
    tasks: t.tasks,
  }
}

const MONTH1_CHAPTERS = [
  {
    id: 'company-knowledge',
    title: 'Company knowledge',
    overview: {
      description:
        "Zoom out and get a fuller picture of the company — how it's structured, what it stands for, and where it's going.",
    },
    tasks: [
      {
        id: 'company-info',
        title: 'Read about the company',
        description:
          "Structure, projects, merger history — the bigger picture of where Made came from and where it is today. The handbook article linked below covers it.",
        handbook: { chapterId: 'about-made', articleId: 'history' },
      },
      {
        id: 'values',
        title: 'Values at Made',
        description:
          'An introduction to the values that guide how we work and make decisions. Open the handbook article — you\'ll see these values referenced in meetings, reviews, and feedback.',
        handbook: { chapterId: 'working-at-made', articleId: 'values' },
      },
      {
        id: 'growth-at-made',
        title: 'Growth at Made',
        description:
          "How growth and development works at Made — what's on offer, how reviews work, and how to actually make use of your learning budget.",
        handbook: { chapterId: 'working-at-made', articleId: 'growth-at-made' },
      },
    ],
  },
  {
    id: 'personal-growth',
    title: 'Personal growth',
    overview: {
      description:
        "Now that you know the lay of the land, it's time to think about where you want to go. You'll map out a growth journey and pick a first L&D course.",
    },
    tasks: [
      {
        id: 'growth-journey',
        title: 'Create your growth journey',
        description:
          'Sketch out your goals for the next 6–12 months. Your lead will help you refine it in your month-1 check-in. The goal is clarity, not perfection.',
        steps: [
          'Open the "Growth journey" template in Google Docs (linked in the handbook).',
          'Make a copy into your personal "Growth" folder in Drive.',
          'Fill in the three sections: where I am today, where I want to be in 6 months, where I want to be in 12 months.',
          'Keep each section to 3–5 bullet points. This is a map, not an essay.',
          'Share it with your lead ahead of your check-in so they can review it.',
        ],
        tip: 'Growth journeys get revisited every 6 months — so what you write now is not set in stone. Err on the side of ambitious.',
      },
      {
        id: 'ld-course',
        title: 'Find an L&D course',
        description:
          'Browse the learning catalogue and pick a first course that aligns with your growth journey. Made covers the cost and the learning time.',
        steps: [
          'Open the "L&D catalogue" page on Confluence.',
          'Filter by your discipline and by "beginner" or "intermediate" depending on where you want to grow.',
          'Shortlist 2–3 courses. Pick the one that best fits a goal from your growth journey.',
          'Fill in the L&D request form (linked at the top of the catalogue) with the course name, cost and why it matters for your growth.',
          'Your lead approves it — then book the course.',
        ],
        tip: 'External courses count too — conferences, paid workshops, online platforms like Frontend Masters or Maven. Not just the internal catalogue.',
      },
    ],
  },
  {
    id: 'follow-up',
    title: 'Follow-up',
    overview: {
      description:
        "Last step: schedule a check-in with your lead to reflect on your first month. What went well, what was tough, what you'd like to do next.",
    },
    tasks: [
      {
        id: 'checkin',
        title: 'Schedule your check-in',
        description:
          'Book a 30-minute slot with your lead to talk through your first month. This is not a performance review — it\'s a conversation about how onboarding went and what you need going forward.',
        steps: [
          'Open your lead\'s calendar and find a 30-minute slot in the next week.',
          'Send the invite titled "Month-1 check-in" with your growth journey doc attached.',
          'Come with 3 things that went well and 2 things that were harder than expected.',
          'Ask for their honest feedback on your first month — you\'ll get more specific answers if you ask for them.',
          'End with a question about what\'s next: what should I be working on in month 2?',
        ],
        tip: "The best month-1 check-ins are two-way. Give your lead feedback too — how was the onboarding? What would you change? They want to know.",
      },
    ],
  },
]

export function getChaptersForPhase(phaseId, team) {
  if (phaseId === 'day1') return withItems(DAY1_CHAPTERS)
  if (phaseId === 'week1') {
    return withItems([teamSpecificChapter(team || 'Other'), ...WEEK1_SHARED_AFTER_TEAM])
  }
  if (phaseId === 'month1') return withItems(MONTH1_CHAPTERS)
  return []
}

function withItems(chapters) {
  return chapters.map(ch => ({
    ...ch,
    items: ch.tasks.map(t => ({
      ...t,
      chapterId: ch.id,
      kind: 'task',
    })),
  }))
}

export function getPhaseOverview(phaseId) {
  const phase = PHASES.find(p => p.id === phaseId)
  if (!phase) return null
  return {
    id: `${phaseId}__overview`,
    chapterId: null,
    kind: 'phase-overview',
    title: `${phase.label} overview`,
    description: phase.longDescription,
    phaseId,
  }
}

export function getAllItemsForPhase(phaseId, team) {
  const overview = getPhaseOverview(phaseId)
  const chapters = getChaptersForPhase(phaseId, team)
  const tasks = chapters.flatMap(ch => ch.items)
  return overview ? [overview, ...tasks] : tasks
}

export function getPhase(phaseId) {
  return PHASES.find(p => p.id === phaseId) || null
}
