# GeoFinder Privacy Policy

_Last updated: 11-07-2025_

## Who I Am
Hey, I’m the solo developer behind **GeoFinder**, a country-guessing game that shows street-level images from Mapillary. This policy explains what I collect (very little), how I use it, and your choices.

If you have questions, email **contact@oof2510.space**.

## What I Collect (and What I Don’t)
- **No analytics, no ads, no tracking SDKs.** I don’t use Firebase Analytics or similar tools.
- **Gameplay data** you create:
  - A temporary `gameSessionId` (random) so I can validate a session.
  - Your **score** and lightweight **metadata** (like rounds played and correct answers) if and when you submit to the leaderboard.
- **Firebase App Check** (security only):
  - The app includes an **App Check token** on certain requests (e.g., start game, submit score). I verify the token server-side to block abuse. I don’t store the token after verification.
- **Mapillary image metadata**:
  - The images I show can include coordinates and photographer credit from Mapillary. That metadata is about the image — **not about you** — and isn’t tied to personal info.
- **Device/Location**:
  - I do **not** request your location in any way, shape or form.
  - I do **not** collect device identifiers for tracking in any way, shape or form.

## How Requests Flow (Important)
- The **mobile app only talks to my API** (e.g., `https://geo.api.oof2510.space`).
- **All third-party calls happen on my server**, not from your device. Your app request hits my backend; the backend then talks to services like Mapillary or OpenStreetMap when needed and sends the result back to your app.
- Any API keys or tokens for those third-party services are **kept on the server** and are **never exposed to the app**.

## How I Use the Data
- **Run the game** (serve images, validate rounds).
- **Maintain the leaderboard** (store score + basic round stats).
- **Prevent abuse** (verify App Check tokens).

I don’t sell your data. I don’t build advertising profiles (app is ad-free), and there's no tracking.

## What’s Shared (Third-Party Services — Backend Only)
I only share data as needed to operate the game, and **all of these calls are made by my backend** (the app does not call these services directly):

- **Mapillary (Images)** — Street-level imagery and related metadata (server requests images and credits).  
- **OpenStreetMap Nominatim (Reverse-Geocoding)** — To label an image with a country (server-side).  
- **BigDataCloud (Reverse-Geocoding)** — Fallback reverse-geocoding (server-side).  
- **Geocode.xyz (Fallback Geocoding)** — Additional geocoding provider (server-side).  
- **GeoNames (Fallback Geocoding)** — Additional geocoding provider (server-side).  
- **OpenRouter / Model Providers (for AI Duels)** — To generate the AI’s guesses from an image prompt (server-side).  
  - This includes **Polaris Alpha**, a model provided through OpenRouter. Prompts and responses sent to Polaris Alpha **may be logged by the provider and used to improve the model**. The only data sent to the model is my prompt, the streetview image, your guess, and the model's guess. OpenRouter does **not control** how each model handles data, so please review their terms and model-specific policies if you’d like to know more.  
- **Firebase (App Check)** — Server-side verification of App Check tokens to ensure requests come from a legit app build.

Helpful links:  
- Mapillary: https://www.mapillary.com/terms  •  https://www.mapillary.com/privacy  
- OpenStreetMap (OSMF): https://wiki.osmfoundation.org/wiki/Privacy_Policy  
- BigDataCloud: https://www.bigdatacloud.com/privacy  
- Geocode.xyz: https://geocode.xyz/api  
- GeoNames: https://www.geonames.org/export/  •  https://www.geonames.org/about.html  
- OpenRouter: https://openrouter.ai/privacy  
- Polaris Alpha (OpenRouter Model): https://openrouter.ai/openrouter/polaris-alpha  
- Firebase (Google): https://policies.google.com/privacy

## Data Retention
- **Game sessions**: Expire automatically (about **1 hour**) after creation; they’re auto-deleted from the database.
- **Scores**: Kept so the public leaderboard can function. Scores don’t include names, emails, or other personal identifiers.
- **AI Duels data**: I don’t store prompts or responses from AI Duels myself. However, third-party model providers like Polaris Alpha **may log and retain** that data under their own privacy policies. The only data sent to the model is my prompt, the streetview image, your guess, and the model's guess.

If you want me to remove a specific leaderboard entry, email **contact@oof2510.space** and include whatever info you have (e.g., approximate time and score). I’ll do my best to find and delete it.

## Security
- I use HTTPS and keep only the minimum data needed to run the game.
- I verify Firebase App Check tokens on protected endpoints to reduce spam/abuse.

## Your Choices
- You can **play without submitting** scores (no leaderboard entry saved).
- You can **skip AI Duels** if you don’t want prompts sent to external AI model providers.
- You can ask me to **delete a stored score** (see _Data Retention_).

## Children’s Privacy
GeoFinder isn’t directed to children under 13. If you believe a child has submitted data, contact me and I’ll remove it.

## Changes to This Policy
If I change what I collect or how I use it (like adding new AI models or third-party services), I’ll update this page and bump the “Last updated” date.

## Contact
**Email:** contact@oof2510.space  
**Developer:** oof2510 (solo developer)
