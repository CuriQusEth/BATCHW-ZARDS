# Batch Wizard

A magical arcade game where you cast batch spells to survive endless enemies, featuring onchain ERC-8021 integration. Built on Base Mainnet.

## Overview

Batch Wizard is an endless survival game. By matching and dragging elements, players can cast batch spells to defeat approaching enemies. This project showcases how to seamlessly integrate on-chain functionality into web games.

## Tech Stack

- **Framework**: Next.js 15 App Router (mocked here with Vite/React for the preview)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Game Engine**: Custom HTML5 Canvas engine
- **Web3 Integrations**:
  - `wagmi` + `viem` for interacting with EVM networks.
  - `@base-org/account` for smart wallet support (Base Account integration).
  - ERC-8021 tracking via `dataSuffix` Builder Code attachment.

## On-chain Features

1. **ERC-8021 Attribution**: Automatically appends the builder code \`bc_iikhcsnm\` to the `data` payload of on-chain transactions submitted through the app.
2. **SIWE (Sign-In with Ethereum)**: Securely proves wallet ownership before accessing profile actions and submitting scores.
3. **On-chain Score Strategy**: Users can sign a SIWE message locally verifying their score statement and subsequently push an attributed on-chain transaction indicating completion.
4. **"Say GM" Transaction**: Provides a quick debug / interactive transaction hook using the connected wallet, also tracked by ERC-8021 suffix. 

## Registration Meta details
<meta name="base:app_id" content="68f3f2c9b6320e0dd0819ad1" />

## Usage

Connect your wallet using standard connectors or **Base Account** (via the Smart Wallet injector). Complete a round of Batch Wizard and hit **"Save Score"** to test the full SIWE verification and ERC-8021 transaction mapping.
