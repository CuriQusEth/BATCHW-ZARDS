# BatchWizards Orchestrator & Batch Wizard Game

A magical arcade game and intelligent Orchestrator Agent running on the Base platform. This project features an endless survival game where players cast batch spells to defeat enemies, alongside a fully integrated ERC-8004 compliant AI agent designed to automate tasks and manage batch processes.

## Project Overview

Batch Wizard is a fast-paced survival game where players match elements to cast powerful spells. Beyond the gameplay, the application acts as the **BatchWizards Orchestrator**, an active Model Context Protocol (MCP) server managing on-chain and off-chain operations. This seamless combination demonstrates robust on-chain integration into web games and AI agent protocols.

## Tech Stack

- **Frontend**: Next.js App Router Architecture
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Game Engine**: Custom HTML5 Canvas engine
- **Web3 & Blockchain**:
  - Base Mainnet support
  - `wagmi` + `viem` for interacting with EVM networks
  - `@base-org/account` for smart wallet functionality
  - Builder Code (`bc_iikhcsnm`) for ERC-8021 tracking and on-chain analytics
  - Sign-In with Ethereum (SIWE) for secure verification
  - High score on-chain submissions tracking and basic transaction flows

## AI Agent & Orchestrator Features

The built-in **BatchWizards Orchestrator** connects to platforms supporting ERC-8004. 
Its core capabilities include:
- `batch-processing`: Handling mass transactions and workflows
- `multi-wizard-management`: Managing character states and permissions
- `task-automation`: Executing background daily operations
- `mcp-command-execution`: Resolving direct commands safely via the Model Context Protocol

### Agent Registration
The AI agent is openly discoverable and officially registered as an ERC-8004 agent:
- **Registration Card**: `/.well-known/agent-card.json` 
- **Type**: `https://eips.ethereum.org/EIPS/eip-8004#registration-v1`

### MCP Connection Guide
To interact with the agent as an orchestrator or LLM client, point your MCP connection instance to the local API:
- **Primary Endpoint**: `/api/mcp`
- **Agent API**: `/api/agent`
- **Supported Methods**: Supports MCP `initialize`, `tools/list`, and `tools/call`. (Currently utilizing placeholder simulation for specific racing context tools while awaiting full implementation from the game modules).

## How to Run Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start Development Server**:
   ```bash
   npm run dev
   ```
3. **Play the Game**:
   Navigate to `localhost:3000` to interact with the game UI. Connect your smart wallet or EOAs, play the game, and save your score securely on-chain.
4. **Test the Agent endpoints**:
   - `GET http://localhost:3000/api/agent`
   - `GET/POST http://localhost:3000/api/mcp`

<meta name="base:app_id" content="68f3f2c9b6320e0dd0819ad1" />
