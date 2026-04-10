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

## Challenges and Solutions

- **Auto-scrolling to new messages**: Keeping the view at the bottom when new texts or typing dots appear.
  - **Solution**: Added an empty `div` at the bottom and used `useEffect` to scroll to it automatically.

- **Faking AI delay**: Simulating a slow AI response without freezing the app.
  - **Solution**: Made an API route that waits using a simple timer before sending the reply.
