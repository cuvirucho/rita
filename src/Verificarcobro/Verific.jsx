import React, { useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');

@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(50px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.2) rotate(-10deg); }
  to { opacity: 1; transform: scale(1) rotate(0deg); }
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes confettiFall {
  0% { transform: translateY(-100vh) rotate(0deg) scale(1); opacity: 1; }
  50% { opacity: 1; }
  100% { transform: translateY(100vh) rotate(1080deg) scale(0.5); opacity: 0; }
}
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-8px) rotate(1deg); }
  50% { transform: translateY(-16px) rotate(0deg); }
  75% { transform: translateY(-8px) rotate(-1deg); }
}
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes checkDraw {
  from { stroke-dashoffset: 50; }
  to { stroke-dashoffset: 0; }
}
@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
}
@keyframes emojiRain {
  0% { transform: translateY(-60px) rotate(0deg) scale(0); opacity: 0; }
  10% { opacity: 1; transform: translateY(0) rotate(20deg) scale(1); }
  90% { opacity: 1; }
  100% { transform: translateY(100vh) rotate(360deg) scale(0.3); opacity: 0; }
}
@keyframes firework {
  0% { transform: scale(0); opacity: 1; }
  50% { opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}
@keyframes bounceIn {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.08); }
  70% { transform: scale(0.95); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(80px) rotate(2deg); }
  to { opacity: 1; transform: translateY(0) rotate(0deg); }
}
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(255,187,0,0.3), 0 0 60px rgba(1,151,179,0.1); }
  50% { box-shadow: 0 0 40px rgba(255,187,0,0.5), 0 0 100px rgba(1,151,179,0.2); }
}
@keyframes textGlow {
  0%, 100% { text-shadow: 0 0 20px rgba(255,187,0,0.3); }
  50% { text-shadow: 0 0 40px rgba(255,187,0,0.6), 0 0 80px rgba(255,187,0,0.2); }
}
@keyframes starTwinkle {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}
@keyframes rainbowBorder {
  0% { border-color: #0197b3; }
  25% { border-color: #ffbb00; }
  50% { border-color: #ff6b6b; }
  75% { border-color: #a855f7; }
  100% { border-color: #0197b3; }
}
@keyframes orbFloat1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -40px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}
@keyframes orbFloat2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-40px, 30px) scale(0.9); }
  66% { transform: translate(25px, -15px) scale(1.08); }
}
@keyframes dotPulse {
  0%, 80%, 100% { transform: scale(0.4); opacity: 0.3; }
  40% { transform: scale(1); opacity: 1; }
}
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes ringPulse {
  0% { transform: scale(0.8); opacity: 0.6; }
  50% { transform: scale(1.15); opacity: 0; }
  100% { transform: scale(0.8); opacity: 0; }
}
@keyframes badgeGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(1,151,179,0.2); }
  50% { box-shadow: 0 0 40px rgba(1,151,179,0.4); }
}
@keyframes megaFloat {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.02); }
}
@keyframes partyPop {
  0% { transform: scale(0) rotate(-180deg); opacity: 0; }
  60% { transform: scale(1.2) rotate(10deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

/* ── Confetti ── */
.verific-confetti {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none; overflow: hidden; z-index: 10;
}
.verific-confetti span {
  position: absolute; top: -20px;
  border-radius: 3px; animation: confettiFall linear forwards;
}

/* ── Emoji rain ── */
.verific-emoji-rain {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none; overflow: hidden; z-index: 9;
}
.verific-emoji-rain span {
  position: absolute; top: -60px;
  font-size: 1.8rem;
  animation: emojiRain linear forwards;
}

/* ── Sparkles overlay ── */
.verific-sparkles {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none; z-index: 8;
}
.verific-sparkle {
  position: absolute;
  width: 6px; height: 6px;
  background: #ffbb00;
  border-radius: 50%;
  animation: starTwinkle ease-in-out infinite;
  box-shadow: 0 0 8px rgba(255,187,0,0.6);
}

/* ── Page wrapper ── */
.verific-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  font-family: "Outfit", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.verific-page * { box-sizing: border-box; }

/* ── Email modal ── */
.verific-email-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.55); backdrop-filter: blur(8px);
  z-index: 1000; display: flex; align-items: center; justify-content: center;
  animation: fadeIn 0.3s ease;
  padding: 1rem;
}
.verific-email-modal {
  background: #fff; border-radius: 24px; padding: 2.5rem 2rem;
  max-width: 440px; width: 100%; text-align: center;
  box-shadow: 0 24px 80px rgba(0,0,0,0.18);
  animation: bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1);
  position: relative;
}
.verific-email-modal-icon {
  width: 72px; height: 72px; border-radius: 50%; margin: 0 auto 1rem;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 28px rgba(245,158,11,0.3);
}
.verific-email-input {
  width: 100%; padding: 14px 18px; border-radius: 14px;
  border: 2px solid #e2e8f0; font-size: 1rem;
  font-family: 'Inter', sans-serif; font-weight: 500;
  outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  background: #f8fafc;
}
.verific-email-input:focus {
  border-color: #0197b3; box-shadow: 0 0 0 4px rgba(1,151,179,0.12);
  background: #fff;
}
.verific-email-input::placeholder { color: #94a3b8; }
.verific-email-error {
  color: #dc2626; font-size: 0.82rem; font-weight: 600;
  margin-top: 6px; font-family: 'Inter', sans-serif;
}
.verific-email-btn {
  width: 100%; padding: 14px; border: none; border-radius: 14px;
  background: linear-gradient(135deg, #0197b3, #015a7a);
  color: #fff; font-size: 1rem; font-weight: 700;
  font-family: 'Outfit', 'Inter', sans-serif;
  cursor: pointer; transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 4px 16px rgba(1,151,179,0.3);
  margin-top: 1rem;
}
.verific-email-btn:hover {
  transform: translateY(-2px); box-shadow: 0 8px 24px rgba(1,151,179,0.4);
}
.verific-email-btn:disabled {
  opacity: 0.6; cursor: not-allowed; transform: none;
}

/* Background orbs — bigger, more vivid */
.verific-orb {
  position: absolute; border-radius: 50%; filter: blur(100px);
  pointer-events: none; z-index: 0;
}
.verific-orb--1 {
  width: 600px; height: 600px; top: -15%; right: -12%;
  background: radial-gradient(circle, rgba(1,151,179,0.25) 0%, rgba(168,85,247,0.08) 50%, transparent 70%);
  animation: orbFloat1 18s ease-in-out infinite;
}
.verific-orb--2 {
  width: 500px; height: 500px; bottom: -10%; left: -10%;
  background: radial-gradient(circle, rgba(255,187,0,0.2) 0%, rgba(255,107,107,0.08) 50%, transparent 70%);
  animation: orbFloat2 22s ease-in-out infinite;
}
.verific-orb--3 {
  width: 400px; height: 400px; top: 35%; left: 50%;
  transform: translateX(-50%);
  background: radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(0,59,92,0.06) 50%, transparent 70%);
  animation: orbFloat1 15s ease-in-out infinite reverse;
}
.verific-orb--4 {
  width: 350px; height: 350px; top: 10%; left: 20%;
  background: radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%);
  animation: orbFloat2 20s ease-in-out infinite;
}

/* ── Inner wrapper ── */
.verific-inner {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; min-height: 100vh;
  padding: 2rem 1.25rem;
}
.verific-inner--top {
  justify-content: flex-start;
  padding-top: 3rem;
  padding-bottom: 4rem;
}

