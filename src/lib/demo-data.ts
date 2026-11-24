import { GitHubAccountItem } from "./github";

const DEMO_NON_FOLLOWERS: Array<{ login: string; id: number; avatarId: number }> = [
  { login: "cloud-architect-mike", id: 101, avatarId: 1 },
  { login: "react-ninja-sarah", id: 102, avatarId: 2 },
  { login: "devops-guru-dave", id: 103, avatarId: 3 },
  { login: "rustacean-elena", id: 104, avatarId: 4 },
  { login: "gopher-sam", id: 105, avatarId: 5 },
  { login: "frontend-wizard-zoe", id: 106, avatarId: 6 },
  { login: "ai-engineer-kai", id: 107, avatarId: 7 },
  { login: "backend-pro-leo", id: 108, avatarId: 8 },
  { login: "typescript-fan-amy", id: 109, avatarId: 9 },
  { login: "cybersec-dan", id: 110, avatarId: 10 },
  { login: "fullstack-nathan", id: 111, avatarId: 11 },
  { login: "data-scientist-mia", id: 112, avatarId: 12 },
  { login: "graphql-master-josh", id: 113, avatarId: 13 },
  { login: "k8s-captain-lucas", id: 114, avatarId: 14 },
  { login: "linux-kernel-nerd", id: 115, avatarId: 15 },
  { login: "tailwind-styler-eve", id: 116, avatarId: 16 },
  { login: "wasm-coder-victor", id: 117, avatarId: 17 },
  { login: "swift-mobile-clara", id: 118, avatarId: 18 },
  { login: "sql-optimizer-ray", id: 119, avatarId: 19 },
  { login: "distributed-sys-anna", id: 120, avatarId: 20 },
];

const DEMO_FOLLOW_BACK: Array<{ login: string; id: number; avatarId: number }> = [
  { login: "open-source-enthusiast", id: 201, avatarId: 21 },
  { login: "junior-coder-tim", id: 202, avatarId: 22 },
  { login: "web-craftsman-omar", id: 203, avatarId: 23 },
  { login: "hacker-news-reader", id: 204, avatarId: 24 },
  { login: "ruby-gem-author", id: 205, avatarId: 25 },
  { login: "algo-solver-priya", id: 206, avatarId: 26 },
  { login: "creative-dev-hugo", id: 207, avatarId: 27 },
  { login: "pythonista-marcus", id: 208, avatarId: 28 },
  { login: "designer-who-codes", id: 209, avatarId: 29 },
  { login: "quantum-dev-tara", id: 210, avatarId: 30 },
  { login: "indie-maker-jack", id: 211, avatarId: 31 },
  { login: "code-reviewer-olivia", id: 212, avatarId: 32 },
];

// Active memory store for demo sessions so unfollowing/following updates live
let activeDemoNonFollowers: GitHubAccountItem[] = DEMO_NON_FOLLOWERS.map((item) => ({
  id: item.id,
  login: item.login,
  avatar_url: `https://avatars.githubusercontent.com/u/${item.id + 1000}?v=4`,
  html_url: `https://github.com/${item.login}`,
  type: "User",
  site_admin: false,
}));

let activeDemoFollowBack: GitHubAccountItem[] = DEMO_FOLLOW_BACK.map((item) => ({
  id: item.id,
  login: item.login,
  avatar_url: `https://avatars.githubusercontent.com/u/${item.id + 2000}?v=4`,
  html_url: `https://github.com/${item.login}`,
  type: "User",
  site_admin: false,
}));

export function getDemoSyncData() {
  return {
    totalFollowers: 128,
    totalFollowing: 94 - (DEMO_NON_FOLLOWERS.length - activeDemoNonFollowers.length),
    notFollowingBack: [...activeDemoNonFollowers],
    followBackCandidates: [...activeDemoFollowBack],
  };
}

export function performDemoAction(action: "follow" | "unfollow", username: string) {
  if (action === "unfollow") {
    activeDemoNonFollowers = activeDemoNonFollowers.filter(
      (u) => u.login.toLowerCase() !== username.toLowerCase()
    );
  } else {
    activeDemoFollowBack = activeDemoFollowBack.filter(
      (u) => u.login.toLowerCase() !== username.toLowerCase()
    );
  }
}

export function resetDemoData() {
  activeDemoNonFollowers = DEMO_NON_FOLLOWERS.map((item) => ({
    id: item.id,
    login: item.login,
    avatar_url: `https://avatars.githubusercontent.com/u/${item.id + 1000}?v=4`,
    html_url: `https://github.com/${item.login}`,
    type: "User",
    site_admin: false,
  }));

  activeDemoFollowBack = DEMO_FOLLOW_BACK.map((item) => ({
    id: item.id,
    login: item.login,
    avatar_url: `https://avatars.githubusercontent.com/u/${item.id + 2000}?v=4`,
    html_url: `https://github.com/${item.login}`,
    type: "User",
    site_admin: false,
  }));
}
