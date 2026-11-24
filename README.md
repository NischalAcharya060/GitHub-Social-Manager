# GitHub Social Manager

A lightweight, modern web application built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS** that helps GitHub users inspect their social graph, identify accounts that don't follow back, and reciprocate follows safely.

- **Live URL**: [http://github-social-manager.acharyanischal.com.np](http://github-social-manager.acharyanischal.com.np)
- **Repository**: [https://github.com/NischalAcharya060/GitHub-Social-Manager](https://github.com/NischalAcharya060/GitHub-Social-Manager)

![GitHub Social Manager](https://img.shields.io/badge/Stack-Next.js%2016%20%7C%20React%2019%20%7C%20TypeScript%20%7C%20Tailwind%20CSS-blue?style=flat-square)
![Security](https://img.shields.io/badge/Security-AES--256--GCM%20Encrypted%20HTTP--Only%20Cookies-success?style=flat-square)
![Design](https://img.shields.io/badge/UI-GitHub%20Dark%20Theme-161b22?style=flat-square)

---

## Features

- **GitHub OAuth & Personal Access Token (PAT) Authentication**
  - Sign in via standard GitHub OAuth flow (`user:follow`, `read:user` scopes).
  - Or sign in using a Personal Access Token (classic or fine-grained).
  - Secure server-side session handling using **AES-256-GCM encrypted HTTP-only cookies** — tokens are never exposed in frontend code, client logs, or browser storage.

- **Clean GitHub-Inspired Dark Theme Dashboard**
  - **Full-Height Left Sidebar**: Brand emblem, social management links with active badges, and user profile card.
  - **4 Statistics Cards**: Total Followers, Total Following, Users Who Don't Follow Me Back, and Users I Don't Follow Back.
  - **2 Main Action Cards**: Quick account previews and review buttons for both Non-Followers and Follow-Back candidates.
  - Rate limit monitor showing remaining requests and quota reset time countdown.

- **Account Management Tabs**
  - **Tab 1: Not Following Back** (`Following − Followers`):
    - Lists accounts you follow who don't follow you back.
    - Real-time search filter by GitHub username.
    - "Select all on page" and "Select all matches" checkboxes.
    - Individual `Unfollow` action with direct feedback.
    - Batch `Unfollow Selected` and `Unfollow All` actions.
  - **Tab 2: Follow Back** (`Followers − Following`):
    - Lists users following you whom you haven't followed back.
    - Real-time search filter and pagination (25 / 50 / 100 items per page).
    - Individual `Follow` action.
    - Batch `Follow Selected` and `Follow All` actions.

- **Safe Bulk Operations Engine**
  - Pre-execution confirmation modal displaying affected counts and target previews.
  - Rate limit presets:
    - **Safe** (1.5s delay): Recommended by GitHub to protect against secondary rate limits.
    - **Balanced** (0.8s delay): Standard execution speed.
    - **Fast** (0.3s delay): For small batches.
  - Animated progress bar and counters (`X / Y processed`, `Succeeded`, `Failed`, `Remaining`).
  - Real-time timestamped activity log stream.
  - **Immediate cancellation support**: Cancel stops the loop gracefully without corrupting state.
  - Automatic optimistic update of local lists and dashboard counts without full page refresh.

- **Settings & Account Management**
  - Connected GitHub account overview (avatar, bio, join date, public repo count).
  - Account synchronization status and last synced timestamp.
  - Manual "Force Full Re-sync" button.
  - Rate limit usage visualization.
  - Sign out button with cookie clearance.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 (GitHub Dark palette `#0d1117`, `#161b22`, `#30363d`, `#238636`, `#da3633`)
- **Icons**: Lucide Icons & Official GitHub SVG brand mark
- **API**: GitHub REST API v3 (`/user`, `/user/followers`, `/user/following`, `/rate_limit`)
- **Session**: Node `crypto` AES-256-GCM symmetric encryption with HTTP-only cookies

---

## Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/NischalAcharya060/GitHub-Social-Manager.git
cd GitHub-Social-Manager
npm install
```

### 2. Configure Environment Variables

Create `.env.local` in the project root:

```env
# Application Base URL
NEXT_PUBLIC_APP_URL=http://github-social-manager.acharyanischal.com.np

# 32+ character random secret for AES-256 session encryption
SESSION_SECRET=your_super_secret_aes256_key_at_least_32_characters_long

# GitHub OAuth Application Credentials
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
```

#### Creating a GitHub OAuth App
1. Go to [GitHub Developer Settings > OAuth Apps](https://github.com/settings/developers).
2. Click **New OAuth App**.
3. Set **Application Name**: `GitHub Social Manager`.
4. Set **Homepage URL**: `http://github-social-manager.acharyanischal.com.np`.
5. Set **Authorization callback URL**: `http://github-social-manager.acharyanischal.com.np/api/auth/callback`.
6. Copy the **Client ID** and generate a **Client Secret**, then paste them into `.env.local`.

#### Creating a Personal Access Token (PAT)
1. Visit [GitHub New Token (Classic)](https://github.com/settings/tokens/new?scopes=user:follow,read:user&description=GitHub+Social+Manager).
2. Check the `user:follow` and `read:user` scopes.
3. Generate and paste the token directly into the login screen.

### 3. Build & Run

```bash
# Build
npm run build

# Start production server
npm run start
```

---

## Architecture & Safety Guarantees

1. **Tokens Never Leaked**:
   - The user's OAuth access token or Personal Access Token is sealed server-side using AES-256-GCM with authentication tags and stored exclusively in an HTTP-only, secure, `SameSite=Lax` cookie.
   - Frontend components only receive public user metadata (avatar, login, name, counts).

2. **Full REST API Pagination**:
   - The synchronization endpoint fetches up to 100 users per page across all follower and following pages, ensuring complete and accurate calculation of non-followers and mutual followings.

3. **No Web Scraping or Bot Automation**:
   - All follow and unfollow requests use official GitHub REST API endpoints (`PUT /user/following/{username}` and `DELETE /user/following/{username}`).
   - Sequential execution with configurable delay intervals prevents triggering GitHub's secondary abuse detection rate limits.

---

## License

MIT