/* ── Glass card – more vibrant ── */
.verific-glass {
  background: rgba(255,255,255,0.65);
  backdrop-filter: blur(30px) saturate(2);
  -webkit-backdrop-filter: blur(30px) saturate(2);
  border: 1.5px solid rgba(255,255,255,0.6);
  border-radius: 32px;
  box-shadow:
    0 4px 6px rgba(0,0,0,0.02),
    0 16px 48px rgba(1,151,179,0.12),
    0 0 0 1px rgba(1,151,179,0.04),
    inset 0 1px 0 rgba(255,255,255,0.8);
  width: 100%; max-width: 480px;
  transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s ease;
}
.verific-glass:hover {
  transform: translateY(-4px);
  box-shadow:
    0 4px 6px rgba(0,0,0,0.02),
    0 24px 64px rgba(1,151,179,0.16),
    0 0 0 1px rgba(1,151,179,0.06),
    inset 0 1px 0 rgba(255,255,255,0.8);
}

/* ── Buttons – Ultra vibrant ── */
.verific-btn-primary {
  display: inline-flex; align-items: center; gap: 10px;
  background: linear-gradient(135deg, #ffbb00 0%, #ff9500 50%, #ff6b35 100%);
  background-size: 200% 200%;
  animation: gradientShift 4s ease-in-out infinite;
  color: #003b5c; border: none; border-radius: 20px;
  padding: 18px 44px; font-size: 1.1rem; font-weight: 800;
  cursor: pointer; transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 0 6px 24px rgba(255,187,0,0.35), 0 2px 4px rgba(0,0,0,0.06);
  text-decoration: none; font-family: "Outfit", "Inter", sans-serif;
  letter-spacing: -0.01em; position: relative; overflow: hidden;
}
.verific-btn-primary::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 60%);
  pointer-events: none;
}
.verific-btn-primary::after {
  content: ''; position: absolute; top: 50%; left: 50%;
  width: 200%; height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 60%);
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.6s ease;
  pointer-events: none;
}
.verific-btn-primary:hover::after { transform: translate(-50%, -50%) scale(1); }
.verific-btn-primary:hover {
  transform: translateY(-4px) scale(1.04);
  box-shadow: 0 16px 48px rgba(255,187,0,0.45), 0 4px 8px rgba(0,0,0,0.08);
}
.verific-btn-primary:active { transform: translateY(0) scale(0.97); }

.verific-btn-error {
  display: inline-flex; align-items: center; gap: 10px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ef4444 50%, #dc2626 100%);
  background-size: 200% 200%;
  color: #fff; border: none; border-radius: 20px;
  padding: 18px 44px; font-size: 1.1rem; font-weight: 800;
  cursor: pointer; transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 0 6px 24px rgba(220,38,38,0.3);
  text-decoration: none; font-family: "Outfit", "Inter", sans-serif;
  position: relative; overflow: hidden;
}
.verific-btn-error::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%);
  pointer-events: none;
}
.verific-btn-error:hover {
  transform: translateY(-4px) scale(1.04);
  box-shadow: 0 16px 48px rgba(220,38,38,0.4);
}
.verific-btn-error:active { transform: translateY(0) scale(0.97); }

.verific-btn-ghost {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(1,151,179,0.04); color: #0197b3;
  border: 2.5px solid rgba(1,151,179,0.2); border-radius: 20px;
  padding: 16px 36px; font-size: 1rem; font-weight: 700;
  cursor: pointer; transition: all 0.35s ease;
  font-family: "Outfit", "Inter", sans-serif;
  position: relative; overflow: hidden;
}
.verific-btn-ghost::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(1,151,179,0.06) 0%, transparent 100%);
  opacity: 0; transition: opacity 0.3s;
  pointer-events: none;
}
.verific-btn-ghost:hover::before { opacity: 1; }
.verific-btn-ghost:hover {
  background: rgba(1,151,179,0.08);
  border-color: rgba(1,151,179,0.5);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(1,151,179,0.12);
}

/* ── Steps timeline – more exciting ── */
.verific-timeline { position: relative; padding-left: 0; }
.verific-step {
  display: flex; align-items: center; gap: 16px;
  padding: 18px 22px; border-radius: 22px;
  background: linear-gradient(135deg, rgba(255,255,255,0.7), rgba(240,249,255,0.5));
  backdrop-filter: blur(16px);
  margin-bottom: 10px;
  border: 1.5px solid rgba(1,151,179,0.08);
  transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
  position: relative;
  overflow: hidden;
}
.verific-step::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(1,151,179,0.04), rgba(255,187,0,0.02));
  opacity: 0; transition: opacity 0.3s;
}
.verific-step:hover::before { opacity: 1; }
.verific-step:last-child { margin-bottom: 0; }
.verific-step:hover {
  transform: translateX(8px) scale(1.02);
  background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(224,247,250,0.6));
  box-shadow: 0 8px 32px rgba(1,151,179,0.12), 0 0 0 1px rgba(1,151,179,0.08);
  border-color: rgba(1,151,179,0.2);
}
.verific-step-num {
  width: 40px; height: 40px; border-radius: 14px;
  background: linear-gradient(135deg, #0197b3, #003b5c);
  color: #fff; font-size: 0.85rem; font-weight: 900;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-family: "Outfit", sans-serif;
  box-shadow: 0 4px 12px rgba(1,151,179,0.3);
  position: relative; z-index: 1;
}
.verific-step-icon { font-size: 1.6rem; flex-shrink: 0; position: relative; z-index: 1; }
.verific-step-text {
  font-size: 0.95rem; color: #0f172a; text-align: left;
  font-weight: 700; font-family: "Outfit", "Inter", sans-serif;
  letter-spacing: -0.01em; line-height: 1.3;
  position: relative; z-index: 1;
}

/* ── Loading dots ── */
.verific-dots { display: flex; gap: 10px; justify-content: center; margin: 1.5rem 0 0.5rem; }
.verific-dot {
  width: 14px; height: 14px; border-radius: 50%;
  background: linear-gradient(135deg, #0197b3, #a855f7);
  box-shadow: 0 0 12px rgba(1,151,179,0.3);
}
.verific-dot:nth-child(1) { animation: dotPulse 1.4s ease-in-out infinite; }
.verific-dot:nth-child(2) { animation: dotPulse 1.4s ease-in-out 0.2s infinite; }
.verific-dot:nth-child(3) { animation: dotPulse 1.4s ease-in-out 0.4s infinite; }

/* ── Badge pill – glowing ── */
.verific-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, rgba(1,151,179,0.12), rgba(168,85,247,0.08));
  border: 1.5px solid rgba(1,151,179,0.2);
  border-radius: 999px; padding: 8px 20px;
  font-size: 0.78rem; font-weight: 800; color: #0197b3;
  text-transform: uppercase; letter-spacing: 1.5px;
  font-family: "Outfit", "Inter", sans-serif;
  animation: glowPulse 3s ease-in-out infinite, bounceIn 0.6s ease;
  position: relative; overflow: hidden;
}
.verific-badge::after {
  content: ''; position: absolute; top: 0; left: -100%;
  width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: ticketShine 3s ease-in-out infinite;
}

