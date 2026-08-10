# QuestCraft 🎮

A kid-friendly chore/activity tracker where kids earn points for completing chores and can redeem rewards. Parents approve chore completions, manage rewards, and track progress. Built with SvelteKit + TypeScript, local-first persistence, and deployed to GitHub Pages.

## Features

- **Parent Dashboard**
  - Approve/reject pending chore completions
  - Create, edit, and manage chores (with recurrence options)
  - Create and manage rewards with reorderable priority
  - View transaction history and generate reports
  - Manage user accounts (add kids, edit PINs and avatars)
  - Export/import JSON backups for data privacy
  
- **Kid Dashboard**
  - View assigned chores with clear "Mark Done" button
  - Watch for pending approval status with celebratory animations
  - See reward progress and request rewards
  - Pick a custom avatar from emoji options
  - Earn and track points
  
- **Accessibility & Performance**
  - Large text and tappable targets for kids
  - High contrast colors for readability
  - Responsive layout for tablets and phones
  - Minimal bundle size with lazy-loaded Lottie animations
  - Local-first data (all data stored in browser localStorage)
  
- **Authentication**
  - Simple 4-digit PIN login for each user
  - Parent accounts can manage other accounts
  - Parent can only change their own PIN (not other parents')

## Demo Accounts

Pre-seeded demo accounts available on first login:

**Parents:**
- **Alex** - PIN: `1111` - Avatar: 🌟
- **Sam** - PIN: `2222` - Avatar: 🛡️

**Kids:**
- **Zoe** - PIN: `1212` - Avatar: 🦊
- **Max** - PIN: `3434` - Avatar: 🐼

**Demo Chores:**
- Make Bed (5 pts, daily, assigned to Zoe & Max)
- Feed the Fish (3 pts, daily, assigned to Zoe)
- Trash Out (10 pts, weekly Saturday, assigned to Max)

**Demo Rewards:**
- Extra 30m Screen Time (20 pts cost)
- Ice Cream (15 pts cost)

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/TheSamsterZA/quest-craft.git
cd quest-craft

# Install dependencies
npm install
```

### Development

```bash
# Start the dev server (with network access for testing on devices)
npm run dev -- --host

# The app will be available at http://localhost:5173 (or on your network IP)
```

### Production Build

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview
```

## Data Storage & Privacy

**Local-First by Default:** All data (users, chores, rewards, transactions, points) is stored in your browser's localStorage. No data is sent to external servers by default.

### Export & Import

Parents can export all data as JSON from the Backup & Restore tab for:
- **Backups:** Save local copies of your app state
- **Data Privacy:** Download and delete all your data easily
- **Migration:** Restore data on a new device or browser

From the Parent Dashboard:
1. Go to the **Backup & Restore** tab
2. Click **Export Data** to download a JSON file
3. Click **Import Data** and select a previously downloaded JSON file to restore

## Optional Cloud Sync Setup (Advanced)

By default, QuestCraft stores all data locally. If you want to enable cloud sync for multiple devices, you can optionally configure Firebase or Supabase:

### Firebase Firestore Setup (Optional)

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Firestore Database (Free tier available)
3. Set up authentication rules:
   ```javascript
   allow read, write: if request.auth != null;
   ```
4. In your QuestCraft parent dashboard (future enhancement), enable "Cloud Sync" and paste your Firebase config

**Note:** Cloud sync is NOT currently enabled. This requires additional development to add cloud features. For now, use export/import to sync across devices.

## Deployment

### GitHub Pages

This repository includes a GitHub Actions workflow that automatically builds and deploys to GitHub Pages.

1. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Initial commit: QuestCraft scaffold"
   git push origin main
   ```

2. **Workflow runs automatically:**
   - GitHub Actions builds the static site
   - Deploys to gh-pages branch
   - Site is live at: **https://TheSamsterZA.github.io/quest-craft**

3. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Folder: / (root)
   - Save

### Custom Domain (Optional)

To use a custom domain:
1. Add your domain to GitHub Pages settings
2. Update your domain's DNS to point to GitHub Pages
3. Create a `CNAME` file in `static/` folder with your domain name

## Project Structure

```
quest-craft/
├── .github/
│   └── workflows/
│       └── pages.yml              # GitHub Pages deployment workflow
├── src/
│   ├── app.css                    # Global styles
│   ├── app.html                   # Root HTML template
│   ├── lib/
│   │   ├── models.ts              # TypeScript interfaces and types
│   │   ├── stores.ts              # Svelte stores + localStorage persistence
│   │   ├── sample-data.ts         # Demo data (accounts, chores, rewards)
│   │   ├── utils.ts               # Helper utilities
│   │   └── components/
│   │       ├── Login.svelte       # Login screen with PIN numpad
│   │       ├── ParentDashboard.svelte # Parent management interface
│   │       ├── KidDashboard.svelte    # Kid chore & reward view
│   │       └── Confetti.svelte    # Celebratory animation
│   └── routes/
│       ├── +layout.svelte         # Root layout
│       └── +page.svelte           # Home page (router)
├── .gitignore
├── package.json
├── svelte.config.js               # SvelteKit config (adapter-static, base path)
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.js
└── README.md
```

## Technologies

- **Framework:** [SvelteKit](https://kit.svelte.dev/) (v5)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** Plain CSS with CSS Grid & Flexbox
- **Animations:** Custom canvas-based confetti (performant alternative to Lottie)
- **Build:** Vite
- **Deployment:** GitHub Pages (Static adapter)
- **Dependencies:**
  - `lottie-web` - Animation library (optional lazy-load)
  - `uuid` - ID generation

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Chrome Mobile

## Accessibility Features

- Large minimum touch targets (44×44px)
- High contrast color palette
- Clear focus states for keyboard navigation
- Semantic HTML
- Support for reduced-motion preferences
- Readable font sizes on mobile

## Performance

- Initial bundle size: ~50KB (gzipped)
- Lazy-loaded animations
- Optimized for low-end devices and slow networks
- No external API calls by default
- CSS Grid and Flexbox for efficient layouts

## Tips & Best Practices

### For Parents
1. **Regular Backups:** Export your data monthly to protect against data loss
2. **Point Strategy:** Set chore points and reward costs to match your family's needs
3. **Chore Recurrence:** Use daily/weekly recurrence for regular tasks, "None" for one-time chores
4. **Reward Priority:** Reorder rewards to make more desirable ones cost more or appear lower

### For Kids
1. **Chore Board:** Check the app daily to see available chores
2. **Pending Status:** After marking a chore done, wait for parent approval before dismissing
3. **Rewards:** Focus on one reward at a time to feel progress

## Troubleshooting

**Q: Data lost after browser clear or reinstall?**
A: Regular backups are your best defense. Export JSON monthly and store in a safe place.

**Q: Parent dashboard not showing data?**
A: Clear browser cache and reload. Check that you're logged in as a parent account (role = parent).

**Q: PIN not working?**
A: Verify you've entered exactly 4 digits. Reset by exporting data, clearing localStorage, and reimporting.

**Q: App looks zoomed in or text is tiny?**
A: Adjust your browser zoom (Ctrl/Cmd + +/-). The app is designed to scale with your browser zoom.

## Future Enhancements

- Cloud sync via Firebase/Supabase (optional, disabled by default)
- Photo uploads for custom avatars
- SMS/Push notifications for pending approvals
- Advanced reporting and charts
- Photo attachments for chore evidence
- Custom avatar upload
- Recurring chore instances (weekly/custom frequency)
- Due date reminders
- Multi-family support

## Privacy & Security Notes

- **No tracking:** QuestCraft does not track users or collect telemetry
- **Local data:** All user data (including PINs and kids' names) is stored only in your browser
- **No registration:** No accounts, logins, or external services required
- **Data export:** Full control — export and delete your data anytime
- **4-digit PIN:** Simple enough for kids to remember, not cryptographically secure (local-only use)

**Important:** Do not use QuestCraft for financial data or sensitive health information. PINs are stored in plain text in localStorage and are intended for simple parental controls only.

## License

MIT License — See LICENSE file for details

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Test thoroughly
4. Submit a pull request

## Support & Issues

Found a bug? Have a feature request? [Open an issue](https://github.com/TheSamsterZA/quest-craft/issues)

---

**Built with ❤️ for families** | [GitHub](https://github.com/TheSamsterZA/quest-craft)