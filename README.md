# NexusChat - Multi-AI Chat Platform

## Project Description
NexusChat is a fully functional, high-performance chat interface built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**. It provides a premium, responsive multi-AI chatting experience integrating real-world AI models directly into the browser. 

The application has been heavily optimized for stability and perceived performance, migrating completely away from local storage to cloud persistence, and replacing sluggish API generation with instantaneous data streaming.

### Core Features:
- **Multi-AI Provider Integration**: Dynamically switch between **Groq** (Llama 3 8B, 70B, Mixtral) and **Mistral AI** free-tier inference APIs.
- **Real-Time Text Streaming**: Deeply integrated **Server-Sent Events (SSE)** architecture Streams exact tokens directly from the models into the React UI with zero-latency "typing" effects.
- **MongoDB Atlas Persistence**: Chat histories and metadata are saved instantly into a secure cloud NoSQL database using optimized Mongoose pooling.
- **Custom Personas & Models**: Switch AI "personalities" on the fly along with Markdown rendering and syntax-highlighted code blocks.

## How to Run Locally

1. **Ensure you have Node.js installed** (version 18+).
2. **Clone the repository**:
   ```bash
   git clone <your-repository-url>
   cd chat-ui
   ```
3. **Install the dependencies**:
   ```bash
   npm install
   ```
4. **Configure Environment Variables**:
   Create a `.env.local` file in the root with the following keys:
   ```env
   GROQ_API_KEY=your_key
   MISTRAL_API_KEY=your_key
   MONGODB_URI=your_mongodb_atlas_connection_string
   ```
5. **Start the development server**:
   ```bash
   npm run dev
   ```
6. **View the Application**: Open [http://localhost:3000](http://localhost:3000)

## Link to Deployed Application
[https://metawurks-chat-ui-iota.vercel.app](https://metawurks-chat-ui-iota.vercel.app)

## Major Technical Solutions

- **Zero-Latency Perceived Performance**: 
  - **Challenge**: Waiting for an AI to generate a 2000-token response caused massive 30-second UI stalls. 
  - **Solution**: Engineered a real-time SSE extraction loop that decodes binary stream chunks server-side, preventing UI lockups and instantly dripping characters to the screen.

- **Stable Database Pooling in Serverless Environments**: 
  - **Challenge**: Next.js HMR (Hot Module Replacement) and Serverless scaling consistently duplicated MongoDB connections, eventually draining connection pools and locking the app. 
  - **Solution**: Developed a strongly typed Mongoose global caching singleton strategy that bypasses Next.js re-compilation leaks.