/* ── Responsive ── */
/* ── Countdown – super vibrant ── */
.verific-countdown {
  margin: 1.4rem 0;
  animation: fadeInUp 0.6s ease 0.2s both;
}
.verific-countdown-label {
  font-size: 0.82rem; font-weight: 800; color: #0197b3;
  text-transform: uppercase; letter-spacing: 2px;
  margin-bottom: 12px; font-family: "Outfit", "Inter", sans-serif;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.verific-countdown-grid {
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.verific-countdown-item {
  display: flex; flex-direction: column; align-items: center;
  background: linear-gradient(145deg, rgba(1,151,179,0.1), rgba(168,85,247,0.06));
  border: 1.5px solid rgba(1,151,179,0.15);
  border-radius: 18px; padding: 12px 16px; min-width: 68px;
  backdrop-filter: blur(12px);
  transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
  position: relative; overflow: hidden;
}
.verific-countdown-item::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%);
  pointer-events: none;
}
.verific-countdown-item:hover {
  background: linear-gradient(145deg, rgba(1,151,179,0.18), rgba(168,85,247,0.1));
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 8px 24px rgba(1,151,179,0.18);
  border-color: rgba(1,151,179,0.3);
}
.verific-countdown-number {
  font-size: 1.8rem; font-weight: 900; line-height: 1;
  background: linear-gradient(135deg, #0197b3, #a855f7);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  font-variant-numeric: tabular-nums; font-family: "Outfit", "Inter", sans-serif;
  position: relative; z-index: 1;
}
.verific-countdown-unit {
  font-size: 0.65rem; color: #64748b; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1.5px;
  margin-top: 4px; font-family: "Outfit", "Inter", sans-serif;
  position: relative; z-index: 1;
}
.verific-countdown-sep {
  font-size: 1.4rem; font-weight: 800; color: rgba(1,151,179,0.3);
  padding-bottom: 14px; font-family: "Outfit", "Inter", sans-serif;
  animation: pulse 2s ease-in-out infinite;
}

/* ── Dark countdown (banner) ── */
.verific-countdown--dark .verific-countdown-label {
  color: #ffbb00;
}
.verific-countdown--dark .verific-countdown-item {
  background: rgba(255,255,255,0.12);
  border-color: rgba(255,255,255,0.18);
}
.verific-countdown--dark .verific-countdown-item:hover {
  background: rgba(255,255,255,0.22);
  box-shadow: 0 8px 24px rgba(255,255,255,0.1);
}
.verific-countdown--dark .verific-countdown-number {
  background: linear-gradient(135deg, #ffbb00, #ff6b35);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.verific-countdown--dark .verific-countdown-unit {
  color: rgba(255,255,255,0.65);
}
.verific-countdown--dark .verific-countdown-sep {
  color: rgba(255,255,255,0.25);
}

/* ── Logo – bigger and more animated ── */
.verific-logo {
  height: 88px; width: auto; margin-bottom: 1.4rem;
  animation: bounceIn 0.8s cubic-bezier(0.34,1.56,0.64,1);
  object-fit: contain;
  transition: transform 0.4s cubic-bezier(0.4,0,0.2,1);
  filter: drop-shadow(0 4px 16px rgba(1,151,179,0.15));
}
.verific-logo:hover { transform: scale(1.1) rotate(2deg); }

/* ── Golden Ticket – WOW factor ── */
@keyframes ticketShine {
  0% { left: -100%; }
  100% { left: 200%; }
}
@keyframes ticketFloat {
  0%, 100% { transform: translateY(0) rotate(-0.5deg); }
  50% { transform: translateY(-8px) rotate(0.5deg); }
}
@keyframes goldPulse {
  0%, 100% { box-shadow: 0 8px 40px rgba(255,187,0,0.3), 0 0 0 0 rgba(255,187,0,0.15), 0 0 80px rgba(255,187,0,0.05); }
  50% { box-shadow: 0 16px 60px rgba(255,187,0,0.45), 0 0 80px rgba(255,187,0,0.1), 0 0 120px rgba(255,187,0,0.08); }
}
.verific-ticket {
  position: relative;
  background: linear-gradient(145deg, #fef3c7 0%, #fde68a 15%, #fbbf24 40%, #f59e0b 70%, #fde68a 90%, #fef3c7 100%);
  background-size: 300% 300%;
  animation: gradientShift 5s ease-in-out infinite, goldPulse 3s ease-in-out infinite;
  border-radius: 28px;
  padding: 2.2rem 2rem;
  margin-bottom: 1.2rem;
  overflow: hidden;
  border: 2.5px solid rgba(180,130,20,0.4);
  width: 100%; max-width: 480px;
}
.verific-ticket::before {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
  animation: ticketShine 4s ease-in-out infinite;
  pointer-events: none;
}
.verific-ticket::after {
  content: '';
  position: absolute;
  inset: 8px;
  border: 2px dashed rgba(120,80,0,0.18);
  border-radius: 18px;
  pointer-events: none;
}
.verific-ticket-header {
  text-align: center;
  margin-bottom: 1.2rem;
  position: relative; z-index: 1;
}
.verific-ticket-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 4px 12px rgba(180,130,0,0.4));
  animation: float 3s ease-in-out infinite;
}
.verific-ticket-title {
  font-size: 1.2rem;
  font-weight: 900;
  color: #78350f;
  letter-spacing: 3px;
  text-transform: uppercase;
  font-family: "Outfit", "Inter", sans-serif;
  margin: 0;
  text-shadow: 0 1px 2px rgba(255,255,255,0.5);
}
.verific-ticket-subtitle {
  font-size: 0.76rem;
  color: #92400e;
  font-weight: 700;
  letter-spacing: 1.5px;
  margin-top: 6px;
  font-family: "Outfit", "Inter", sans-serif;
}
.verific-ticket-divider {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 1rem 0;
  position: relative; z-index: 1;
}
.verific-ticket-divider::before,
.verific-ticket-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(120,53,15,0.25), transparent);
}
.verific-ticket-divider span {
  font-size: 0.65rem;
  color: #92400e;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-family: "Inter", sans-serif;
}
.verific-ticket-field {
  position: relative; z-index: 1;
  background: rgba(255,255,255,0.5);
  backdrop-filter: blur(12px);
  border: 1.5px solid rgba(180,130,20,0.22);
  border-radius: 18px;
  padding: 14px 18px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
}
.verific-ticket-field:hover {
  background: rgba(255,255,255,0.75);
  transform: translateX(6px);
  box-shadow: 0 6px 24px rgba(180,130,0,0.15);
  border-color: rgba(180,130,20,0.35);
}
.verific-ticket-field-icon {
  width: 42px; height: 42px;
  border-radius: 14px;
  background: linear-gradient(135deg, #b45309, #92400e);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(180,83,9,0.25);
}
.verific-ticket-field-label {
  font-size: 0.65rem;
  color: #92400e;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: "Inter", sans-serif;
  margin-bottom: 2px;
}
.verific-ticket-field-value {
  font-size: 0.95rem;
  color: #451a03;
  font-weight: 700;
  font-family: "Inter", sans-serif;
  letter-spacing: -0.01em;
  word-break: break-all;
}
.verific-ticket-footer {
  position: relative; z-index: 1;
  text-align: center;
  margin-top: 1rem;
  padding: 10px 12px;
  background: rgba(120,53,15,0.08);
  border-radius: 12px;
  border: 1px solid rgba(120,53,15,0.08);
}
.verific-ticket-footer p {
  margin: 0;
  font-size: 0.75rem;
  color: #78350f;
  font-weight: 600;
  font-family: "Inter", sans-serif;
  line-height: 1.5;
}
.verific-ticket-stamp {
  position: absolute;
  bottom: 16px; right: 20px;
  font-size: 3.5rem;
  opacity: 0.08;
  transform: rotate(-15deg);
  pointer-events: none;
  z-index: 0;
}
.verific-btn-download {
  display: inline-flex; align-items: center; gap: 12px;
 
  background-size: 200% 200%;
  animation: gradientShift 5s ease-in-out infinite;
  color: #000000; border: none; border-radius: 20px;
  padding: 16px 40px; font-size: 1rem; font-weight: 800;
  cursor: pointer; transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 0 6px 28px rgba(120,53,15,0.3), 0 2px 4px rgba(0,0,0,0.06);
  text-decoration: none; font-family: "Outfit", "Inter", sans-serif;
  letter-spacing: -0.01em; position: relative; overflow: hidden;
}
.verific-btn-download::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%);
  pointer-events: none;
}
.verific-btn-download:hover {
  transform: translateY(-4px) scale(1.04);
  box-shadow: 0 16px 50px rgba(120,53,15,0.4), 0 4px 8px rgba(0,0,0,0.08);
}
.verific-btn-download:active { transform: translateY(0) scale(0.97); }

