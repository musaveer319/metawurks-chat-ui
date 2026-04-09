# Metawurks Chat UI Internship Task

## Project Description
This is a functional chat user interface built with Next.js (App Router), React, and Tailwind CSS. It serves as a foundational UI for communicating with an AI chatbot, currently utilizing a mock backend API to simulate realistic "thinking/inference" delays. The project focuses on a clean and professional responsive design, reusable component architecture, and proper React state management to manage real-time UI updates seamlessly.

## How to Run Locally

1. **Ensure you have Node.js installed** (version 18+).
2. **Clone the repository** (if downloading fresh):
   ```bash
   git clone <your-repository-url>
   cd chat-ui
   ```
3. **Install the dependencies**:
   ```bash
   npm install
   ```
4. **Start the local development server**:
   ```bash
   npm run dev
   ```
5. **View the Application**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Link to Deployed Application
[https://metawurks-chat-ui-iota.vercel.app](https://metawurks-chat-ui-iota.vercel.app)

## Challenges Faced and Solutions

- **Challenge**: Managing the auto-scroll behavior for new messages, particularly ensuring the scroll captures the bottom of the view even when the "typing indicator" dynamically toggles visibility.
  - **Solution**: Implemented a `useRef` pointing to an anchor `div` at the very bottom of the render area. A `useEffect` hook was attached with dependencies on both `messages` and `isLoading`, triggering `scrollIntoView({ behavior: "smooth" })` to ensure the user always sees the most recent state accurately.

- **Challenge**: Simulating an authentic backend response delay to replicate live AI generation latency without artificially blocking the frontend thread loop.
  - **Solution**: Created a fully isolated Next.js `Route Handler` inside `/app/api/chat/route.ts` that safely accepts asynchronous `POST` requests and implements an `await new Promise(...)` with `setTimeout` natively before forwarding the JSON reply. This decoupled architecture cleanly fulfills frontend-backend separation requirements seamlessly!
