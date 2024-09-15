This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


---

# LooQueue

## Overview
The Looqueue is designed to help apartment residents manage bathroom occupancy efficiently. The app allows users to check if the bathroom is occupied, indicate their status, log bathroom usage, prioritize urgency, manage a waitlist, and receive text notifications.

## Features
- **Indicate Status**: Users can mark if they're waiting for the bathroom and provide their phone numbers.
- **Log Bathroom Usage**: Users can sign up when they start using the bathroom and select the activity they're doing, such as:
  1. Number 1 (1 min)
  2. Number 2 (4 min)
  3. Shave (3 min)
  4. Shower (10 min)
  5. Miscellaneous (5 min)
- **Estimate Time**: Based on their selection, the app will estimate how long they'll be in there.
- **Prioritize Urgency**: Users can mark if they're in a hurry (e.g., late for an appointment), so their priority is elevated in the waitlist.
- **Waitlist Management**: The app displays the current queue and sends text notifications to users when their turn is approaching.
- **Specify Presence**: Users can specify they are in the house and provide their phone numbers for texting.

## Notifications
- SMS (?)
- web push notifications

## How to Use
1. Open the app and check the current bathroom status.
2. If the bathroom is occupied, indicate your status and provide your phone number.
3. Log your bathroom usage by selecting the activity you're doing.
4. If you're in a hurry, mark your urgency to prioritize your turn in the waitlist.
5. Receive notifications when your turn is approaching.