/* ── Sticky save banner ── */
.verific-save-banner {
  position: sticky; top: 0; z-index: 50;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);
  color: #fff; text-align: center;
  padding: 14px 20px; border-radius: 0 0 20px 20px;
  box-shadow: 0 8px 32px rgba(220,38,38,0.35);
  animation: fadeInUp 0.5s ease, pulse 2.5s ease-in-out infinite;
  font-family: 'Outfit', 'Inter', sans-serif;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  flex-wrap: wrap;
  max-width: 540px; width: 100%; margin: 0 auto 1rem;
}
.verific-save-banner strong {
  font-size: 0.92rem; font-weight: 800;
  text-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.verific-save-banner .verific-save-icon {
  font-size: 1.3rem; animation: float 2s ease-in-out infinite;
}

/* ── Highlight download button ── */
.verific-btn-download-highlight {
  display: inline-flex; align-items: center; gap: 12px;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);
  background-size: 200% 200%;
  animation: gradientShift 3s ease-in-out infinite, glowPulse 2s ease-in-out infinite;
  color: #fff; border: none; border-radius: 20px;
  padding: 18px 44px; font-size: 1.1rem; font-weight: 900;
  cursor: pointer; transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 0 8px 32px rgba(220,38,38,0.4), 0 2px 4px rgba(0,0,0,0.1);
  text-decoration: none; font-family: 'Outfit', 'Inter', sans-serif;
  letter-spacing: 0.02em; position: relative; overflow: hidden;
  width: 100%; max-width: 400px; justify-content: center;
}
.verific-btn-download-highlight::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
  pointer-events: none;
}
.verific-btn-download-highlight:hover {
  transform: translateY(-4px) scale(1.04);
  box-shadow: 0 16px 50px rgba(220,38,38,0.5), 0 4px 8px rgba(0,0,0,0.12);
}
.verific-btn-download-highlight:active { transform: translateY(0) scale(0.97); }

/* ── Critical step highlight ── */
.verific-critical-step {
  background: rgba(220,38,38,0.08) !important;
  border: 2px solid rgba(220,38,38,0.25) !important;
  border-radius: 10px;
  padding: 8px 10px;
  animation: pulse 3s ease-in-out infinite;
}

/* ── Success celebration text ── */
.verific-celebration-text {
  font-size: 2.8rem;
  font-weight: 900;
  background: linear-gradient(135deg, #0197b3 0%, #a855f7 30%, #ff6b35 60%, #ffbb00 100%);
  background-size: 300% 300%;
  animation: gradientShift 4s ease-in-out infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.03em;
  line-height: 1.1;
  font-family: "Outfit", "Inter", sans-serif;
}

/* ── Firework burst ── */
.verific-firework {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

@media (max-width: 520px) {
  .verific-glass { border-radius: 24px; }
  .verific-inner { padding: 1.5rem 1rem; }
  .verific-inner--top { padding-top: 2rem; }
  .verific-countdown-item { min-width: 56px; padding: 10px 12px; }
  .verific-countdown-number { font-size: 1.5rem; }
  .verific-countdown-grid { gap: 5px; }
  .verific-logo { height: 72px; }
  .verific-ticket { padding: 1.6rem 1.3rem; border-radius: 22px; }
  .verific-ticket-title { font-size: 1rem; letter-spacing: 2px; }
  .verific-btn-download { padding: 14px 30px; font-size: 0.92rem; }
  .verific-celebration-text { font-size: 2rem; }
  .verific-step { padding: 14px 16px; }
}
}
`;

function Confetti() {
  const colors = [
    "#0197b3",
    "#003b5c",
    "#ffbb00",
    "#ff9500",
    "#10b981",
    "#0ea5e9",
    "#8b5cf6",
    "#f472b6",
    "#ff6b6b",
    "#a855f7",
    "#14b8a6",
    "#f59e0b",
    "#22d3ee",
    "#e879f9",
  ];
  const pieces = Array.from({ length: 90 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    bg: colors[i % colors.length],
    delay: `${Math.random() * 4}s`,
    duration: `${2 + Math.random() * 4}s`,
    w: `${4 + Math.random() * 12}px`,
    h: `${3 + Math.random() * 10}px`,
    rot: `${Math.random() * 360}deg`,
  }));
  return (
    <div className="verific-confetti">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            left: p.left,
            background: p.bg,
            width: p.w,
            height: p.h,
            animationDelay: p.delay,
            animationDuration: p.duration,
            borderRadius:
              Math.random() > 0.4
                ? "50%"
                : Math.random() > 0.5
                  ? "2px"
                  : "999px",
            opacity: 0.8 + Math.random() * 0.2,
          }}
        />
      ))}
    </div>
  );
}

function EmojiRain() {
  const emojis = [
    "🎉",
    "🥳",
    "✨",
    "🌟",
    "💫",
    "🎊",
    "💛",
    "🔥",
    "⭐",
    "🏆",
    "💪",
    "🎯",
    "❤️‍🔥",
  ];
  const items = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    emoji: emojis[i % emojis.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 6}s`,
    duration: `${4 + Math.random() * 5}s`,
  }));
  return (
    <div className="verific-emoji-rain">
      {items.map((item) => (
        <span
          key={item.id}
          style={{
            left: item.left,
            animationDelay: item.delay,
            animationDuration: item.duration,
          }}
        >
          {item.emoji}
        </span>
      ))}
    </div>
  );
}

function BackgroundOrbs() {
  return (
    <>
      <div className="verific-orb verific-orb--1" />
      <div className="verific-orb verific-orb--2" />
      <div className="verific-orb verific-orb--3" />
      <div className="verific-orb verific-orb--4" />
    </>
  );
}

function CheckIcon() {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Pulse rings */}
      <div
        style={{
          position: "absolute",
          inset: "-16px",
          borderRadius: "50%",
          border: "2.5px solid rgba(1,151,179,0.25)",
          animation: "ringPulse 2s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "-32px",
          borderRadius: "50%",
          border: "2px solid rgba(168,85,247,0.12)",
          animation: "ringPulse 2s ease-in-out 0.4s infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "-48px",
          borderRadius: "50%",
          border: "1.5px solid rgba(255,187,0,0.08)",
          animation: "ringPulse 2s ease-in-out 0.8s infinite",
        }}
      />
      <svg
        width="110"
        height="110"
        viewBox="0 0 96 96"
        style={{ display: "block", position: "relative", zIndex: 1 }}
      >
        <defs>
          <linearGradient id="tealGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0197b3" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#003b5c" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="48" cy="48" r="46" fill="url(#tealGrad)" opacity="0.06" />
        <circle cx="48" cy="48" r="40" fill="url(#tealGrad)" opacity="0.1" />
        <circle
          cx="48"
          cy="48"
          r="36"
          fill="url(#tealGrad)"
          filter="url(#glow)"
          style={{ animation: "badgeGlow 2.5s ease-in-out infinite" }}
        />
        <path
          d="M32 48 L42 58 L64 36"
          fill="none"
          stroke="#fff"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 50,
            animation: "checkDraw 0.8s ease 0.4s both",
          }}
        />
      </svg>
    </div>
  );
}

const LAUNCH_DATE = new Date("2026-05-12T00:00:00");

const getTimeLeft = () => {
  const now = new Date();
  const diff = LAUNCH_DATE - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

function RitaLogo() {
  return (
    <img
      src="https://res.cloudinary.com/db8e98ggo/image/upload/v1773687253/logoderita_nncelm.png"
      alt="Rita Fit"
      className="verific-logo"
    />
  );
}

function CountdownTimer({ dark = false }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const items = [
    { value: timeLeft.days, label: "Días" },
    { value: timeLeft.hours, label: "Horas" },
    { value: timeLeft.minutes, label: "Min" },
    { value: timeLeft.seconds, label: "Seg" },
  ];

  return (
    <div
      className={`verific-countdown${dark ? " verific-countdown--dark" : ""}`}
    >
      <p className="verific-countdown-label">🚀 Lanzamiento oficial en:</p>
      <div className="verific-countdown-grid">
        {items.map((item, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="verific-countdown-sep">:</span>}
            <div className="verific-countdown-item">
              <span className="verific-countdown-number">
                {String(item.value).padStart(2, "0")}
              </span>
              <span className="verific-countdown-unit">{item.label}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function drawTicketImage(email, password) {
  const W = 900,
    H = 520;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Background gold gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#fef3c7");
  bg.addColorStop(0.3, "#fde68a");
  bg.addColorStop(0.6, "#fbbf24");
  bg.addColorStop(1, "#f59e0b");
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, 32);
  ctx.fill();

  // Dashed inner border
  ctx.strokeStyle = "rgba(120,53,15,0.2)";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.roundRect(14, 14, W - 28, H - 28, 24);
  ctx.stroke();
  ctx.setLineDash([]);

  // Decorative circles left/right
  ctx.fillStyle = "rgba(120,53,15,0.06)";
  ctx.beginPath();
  ctx.arc(-20, H / 2, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(W + 20, H / 2, 50, 0, Math.PI * 2);
  ctx.fill();

  // Star icon top
  ctx.font = "48px serif";
  ctx.textAlign = "center";
  ctx.fillText("🎫", W / 2, 70);

  // Title
  ctx.font = "900 22px Inter, sans-serif";
  ctx.fillStyle = "#78350f";
  ctx.letterSpacing = "3px";
  ctx.fillText("TICKET DE ACCESO", W / 2, 110);

  // Subtitle
  ctx.font = "600 13px Inter, sans-serif";
  ctx.fillStyle = "#92400e";
  ctx.fillText("Rita Fit · Preventa Exclusiva", W / 2, 134);

  // Divider line
  const divY = 160;
  const lineGrad = ctx.createLinearGradient(60, divY, W - 60, divY);
  lineGrad.addColorStop(0, "transparent");
  lineGrad.addColorStop(0.5, "rgba(120,53,15,0.3)");
  lineGrad.addColorStop(1, "transparent");
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, divY);
  ctx.lineTo(W - 60, divY);
  ctx.stroke();

  ctx.font = "700 10px Inter, sans-serif";
  ctx.fillStyle = "#92400e";
  ctx.fillText("CREDENCIALES", W / 2, divY + 20);

  // Field backgrounds
  const drawField = (y, icon, label, value) => {
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.beginPath();
    ctx.roundRect(60, y, W - 120, 70, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(180,130,20,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(60, y, W - 120, 70, 16);
    ctx.stroke();

    // Icon box
    const iconGrad = ctx.createLinearGradient(80, y + 14, 80, y + 56);
    iconGrad.addColorStop(0, "#b45309");
    iconGrad.addColorStop(1, "#92400e");
    ctx.fillStyle = iconGrad;
    ctx.beginPath();
    ctx.roundRect(80, y + 14, 42, 42, 10);
    ctx.fill();
    ctx.font = "22px serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(icon, 101, y + 43);

    // Label
    ctx.textAlign = "left";
    ctx.font = "700 11px Inter, sans-serif";
    ctx.fillStyle = "#92400e";
    ctx.fillText(label, 138, y + 32);

    // Value
    ctx.font = "700 16px Inter, sans-serif";
    ctx.fillStyle = "#451a03";
    ctx.fillText(value, 138, y + 54);
  };

  drawField(200, "📧", "CORREO ELECTRÓNICO", email || "");
  drawField(290, "🔑", "CONTRASEÑA TEMPORAL", password || "");

  // Footer
  ctx.fillStyle = "rgba(120,53,15,0.08)";
  ctx.beginPath();
  ctx.roundRect(60, 385, W - 120, 50, 12);
  ctx.fill();
  ctx.textAlign = "center";
  ctx.font = "600 12px Inter, sans-serif";
  ctx.fillStyle = "#78350f";
  ctx.fillText(
    "🔒 Guarda este ticket. Podrás cambiar tu contraseña al iniciar sesión.",
    W / 2,
    416,
  );

  // Watermark stamp
  ctx.font = "bold 80px Inter, sans-serif";
  ctx.fillStyle = "rgba(120,53,15,0.04)";
  ctx.save();
  ctx.translate(W - 120, H - 60);
  ctx.rotate(-0.26);
  ctx.fillText("RITA", 0, 0);
  ctx.restore();

  // Bottom branding
  ctx.textAlign = "center";
  ctx.font = "500 11px Inter, sans-serif";
  ctx.fillStyle = "rgba(120,53,15,0.4)";
  ctx.fillText(
    "ritafit.com · " + new Date().toLocaleDateString(),
    W / 2,
    H - 20,
  );

  return canvas;
}

export default function Verific() {
  const [params] = useSearchParams();
  const [estado, setEstado] = useState("loading");
  const [usuario, setUsuario] = useState(null);
  const [emailEnUso, setEmailEnUso] = useState(false);
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [verificandoEmail, setVerificandoEmail] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [paymentData, setPaymentData] = useState(null);
  const navigate = useNavigate();
  const ticketRef = useRef(null);

  /*conetar el webvie*/

  const irALogin = () => {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "GO_LOGIN",
          email: usuario?.email || paymentData?.email,
          codigo: usuario?.tempPassword || paymentData?.authorizationCode,
        }),
      );
    } else {
      // por si abres la web en navegador normal
      navigate("/");
    }
  };

  const handleDownloadTicket = useCallback(() => {
    if (!usuario) return;
    const canvas = drawTicketImage(usuario.email, usuario.tempPassword);
    const link = document.createElement("a");
    link.download = "Rita-Ticket-Acceso.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [usuario]);

  const handleNuevoEmail = async () => {
    if (!nuevoEmail.trim()) {
      setEmailError("Ingresa un correo electrónico");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(nuevoEmail.trim())) {
      setEmailError("Ingresa un correo electrónico válido");
      return;
    }
    setEmailError("");
    setVerificandoEmail(true);
    try {
      const resp = await fetch(
        "https://us-central1-rita-ede4f.cloudfunctions.net/api/updateEmail",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newEmail: nuevoEmail.trim(),
            userId: paymentData.clientTransactionId,
          }),
        },
      );
      const data = await resp.json();
      // // console.log(data, "Respuesta de verificación de nuevo email");

      if (!data.success) {
        setEmailError("Este correo también está en uso. Intenta con otro.");
      } else {
        setEmailEnUso(false);
        setUsuario({
          email: nuevoEmail.trim(),
          tempPassword: paymentData.authorizationCode,
        });
      }
    } catch {
      setEmailError("Error al verificar. Intenta de nuevo.");
    } finally {
      setVerificandoEmail(false);
    }
  };

  const id = Number(params.get("id"));
  const clientTransactionId = params.get("clientTransactionId");

  useEffect(() => {
    if (!id || !clientTransactionId) {
      setEstado("error");
      return;
    }

    const confirmarPago = async () => {
      try {
        const resp = await fetch(
          "https://us-central1-rita-ede4f.cloudfunctions.net/api/confirm",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, clientTxId: clientTransactionId }),
          },
        );

        const data = await resp.json();
        console.log(data);

        if (data.transactionStatus === "Approved" && data.amount === 4200) {
          setEstado("premium");
        } else if (data.transactionStatus === "Approved") {
          // Verificar si el email ya está en uso
          try {
            const emailResp = await fetch(
              "https://us-central1-rita-ede4f.cloudfunctions.net/api/Verificaremail",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: data.email,
                  userId: clientTransactionId,
                }),
              },
            );
            const emailData = await emailResp.json();

            if (emailData.exists) {
              // Email ya está en uso, guardar data y mostrar modal
              setPaymentData(data);
              setEmailEnUso(true);
              setEstado("approved");
            } else {
              // Email libre, continuar normal
              setEstado("approved");
              setUsuario({
                email: data.email,
                tempPassword: data.authorizationCode,
              });
            }
          } catch {
            // Si falla la verificación, continuar normal
            setEstado("approved");
            setUsuario({
              email: data.email,
              tempPassword: data.authorizationCode,
            });
          }
        } else {
          setEstado("rejected");
        }
      } catch (error) {
        console.error(error);
        setEstado("error");
      }
    };

    confirmarPago();
  }, [id, clientTransactionId]);

  // ── LOADING ──
  if (estado === "loading") {
    return (
      <>
        <style>{CSS}</style>
        <div
          className="verific-page"
          style={{
            background:
              "linear-gradient(160deg, #f0f9ff 0%, #e0f7fa 30%, #ede9fe 60%, #fefce8 100%)",
          }}
        >
          <BackgroundOrbs />
          <div className="verific-inner">
            <div
              className="verific-glass"
              style={{
                padding: "3.5rem 2.5rem",
                textAlign: "center",
                animation: "fadeInUp 0.7s cubic-bezier(0.34,1.56,0.64,1)",
              }}
            >
              <RitaLogo />
              <div
                style={{
                  fontSize: "2.5rem",
                  marginBottom: "0.5rem",
                  animation: "float 2.5s ease-in-out infinite",
                }}
              >
                ✨
              </div>
              <div className="verific-dots">
                <div className="verific-dot" />
                <div className="verific-dot" />
                <div className="verific-dot" />
              </div>
              <h2
                style={{
                  ...styles.title,
                  background: "linear-gradient(135deg, #0197b3, #a855f7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Verificando tu compra
              </h2>
              <p style={styles.text}>
                Confirmamos tu pago de forma segura. Solo tomará un momento.
              </p>
              <div
                style={{
                  margin: "1.2rem 0",
                  padding: "12px 16px",
                  background: "rgba(1,151,179,0.05)",
                  borderRadius: "16px",
                  border: "1px solid rgba(1,151,179,0.08)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.82rem",
                    color: "#0197b3",
                    fontWeight: 600,
                    fontFamily: '"Outfit", "Inter", sans-serif',
                  }}
                >
                  🔐 Tu transacción está siendo procesada con encriptación de
                  nivel bancario
                </p>
              </div>
              <CountdownTimer />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginTop: "1.5rem",
                  opacity: 0.5,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 1a4 4 0 0 0-4 4v3H3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-1V5a4 4 0 0 0-4-4zm2 7H6V5a2 2 0 1 1 4 0v3z"
                    fill="#64748b"
                  />
                </svg>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#64748b",
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 500,
                  }}
                >
                  Conexión segura encriptada
                </span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── PREMIUM ──
  if (estado === "premium") {
    return (
      <>
        <style>{CSS}</style>
        <Confetti />
        <EmojiRain />
        <div
          className="verific-page"
          style={{
            background:
              "linear-gradient(160deg, #f0f9ff 0%, #e0f7fa 25%, #ede9fe 50%, #fef3c7 75%, #fce7f3 100%)",
          }}
        >
          <BackgroundOrbs />
          <div className="verific-inner">
            <div
              className="verific-glass"
              style={{
                padding: "3.5rem 2.5rem",
                textAlign: "center",
                animation: "fadeInUp 0.7s cubic-bezier(0.34,1.56,0.64,1)",
                maxWidth: 480,
              }}
            >
              <RitaLogo />
              <div
                style={{
                  animation:
                    "scaleIn 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.2s both",
                  marginBottom: "1.5rem",
                }}
              >
                <CheckIcon />
              </div>
              <h1
                className="verific-celebration-text"
                style={{ margin: "0 0 1rem" }}
              >
                ¡Felicidades!
              </h1>
              <p
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  fontFamily: '"Outfit", "Inter", sans-serif',
                  lineHeight: 1.6,
                  margin: "0 0 1.5rem",
                }}
              >
                Has actualizado tu cuenta a{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #ffbb00, #ff9500)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontWeight: 900,
                  }}
                >
                  Premium
                </span>{" "}
                💎
              </p>
              <CountdownTimer />
              <button
                className="verific-btn-primary"
                style={{ marginTop: "1.5rem" }}
                onClick={irALogin}
              >
                🚀 Ir al inicio
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── APPROVED ──
  if (estado === "approved") {
    const steps = [
      { icon: "🎉", text: "Pago confirmado exitosamente" },
      { icon: "👤", text: "Tu cuenta Rita ha sido creada" },
      { icon: "🚀", text: "Lanzamiento oficial: Julio 2026" },
      { icon: "💎", text: "Acceso VIP garantizado para ti" },
      { icon: "📞", text: "Nuestro equipo te contactará pronto" },
    ];

    return (
      <>
        <style>{CSS}</style>
        <Confetti />
        <EmojiRain />

        {/* Modal email en uso */}
        {emailEnUso && (
          <div className="verific-email-overlay">
            <div className="verific-email-modal">
              <div className="verific-email-modal-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 9v4m0 4h.01"
                    stroke="#fff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 2L2 20h20L12 2z"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: "#0f172a",
                  margin: "0 0 0.5rem",
                  fontFamily: '"Outfit", "Inter", sans-serif',
                }}
              >
                Correo ya en uso
              </h2>
              <p
                style={{
                  fontSize: "0.92rem",
                  color: "#64748b",
                  margin: "0 0 1.2rem",
                  lineHeight: 1.6,
                  fontFamily: '"Outfit", "Inter", sans-serif',
                }}
              >
                El correo{" "}
                <strong style={{ color: "#0f172a" }}>
                  {paymentData?.email}
                </strong>{" "}
                ya está registrado por otro usuario. Por favor ingresa un correo
                diferente para crear tu cuenta.
              </p>
              <div style={{ textAlign: "left" }}>
                <label
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: "6px",
                    display: "block",
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  📧 Nuevo correo electrónico
                </label>
                <input
                  type="email"
                  className="verific-email-input"
                  placeholder="tu@correo.com"
                  value={nuevoEmail}
                  onChange={(e) => {
                    setNuevoEmail(e.target.value);
                    setEmailError("");
                  }}
                />
                {emailError && (
                  <p className="verific-email-error">⚠️ {emailError}</p>
                )}
              </div>
              <button
                className="verific-email-btn"
                onClick={handleNuevoEmail}
                disabled={verificandoEmail}
              >
                {verificandoEmail ? "Verificando..." : "✅ Usar este correo"}
              </button>
            </div>
          </div>
        )}

        <div
          className="verific-page"
          style={{
            background:
              "linear-gradient(160deg, #f0f9ff 0%, #e0f7fa 25%, #ede9fe 50%, #fef3c7 75%, #fce7f3 100%)",
          }}
        >
          <BackgroundOrbs />

          <div
            className="verific-inner verific-inner--top"
            style={{ maxWidth: 540, margin: "0 auto" }}
          >
            <RitaLogo />

            {/* Badge */}
            <div
              style={{
                animation:
                  "bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s both",
                marginBottom: "1.2rem",
              }}
            >
              <span className="verific-badge">🎊 Preventa completada</span>
            </div>

            {/* Check + Hero */}
            <div
              style={{
                animation:
                  "scaleIn 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.2s both",
                textAlign: "center",
                marginBottom: "2rem",
              }}
            >
              <CheckIcon />
              <h1
                className="verific-celebration-text"
                style={{ margin: "1.2rem 0 0" }}
              >
                ¡Bienvenido a Rita!
              </h1>
              <p style={styles.heroSub}>
                Tu compra en preventa fue exitosa. Ya eres parte del futuro. 🌟
              </p>
            </div>

            {/* Golden Ticket */}
            <div
              className="verific-ticket"
              ref={ticketRef}
              style={{
                animation:
                  "fadeInUp 0.6s ease 0.55s both, ticketFloat 5s ease-in-out 1.5s infinite",
              }}
            >
              <div className="verific-ticket-stamp">RITA</div>
              <div className="verific-ticket-header">
                <span className="verific-ticket-icon">🔑</span>
                <p className="verific-ticket-title">Tu Usuario Temporal</p>
                <p className="verific-ticket-subtitle">
                  Rita Fit · Preventa Exclusiva
                </p>
              </div>

              {/* Alert banner - CRITICAL */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(220,38,38,0.15) 0%, rgba(185,28,28,0.1) 100%)",
                  border: "2.5px solid rgba(220,38,38,0.4)",
                  borderRadius: "16px",
                  padding: "16px 18px",
                  marginBottom: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  position: "relative",
                  zIndex: 1,
                  animation: "pulse 3s ease-in-out infinite",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span
                    style={{
                      fontSize: "1.6rem",
                      flexShrink: 0,
                      animation: "float 1.5s ease-in-out infinite",
                    }}
                  >
                    🚨
                  </span>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.88rem",
                      color: "#991b1b",
                      fontWeight: 900,
                      fontFamily: "'Inter', sans-serif",
                      lineHeight: 1.4,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    ¡GUARDA ESTOS DATOS AHORA!
                  </p>
                  <span
                    style={{
                      fontSize: "1.6rem",
                      flexShrink: 0,
                      animation: "float 1.5s ease-in-out infinite",
                    }}
                  >
                    🚨
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.78rem",
                    color: "#78350f",
                    fontWeight: 600,
                    fontFamily: "'Inter', sans-serif",
                    lineHeight: 1.5,
                    textAlign: "center",
                  }}
                >
                  Sin estos datos <strong>no podrás acceder</strong> a tu
                  cuenta. Haz una captura de pantalla
                </p>
              </div>

              <div className="verific-ticket-divider">
                <span>Tus datos de acceso</span>
              </div>

              <div className="verific-ticket-field">
                <div className="verific-ticket-field-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                      stroke="#fef3c7"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points="22,6 12,13 2,6"
                      stroke="#fef3c7"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="verific-ticket-field-label">
                    📧 Tu correo de acceso
                  </div>
                  <div className="verific-ticket-field-value">
                    {usuario?.email}
                  </div>
                </div>
              </div>

              <div
                className="verific-ticket-field"
                style={{
                  border: "2px solid rgba(180,83,9,0.35)",
                  background: "rgba(255,255,255,0.7)",
                }}
              >
                <div
                  className="verific-ticket-field-icon"
                  style={{
                    background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                    boxShadow: "0 2px 12px rgba(220,38,38,0.35)",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3"
                      y="11"
                      width="18"
                      height="11"
                      rx="2"
                      ry="2"
                      stroke="#fef3c7"
                      strokeWidth="2"
                    />
                    <path
                      d="M7 11V7a5 5 0 0 1 10 0v4"
                      stroke="#fef3c7"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    className="verific-ticket-field-label"
                    style={{ color: "#b91c1c" }}
                  >
                    🔑 Contraseña temporal (guárdala)
                  </div>
                  <div
                    className="verific-ticket-field-value"
                    style={{
                      fontFamily: "monospace",
                      letterSpacing: "2px",
                      fontSize: "1.1rem",
                      background: "rgba(120,53,15,0.06)",
                      padding: "6px 10px",
                      borderRadius: "8px",
                      marginTop: "4px",
                      display: "inline-block",
                    }}
                  >
                    {usuario?.tempPassword}
                  </div>
                </div>
              </div>

              {/* Steps to follow */}
              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  background: "rgba(255,255,255,0.45)",
                  backdropFilter: "blur(8px)",
                  borderRadius: "14px",
                  padding: "14px 16px",
                  marginTop: "0.8rem",
                  border: "1.5px solid rgba(180,130,20,0.18)",
                }}
              >
                <p
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    color: "#78350f",
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  ¿Qué hacer ahora?
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {[
                    {
                      num: "1",
                      text: "📧 Revisa tu correo hemos enviado tus datos de acceso",
                      critical: true,
                    },
                    {
                      num: "2",
                      text: "📱 Abre la app e inicia sesión con estos datos",
                      critical: false,
                    },
                    {
                      num: "3",
                      text: "🔐 Cambia tu contraseña una vez dentro",
                      critical: false,
                    },
                  ].map((step) => (
                    <div
                      key={step.num}
                      className={step.critical ? "verific-critical-step" : ""}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: step.critical ? "8px 10px" : undefined,
                      }}
                    >
                      <span
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: step.critical
                            ? "linear-gradient(135deg, #dc2626, #991b1b)"
                            : "linear-gradient(135deg, #b45309, #92400e)",
                          color: "#fef3c7",
                          fontSize: "0.72rem",
                          fontWeight: 900,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxShadow: step.critical
                            ? "0 2px 8px rgba(220,38,38,0.3)"
                            : "none",
                        }}
                      >
                        {step.num}
                      </span>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: step.critical ? "#991b1b" : "#78350f",
                          fontWeight: step.critical ? 800 : 600,
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {step.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="verific-ticket-footer">
                <p>
                  🔒 Este es tu usuario temporal. Podrás cambiar tu contraseña
                  después de iniciar sesión.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div
              style={{
                animation: "fadeInUp 0.7s ease 1s both",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                alignItems: "center",
              }}
            >
              <button className="verific-btn-ghost" onClick={irALogin}>
                Ir al inicio
              </button>
            </div>

            {/* Success message card */}
            <div
              className="verific-glass"
              style={{
                padding: "1.5rem",
                marginBottom: "1.2rem",
                marginTop: "1.5rem",
                animation: "slideUp 0.7s ease 0.3s both",
                textAlign: "center",

                border: "1.5px solid rgba(16,185,129,0.2)",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏆</div>
              <p
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#898d8c",
                  fontFamily: '"Outfit", "Inter", sans-serif',
                }}
              >
                ¡Felicidades! Eres parte del grupo exclusivo de Rita Fit.
                Prepárate para una experiencia fitness revolucionaria diseñada
                solo para ti.
              </p>
            </div>

            {/* Trust footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                marginTop: "2.5rem",
                opacity: 0.5,
                animation: "fadeIn 0.6s ease 1.4s both",
                flexWrap: "wrap",
              }}
            >
              {[
                "🔒 Pagos seguros",
                "🛡️ Datos encriptados",
                "✅ SSL protegido",
              ].map((text, i) => (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <span
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #0197b3, #a855f7)",
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "#64748b",
                      fontFamily: '"Outfit", "Inter", sans-serif',
                      fontWeight: 600,
                    }}
                  >
                    {text}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── REJECTED ──
  if (estado === "rejected") {
    return (
      <>
        <style>{CSS}</style>
        <div
          className="verific-page"
          style={{
            background:
              "linear-gradient(160deg, #fef2f2 0%, #fff7ed 40%, #fefce8 80%, #fce7f3 100%)",
          }}
        >
          <BackgroundOrbs />
          <div className="verific-inner">
            <div
              className="verific-glass"
              style={{
                padding: "3.5rem 2.5rem",
                textAlign: "center",
                animation: "fadeInUp 0.7s cubic-bezier(0.34,1.56,0.64,1)",
                maxWidth: 480,
              }}
            >
              <RitaLogo />
              <div style={styles.iconError}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="#fff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2
                style={{
                  ...styles.title,
                  color: "#dc2626",
                  marginBottom: "0.5rem",
                }}
              >
                Pago no aprobado
              </h2>
              <p style={{ ...styles.text, marginBottom: "0.3rem" }}>
                Tu entidad financiera no aprobó la transacción.
              </p>
              <p
                style={{
                  ...styles.text,
                  fontSize: "0.85rem",
                  color: "#94a3b8",
                  marginBottom: "0.5rem",
                }}
              >
                Verifica los datos de tu tarjeta o intenta con otro método de
                pago.
              </p>
              <div
                style={{
                  margin: "1rem 0",
                  padding: "12px 16px",
                  background: "rgba(220,38,38,0.04)",
                  borderRadius: "16px",
                  border: "1px solid rgba(220,38,38,0.1)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.82rem",
                    color: "#b91c1c",
                    fontWeight: 600,
                    fontFamily: '"Outfit", "Inter", sans-serif',
                  }}
                >
                  💡 Tip: Asegúrate de tener fondos suficientes y que tu banco
                  no esté bloqueando compras en línea
                </p>
              </div>
              <CountdownTimer />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  alignItems: "center",
                }}
              >
                <button
                  className="verific-btn-error"
                  onClick={() => navigate(-1)}
                >
                  🔄 Reintentar pago
                </button>
                <button
                  className="verific-btn-ghost"
                  onClick={() => navigate("/")}
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── ERROR ──
  return (
    <>
      <style>{CSS}</style>
      <div
        className="verific-page"
        style={{
          background:
            "linear-gradient(160deg, #fef2f2 0%, #f8fafc 40%, #fefce8 80%, #ede9fe 100%)",
        }}
      >
        <BackgroundOrbs />
        <div className="verific-inner">
          <div
            className="verific-glass"
            style={{
              padding: "3.5rem 2.5rem",
              textAlign: "center",
              animation: "fadeInUp 0.7s cubic-bezier(0.34,1.56,0.64,1)",
              maxWidth: 480,
            }}
          >
            <RitaLogo />
            <div
              style={{
                ...styles.iconError,
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                boxShadow: "0 8px 32px rgba(245,158,11,0.3)",
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 9v4m0 4h.01M12 2L2 20h20L12 2z"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 style={{ ...styles.title, color: "#d97706" }}>
              Algo salió mal
            </h2>
            <p style={{ ...styles.text, marginBottom: "0.3rem" }}>
              No pudimos verificar tu pago en este momento.
            </p>
            <p
              style={{
                ...styles.text,
                fontSize: "0.85rem",
                color: "#94a3b8",
                marginBottom: "0.5rem",
              }}
            >
              Verifica tu conexión a internet e intenta de nuevo.
            </p>
            <div
              style={{
                margin: "1rem 0",
                padding: "12px 16px",
                background: "rgba(217,119,6,0.04)",
                borderRadius: "16px",
                border: "1px solid rgba(217,119,6,0.1)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "0.82rem",
                  color: "#b45309",
                  fontWeight: 600,
                  fontFamily: '"Outfit", "Inter", sans-serif',
                }}
              >
                📧 Si el problema persiste, escríbenos y te ayudaremos de
                inmediato
              </p>
            </div>
            <CountdownTimer />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <button
                className="verific-btn-ghost"
                onClick={() => navigate("/")}
              >
                🏠 Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  heroTitle: {
    fontSize: "2.6rem",
    fontWeight: 900,
    background:
      "linear-gradient(135deg, #0197b3 0%, #a855f7 50%, #003b5c 100%)",
    backgroundSize: "200% 200%",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "1rem 0 0",
    letterSpacing: "-0.04em",
    lineHeight: 1.05,
    fontFamily: '"Outfit", "Inter", sans-serif',
  },
  heroSub: {
    fontSize: "1.1rem",
    color: "#64748b",
    margin: "0.8rem 0 0",
    fontWeight: 500,
    fontFamily: '"Outfit", "Inter", sans-serif',
    lineHeight: 1.6,
    letterSpacing: "-0.01em",
  },
  title: {
    fontSize: "1.6rem",
    margin: "0.5rem 0",
    fontWeight: 900,
    letterSpacing: "-0.03em",
    color: "#0f172a",
    fontFamily: '"Outfit", "Inter", sans-serif',
  },
  text: {
    color: "#64748b",
    fontSize: "0.95rem",
    margin: "0.4rem 0",
    fontFamily: '"Outfit", "Inter", sans-serif',
    lineHeight: 1.65,
  },
  bannerCard: {
    background:
      "linear-gradient(135deg, #003b5c 0%, #015a7a 30%, #0197b3 60%, #a855f7 100%)",
    backgroundSize: "200% 200%",
    animation: "gradientShift 8s ease-in-out infinite",
    borderRadius: "28px",
    padding: "2.5rem 2rem",
    marginBottom: "1.8rem",
    textAlign: "center",
    boxShadow: "0 16px 52px rgba(0,59,92,0.3), 0 4px 12px rgba(0,0,0,0.06)",
    position: "relative",
    overflow: "hidden",
  },
  bannerTitle: {
    fontSize: "1.3rem",
    color: "#ffbb00",
    fontWeight: 900,
    margin: "0 0 0.6rem",
    letterSpacing: "-0.01em",
    fontFamily: '"Outfit", "Inter", sans-serif',
    textShadow: "0 2px 12px rgba(255,187,0,0.3)",
  },
  bannerText: {
    fontSize: "0.95rem",
    color: "rgba(255,255,255,0.9)",
    margin: 0,
    lineHeight: 1.7,
    fontFamily: '"Outfit", "Inter", sans-serif',
  },
  iconError: {
    width: "80px",
    height: "80px",
    borderRadius: "24px",
    background: "linear-gradient(135deg, #ff6b6b, #ef4444, #dc2626)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1.2rem",
    boxShadow: "0 10px 32px rgba(220,38,38,0.25)",
    animation: "bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1)",
  },
};
