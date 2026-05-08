"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bluetooth, Usb, Wifi } from "lucide-react";
import { motion } from "motion/react";
import styles from "./styles.module.css";

type DeviceKind = "phone" | "handheld" | "tracker" | "router" | "board" | "solar" | "pocket" | "walkie";
type LinkProto = "lora";
type PacketTone = "toneLora";

type Device = {
    id: string;
    label: string;
    role: "Клієнт" | "Роутер" | "Термінал";
    kind?: DeviceKind;
    asset?: string;
    terminal?: boolean;
    protocol?: "bt" | "wifi" | "usb";
    x: number;
    y: number;
    w: number;
    h: number;
};

const DEVICES: Device[] = [
    { id: "phone", label: "Телефон", role: "Клієнт", kind: "phone", x: 47, y: 198, w: 142, h: 228 },
    { id: "tag", label: "RAK Tag", role: "Клієнт", asset: "rak_wismesh_tag.svg", x: 610, y: 64, w: 64, h: 78 },
    { id: "tracker", label: "T1000-E", role: "Клієнт", asset: "tracker-t1000-e.svg", x: 395, y: 136, w: 74, h: 92 },
    { id: "thinknode", label: "ThinkNode M1", role: "Клієнт", asset: "thinknode_m1.svg", x: 830, y: 154, w: 82, h: 98 },
    { id: "deck", label: "T-Deck", role: "Клієнт", asset: "t-deck.svg", protocol: "wifi", x: 350, y: 330, w: 84, h: 100 },
    { id: "router", label: "Station G2", role: "Роутер", asset: "station-g2.svg", x: 612, y: 286, w: 88, h: 120 },
    { id: "board", label: "RAK4631", role: "Клієнт", asset: "rak4631.svg", protocol: "usb", x: 850, y: 372, w: 96, h: 88 },
    { id: "heltec", label: "Heltec Pocket", role: "Клієнт", asset: "heltec_mesh_pocket.svg", protocol: "bt", x: 500, y: 510, w: 86, h: 100 },
    { id: "muzi", label: "Muzi R1", role: "Клієнт", asset: "muzi_r1_neo.svg", x: 790, y: 510, w: 82, h: 102 },
    { id: "terminal", label: "meshtastic-cli", role: "Термінал", terminal: true, x: 1000, y: 344, w: 118, h: 92 },
];

const STEP_DUR = 0.95;
const FLOOD_PAUSE = 1.35;
const PHONE_RELAY_ID = "heltec";
const USB_RELAY_ID = "board";

const MESH_LINKS: Link[] = [
    { a: "tag", b: "tracker", proto: "lora" },
    { a: "tag", b: "thinknode", proto: "lora" },
    { a: "tracker", b: "deck", proto: "lora" },
    { a: "tracker", b: "router", proto: "lora" },
    { a: "thinknode", b: "router", proto: "lora" },
    { a: "thinknode", b: "board", proto: "lora" },
    { a: "deck", b: "heltec", proto: "lora" },
    { a: "router", b: "heltec", proto: "lora" },
    { a: "router", b: "muzi", proto: "lora" },
    { a: "router", b: "board", proto: "lora" },
    { a: "board", b: "muzi", proto: "lora" },
    { a: "heltec", b: "muzi", proto: "lora" },
    { a: "tracker", b: "heltec", proto: "lora" },
    { a: "thinknode", b: "muzi", proto: "lora" },
];

type Link = { a: string; b: string; proto: LinkProto };
type FloodEdge = { id: string; from: string; to: string; wave: number };
type ExternalPulse = "bt-in" | "bt-out" | "usb" | null;

const FLOOD_SCENARIOS: Array<{ source: string; fromPhone?: boolean }> = [
    { source: "tracker" },
    { source: "thinknode" },
    { source: PHONE_RELAY_ID, fromPhone: true },
    { source: "board" },
    { source: "tag" },
];

const center = (d: Device) => ({ x: d.x + d.w / 2, y: d.y + d.h / 2 });
const edgeId = (a: string, b: string) => [a, b].sort().join("--");

function buildFloodSteps(adj: Record<string, string[]>, source: string): FloodEdge[] {
    const heard = new Set<string>([source]);
    let frontier = [source];
    const steps: FloodEdge[] = [];
    let wave = 0;

    while (frontier.length > 0) {
        const receivers: string[] = [];

        for (const sender of frontier) {
            for (const receiver of adj[sender] ?? []) {
                if (heard.has(receiver)) continue;

                heard.add(receiver);
                receivers.push(receiver);
                steps.push({ id: edgeId(sender, receiver), from: sender, to: receiver, wave });
            }
        }

        if (receivers.length === 0) break;

        frontier = receivers;
        wave++;
    }

    return steps;
}

export default function MeshTopology() {
    const byId = useMemo(() => Object.fromEntries(DEVICES.map((d) => [d.id, d])) as Record<string, Device>, []);
    const links = useMemo(() => MESH_LINKS, []);
    const adjacency = useMemo(() => {
        const meshIds = DEVICES.filter((device) => device.id !== "phone" && !device.terminal).map((device) => device.id);
        const adj: Record<string, string[]> = Object.fromEntries(meshIds.map((id) => [id, [] as string[]]));

        for (const link of links) {
            adj[link.a].push(link.b);
            adj[link.b].push(link.a);
        }

        return adj;
    }, [links]);

    const [activeEdges, setActiveEdges] = useState<FloodEdge[]>([]);
    const [activeNodes, setActiveNodes] = useState<string[]>([]);
    const [visitedEdges, setVisitedEdges] = useState<Set<string>>(new Set());
    const [externalPulse, setExternalPulse] = useState<ExternalPulse>(null);
    const scenarioRef = useRef(0);
    const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

    useEffect(() => {
        const timeouts = timeoutsRef.current;
        let stopped = false;

        const schedule = (fn: () => void, ms: number) => {
            const timeout = setTimeout(() => {
                timeouts.delete(timeout);
                if (!stopped) fn();
            }, ms);
            timeouts.add(timeout);
        };

        const runFlood = () => {
            if (stopped) return;

            const scenario = FLOOD_SCENARIOS[scenarioRef.current % FLOOD_SCENARIOS.length];
            scenarioRef.current++;

            const steps = buildFloodSteps(adjacency, scenario.source);
            const firstWaveDelay = scenario.fromPhone ? 950 : 350;
            let phoneDeliveryScheduled = false;
            let usbDeliveryScheduled = false;

            setActiveEdges([]);
            setActiveNodes([scenario.source]);
            setVisitedEdges(new Set());
            setExternalPulse(null);

            if (scenario.fromPhone) {
                setExternalPulse("bt-out");
                schedule(() => setExternalPulse(null), 850);
            }

            const waves = steps.reduce<FloodEdge[][]>((groups, step) => {
                groups[step.wave] = groups[step.wave] ?? [];
                groups[step.wave].push(step);
                return groups;
            }, []);

            waves.forEach((waveSteps, waveIndex) => {
                const delay = firstWaveDelay + waveIndex * STEP_DUR * 1000;

                schedule(() => {
                    setActiveEdges(waveSteps);
                    setActiveNodes([...new Set(waveSteps.flatMap((step) => [step.from, step.to]))]);
                    setVisitedEdges((current) => {
                        const next = new Set(current);
                        waveSteps.forEach((step) => next.add(step.id));
                        return next;
                    });
                }, delay);

                if (!scenario.fromPhone && !phoneDeliveryScheduled && waveSteps.some((step) => step.to === PHONE_RELAY_ID)) {
                    phoneDeliveryScheduled = true;
                    schedule(() => setExternalPulse("bt-in"), delay + STEP_DUR * 1000);
                    schedule(() => setExternalPulse(null), delay + STEP_DUR * 1000 + 900);
                }

                if (!usbDeliveryScheduled && waveSteps.some((step) => step.to === USB_RELAY_ID)) {
                    usbDeliveryScheduled = true;
                    schedule(() => setExternalPulse("usb"), delay + STEP_DUR * 1000);
                    schedule(() => setExternalPulse(null), delay + STEP_DUR * 1000 + 900);
                }
            });

            const totalMs = firstWaveDelay + waves.length * STEP_DUR * 1000;
            schedule(() => {
                setActiveEdges([]);
                setActiveNodes([]);
            }, totalMs);

            schedule(runFlood, totalMs + FLOOD_PAUSE * 1000);
        };

        runFlood();

        return () => {
            stopped = true;
            timeouts.forEach(clearTimeout);
            timeouts.clear();
        };
    }, [adjacency]);

    const router = byId.router;
    const routerC = center(router);

    return (
        <figure className={styles.wrap}>
            <svg
                viewBox="0 0 1140 720"
                className={styles.svg}
                role="img"
                aria-label="Схема Meshtastic mesh: телефон через Bluetooth підключається до LoRa-вузлів, які ретранслюють повідомлення"
            >
                <defs>
                    <pattern id="mt-grid" width="38" height="38" patternUnits="userSpaceOnUse">
                        <path d="M38 0H0V38" fill="none" className={styles.gridLine} />
                    </pattern>

                    <radialGradient id="mt-router-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" className={styles.routerGlowStart} />
                        <stop offset="68%" className={styles.routerGlowMid} />
                        <stop offset="100%" className={styles.routerGlowEnd} />
                    </radialGradient>

                    <linearGradient id="mt-phone-shell" x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0%" className={styles.shellHi} />
                        <stop offset="100%" className={styles.shellLow} />
                    </linearGradient>

                    <linearGradient id="mt-screen" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" className={styles.screenHi} />
                        <stop offset="100%" className={styles.screenLow} />
                    </linearGradient>

                    <filter id="mt-soft-shadow" x="-35%" y="-35%" width="170%" height="170%">
                        <feDropShadow dx="0" dy="8" stdDeviation="7" floodOpacity="0.22" />
                    </filter>

                    <filter id="mt-packet-glow" x="-70%" y="-70%" width="240%" height="240%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <rect className={styles.panelBg} width="100%" height="100%" />
                <rect width="100%" height="100%" fill="url(#mt-grid)" />
                <circle className={styles.routerHalo} cx={routerC.x} cy={routerC.y} r={130} fill="url(#mt-router-glow)" />

                <g className={styles.links}>
                    {links.map((link) => {
                        const a = center(byId[link.a]);
                        const b = center(byId[link.b]);

                        return (
                            <line
                                key={`${link.a}-${link.b}`}
                                className={styles.linkLora}
                                x1={a.x}
                                y1={a.y}
                                x2={b.x}
                                y2={b.y}
                            />
                        );
                    })}
                    <line
                        className={styles.linkBt}
                        x1={center(byId.phone).x}
                        y1={center(byId.phone).y}
                        x2={center(byId[PHONE_RELAY_ID]).x}
                        y2={center(byId[PHONE_RELAY_ID]).y}
                    />
                    <line
                        className={styles.linkUsb}
                        x1={center(byId[USB_RELAY_ID]).x}
                        y1={center(byId[USB_RELAY_ID]).y}
                        x2={center(byId.terminal).x}
                        y2={center(byId.terminal).y}
                    />
                </g>

                <g className={styles.visitedLinks}>
                    {links
                        .filter((link) => visitedEdges.has(edgeId(link.a, link.b)))
                        .map((link) => {
                            const a = center(byId[link.a]);
                            const b = center(byId[link.b]);

                            return (
                                <line
                                    key={`visited-${link.a}-${link.b}`}
                                    className={styles.visitedEdge}
                                    x1={a.x}
                                    y1={a.y}
                                    x2={b.x}
                                    y2={b.y}
                                />
                            );
                        })}
                </g>

                <g className={styles.packetLayer}>
                    {activeEdges.map((edge) => (
                        <TransmissionStep key={`${edge.from}-${edge.to}-${edge.wave}`} edge={edge} byId={byId} tone="toneLora" />
                    ))}
                    {externalPulse === "bt-out" && (
                        <ExternalPulseLine key="bt-out" from={center(byId.phone)} to={center(byId[PHONE_RELAY_ID])} proto="bt" />
                    )}
                    {externalPulse === "bt-in" && (
                        <ExternalPulseLine key="bt-in" from={center(byId[PHONE_RELAY_ID])} to={center(byId.phone)} proto="bt" />
                    )}
                    {externalPulse === "usb" && <ExternalPulseLine key="usb" from={center(byId[USB_RELAY_ID])} to={center(byId.terminal)} proto="usb" />}
                </g>

                <g className={styles.deviceLayer}>
                    {DEVICES.map((device) => (
                        <DeviceNode
                            key={device.id}
                            device={device}
                            isActive={activeNodes.includes(device.id)}
                            isPhoneReceiving={device.id === "phone" && externalPulse === "bt-in"}
                        />
                    ))}
                </g>

                <Legend />
            </svg>
        </figure>
    );
}

function TransmissionStep({
    edge,
    byId,
    tone,
}: {
    edge: FloodEdge;
    byId: Record<string, Device>;
    tone: PacketTone;
}) {
    const from = center(byId[edge.from]);
    const to = center(byId[edge.to]);

    return (
        <g className={styles[tone]}>
            <line className={styles.activeEdge} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
            <motion.g
                className={styles.packetGlyph}
                initial={{ x: from.x, y: from.y, opacity: 0 }}
                animate={{ x: [from.x, to.x], y: [from.y, to.y], opacity: [0, 1, 1] }}
                transition={{
                    x: { duration: STEP_DUR, ease: "linear" },
                    y: { duration: STEP_DUR, ease: "linear" },
                    opacity: { duration: STEP_DUR, times: [0, 0.08, 1], ease: "linear" },
                }}
            >
                <circle className={styles.packetAura} r="11" />
                <circle className={styles.packetDot} r="5.5" />
            </motion.g>
            <motion.circle
                className={styles.originPulse}
                cx={from.x}
                cy={from.y}
                initial={{ r: 7, opacity: 0 }}
                animate={{ r: [7, 22], opacity: [0, 0.42, 0] }}
                transition={{ duration: STEP_DUR * 0.7, ease: "easeOut" }}
            />
            <motion.circle
                className={styles.arrivalGlow}
                cx={to.x}
                cy={to.y}
                initial={{ r: 8, opacity: 0 }}
                animate={{ r: [8, 30], opacity: [0, 0.7, 0] }}
                transition={{ duration: STEP_DUR * 0.65, delay: STEP_DUR * 0.72, ease: "easeOut" }}
            />
        </g>
    );
}

function ExternalPulseLine({ from, to, proto }: { from: { x: number; y: number }; to: { x: number; y: number }; proto: "bt" | "usb" }) {
    return (
        <g className={proto === "bt" ? styles.toneBt : styles.toneUsb}>
            <line className={proto === "bt" ? styles.externalBt : styles.externalUsb} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
            <motion.g
                className={styles.packetGlyph}
                initial={{ x: from.x, y: from.y, opacity: 0 }}
                animate={{ x: [from.x, to.x], y: [from.y, to.y], opacity: [0, 1, 1] }}
                transition={{
                    x: { duration: 0.85, ease: "linear" },
                    y: { duration: 0.85, ease: "linear" },
                    opacity: { duration: 0.85, times: [0, 0.12, 1], ease: "linear" },
                }}
            >
                <circle className={styles.packetAura} r="11" />
                <circle className={styles.packetDot} r="5.5" />
            </motion.g>
        </g>
    );
}

function DeviceNode({
    device,
    isActive,
    isPhoneReceiving,
}: {
    device: Device;
    isActive: boolean;
    isPhoneReceiving: boolean;
}) {
    const roleY = device.h + 24;
    const protocolX = device.protocol === "usb" ? device.w + 34 : device.x < 560 ? -22 : device.w + 22;
    const protocolY = device.protocol === "usb" ? device.h / 2 - 30 : device.h / 2 - 24;

    return (
        <g
            className={`${styles.device} ${device.role === "Роутер" ? styles.routerDevice : styles.clientDevice} ${isActive ? styles.deviceActive : ""}`}
            transform={`translate(${device.x} ${device.y})`}
        >
            {isActive && (
                <motion.circle
                    className={styles.nodeHalo}
                    cx={device.w / 2}
                    cy={device.h / 2}
                    initial={{ r: Math.max(device.w, device.h) * 0.42, opacity: 0 }}
                    animate={{ r: [Math.max(device.w, device.h) * 0.42, Math.max(device.w, device.h) * 0.62], opacity: [0, 0.28, 0] }}
                    transition={{ duration: 1.05, ease: "easeOut" }}
                />
            )}
            {device.terminal ? (
                <TerminalArt w={device.w} h={device.h} />
            ) : device.asset ? (
                <image
                    className={styles.deviceImage}
                    href={`/img/meshtastic-devices/${device.asset}`}
                    x="0"
                    y="0"
                    width={device.w}
                    height={device.h}
                    preserveAspectRatio="xMidYMid meet"
                />
            ) : device.kind === "phone" ? (
                <PhoneArt w={device.w} h={device.h} isReceiving={isPhoneReceiving} />
            ) : (
                <DeviceArt kind={device.kind ?? "phone"} w={device.w} h={device.h} />
            )}
            {device.protocol && <ProtocolIcon type={device.protocol} x={protocolX} y={protocolY} />}
            <text className={styles.deviceRole} x={device.w / 2} y={roleY} textAnchor="middle">
                {device.role}
            </text>
        </g>
    );
}

function ProtocolIcon({ type, x, y }: { type: "bt" | "wifi" | "usb"; x: number; y: number }) {
    const size = 32;
    const iconProps = {
        x: x - size / 2,
        y: y - size / 2,
        width: size,
        height: size,
        strokeWidth: 2.25,
    };

    if (type === "wifi") {
        return <Wifi className={`${styles.protocolIcon} ${styles.iconWifi}`} {...iconProps} />;
    }

    if (type === "usb") {
        return <Usb className={`${styles.protocolIcon} ${styles.iconUsb}`} {...iconProps} />;
    }

    return <Bluetooth className={`${styles.protocolIcon} ${styles.iconBt}`} {...iconProps} />;
}

function TerminalArt({ w, h }: { w: number; h: number }) {
    return (
        <g filter="url(#mt-soft-shadow)">
            <rect className={styles.terminalShell} x="0" y="0" width={w} height={h - 16} rx="8" />
            <rect className={styles.terminalScreen} x="8" y="8" width={w - 16} height={h - 32} rx="4" />
            <circle className={styles.terminalRed} cx="18" cy="19" r="3" />
            <circle className={styles.terminalAmber} cx="30" cy="19" r="3" />
            <circle className={styles.terminalGreen} cx="42" cy="19" r="3" />
            <text className={styles.terminalText} x="16" y="43">$ meshtastic</text>
            <text className={styles.terminalTextDim} x="16" y="59">listen --mesh</text>
            <rect className={styles.terminalBase} x="24" y={h - 14} width={w - 48} height="10" rx="3" />
        </g>
    );
}

function DeviceArt({ kind, w, h }: { kind: DeviceKind; w: number; h: number }) {
    switch (kind) {
        case "phone":
            return <PhoneArt w={w} h={h} isReceiving={false} />;
        case "pocket":
            return <PocketArt w={w} h={h} />;
        case "handheld":
            return <HandheldArt w={w} h={h} />;
        case "tracker":
            return <TrackerArt w={w} h={h} />;
        case "router":
            return <RouterArt w={w} h={h} />;
        case "walkie":
            return <WalkieArt w={w} h={h} />;
        case "solar":
            return <SolarArt w={w} h={h} />;
        case "board":
            return <BoardArt w={w} h={h} />;
    }
}

function PhoneArt({ w, h, isReceiving }: { w: number; h: number; isReceiving: boolean }) {
    const shellRadius = w * 0.18;
    const bezelInset = 9;
    const screenX = 18;
    const screenY = 27;
    const screenW = w - 36;
    const screenH = h - 58;
    const bubbleH = 20;
    const firstBubbleY = screenY + 84;
    const secondBubbleW = screenW * 0.58;
    const incomingY = firstBubbleY + 60;

    return (
        <g className={styles.phoneArt} filter="url(#mt-soft-shadow)">
            <rect className={styles.phoneShell} x="0" y="0" width={w} height={h} rx={shellRadius} />
            <rect className={styles.phoneBezel} x={bezelInset} y={bezelInset} width={w - bezelInset * 2} height={h - bezelInset * 2} rx={shellRadius - 7} />
            <rect className={styles.phoneScreen} x={screenX} y={screenY} width={screenW} height={screenH} rx="12" />
            <rect className={styles.phoneSpeaker} x={w / 2 - 19} y="15" width="38" height="4.5" rx="2.25" />
            <circle className={styles.phoneCamera} cx={w - 38} cy="17.5" r="2.7" />

            <text className={styles.statusTime} x={screenX + 11} y={screenY + 22}>15:30</text>
            <g className={styles.statusIcons}>
                <rect x={screenX + screenW - 45} y={screenY + 15} width="10" height="6" rx="1" />
                <path d={`M${screenX + screenW - 28} ${screenY + 21}l3.5-4.5 3.5 4.5`} />
                <circle cx={screenX + screenW - 12} cy={screenY + 18} r="2.6" />
            </g>

            <text className={styles.screenBrand} x={screenX + 11} y={screenY + 52}>MESHTASTIC</text>
            <text className={styles.screenSmallText} x={screenX + 11} y={screenY + 72}>Основний канал</text>

            <rect className={styles.chatBubbleIn} x={screenX + 10} y={firstBubbleY} width={screenW * 0.72} height={bubbleH} rx="5" />
            <rect className={styles.chatBubbleOut} x={screenX + screenW - secondBubbleW - 10} y={firstBubbleY + 30} width={secondBubbleW} height={bubbleH} rx="5" />

            {isReceiving && (
                <motion.g
                    className={styles.incomingBubble}
                    initial={{ opacity: 0, y: incomingY + 10 }}
                    animate={{ opacity: [0, 1, 1], y: incomingY }}
                    transition={{ duration: 0.45, times: [0, 0.55, 1], ease: "easeOut" }}
                >
                    <rect x={screenX + 10} y="0" width={screenW * 0.78} height={bubbleH} rx="5" />
                    <text className={styles.incomingBubbleText} x={screenX + 18} y="14">
                        Новий пакет
                    </text>
                </motion.g>
            )}

            <circle className={styles.homeButton} cx={w / 2} cy={h - 18} r="4" />
        </g>
    );
}

function PocketArt({ w, h }: { w: number; h: number }) {
    return (
        <g filter="url(#mt-soft-shadow)">
            <line className={styles.slimAntenna} x1={w * 0.28} y1="8" x2={w * 0.28} y2="-24" />
            <rect className={styles.radioBody} x="10" y="12" width={w - 20} height={h - 18} rx="9" />
            <rect className={styles.glassScreen} x="19" y="27" width={w - 38} height="44" rx="4" />
            <line className={styles.screenLine} x1="27" y1="42" x2={w - 34} y2="42" />
            <line className={styles.screenLineDim} x1="27" y1="55" x2={w - 44} y2="55" />
            <circle className={styles.orangeLed} cx={w - 26} cy="28" r="4" />
            <circle className={styles.navButton} cx={w / 2} cy={h - 31} r="10" />
            <circle className={styles.smallScrew} cx="22" cy={h - 16} r="2.2" />
            <circle className={styles.smallScrew} cx={w - 22} cy={h - 16} r="2.2" />
        </g>
    );
}

function HandheldArt({ w, h }: { w: number; h: number }) {
    const keys = Array.from({ length: 20 }, (_, i) => ({
        x: 22 + (i % 5) * 14,
        y: 78 + Math.floor(i / 5) * 13,
    }));

    return (
        <g filter="url(#mt-soft-shadow)">
            <line className={styles.slimAntenna} x1="22" y1="10" x2="22" y2="-22" />
            <rect className={styles.deckBody} x="8" y="14" width={w - 16} height={h - 20} rx="9" />
            <rect className={styles.glassScreen} x="20" y="28" width={w - 40} height="42" rx="4" />
            <line className={styles.screenLine} x1="28" y1="44" x2={w - 32} y2="44" />
            <line className={styles.screenLineDim} x1="28" y1="56" x2={w - 48} y2="56" />
            {keys.map((key, index) => (
                <circle key={index} className={styles.keyboardKey} cx={key.x} cy={key.y} r="3.4" />
            ))}
            <circle className={styles.trackBall} cx={w - 24} cy={h - 26} r="7" />
            <circle className={styles.blueLed} cx={w - 20} cy="29" r="3.5" />
        </g>
    );
}

function TrackerArt({ w, h }: { w: number; h: number }) {
    return (
        <g filter="url(#mt-soft-shadow)">
            <rect className={styles.trackerShell} x="9" y="8" width={w - 18} height={h - 20} rx="14" />
            <circle className={styles.trackerRing} cx={w / 2} cy="24" r="10" />
            <circle className={styles.trackerHole} cx={w / 2} cy="24" r="4" />
            <rect className={styles.trackerScreen} x="21" y="47" width={w - 42} height="24" rx="4" />
            <line className={styles.screenLine} x1="27" y1="57" x2={w - 31} y2="57" />
            <circle className={styles.orangeLed} cx={w - 21} cy={h - 24} r="4.2" />
            <circle className={styles.blueLed} cx="22" cy={h - 24} r="3.4" />
        </g>
    );
}

function RouterArt({ w, h }: { w: number; h: number }) {
    return (
        <g filter="url(#mt-soft-shadow)">
            <line className={styles.thickAntenna} x1="24" y1="22" x2="24" y2="-22" />
            <line className={styles.thickAntenna} x1={w - 24} y1="22" x2={w - 24} y2="-22" />
            <circle className={styles.antennaCap} cx="24" cy="-22" r="4" />
            <circle className={styles.antennaCap} cx={w - 24} cy="-22" r="4" />
            <rect className={styles.routerBody} x="8" y="20" width={w - 16} height={h - 26} rx="8" />
            <rect className={styles.glassScreen} x="22" y="40" width={w - 44} height="45" rx="4" />
            <text className={styles.routerScreenText} x="31" y="59">MESH</text>
            <line className={styles.screenLineDim} x1="31" y1="72" x2={w - 37} y2="72" />
            <g className={styles.routerLeds}>
                <circle cx="30" cy={h - 39} r="4" />
                <circle cx="48" cy={h - 39} r="4" />
                <circle cx="66" cy={h - 39} r="4" />
            </g>
            <rect className={styles.ventBar} x="24" y={h - 22} width={w - 48} height="5" rx="2.5" />
        </g>
    );
}

function WalkieArt({ w, h }: { w: number; h: number }) {
    return (
        <g filter="url(#mt-soft-shadow)">
            <line className={styles.thickAntenna} x1={w / 2} y1="18" x2={w / 2} y2="-34" />
            <circle className={styles.antennaCap} cx={w / 2} cy="-34" r="4" />
            <rect className={styles.walkieBody} x="9" y="20" width={w - 18} height={h - 24} rx="8" />
            <rect className={styles.glassScreen} x="20" y="36" width={w - 40} height="34" rx="4" />
            <line className={styles.screenLine} x1="27" y1="49" x2={w - 32} y2="49" />
            <circle className={styles.navButton} cx={w / 2} cy="90" r="10" />
            <g className={styles.speakerSlots}>
                <rect x="23" y="111" width={w - 46} height="5" rx="2.5" />
                <rect x="23" y="123" width={w - 46} height="5" rx="2.5" />
                <rect x="23" y="135" width={w - 46} height="5" rx="2.5" />
            </g>
            <circle className={styles.blueLed} cx={w - 20} cy="34" r="3.5" />
        </g>
    );
}

function SolarArt({ w, h }: { w: number; h: number }) {
    const cells = Array.from({ length: 12 }, (_, i) => ({
        x: 7 + (i % 4) * 24,
        y: 8 + Math.floor(i / 4) * 17,
    }));

    return (
        <g filter="url(#mt-soft-shadow)">
            <rect className={styles.solarFrame} x="1" y="0" width="104" height="62" rx="5" />
            {cells.map((cell, index) => (
                <rect key={index} className={styles.solarCell} x={cell.x} y={cell.y} width="20" height="13" rx="1.5" />
            ))}
            <line className={styles.solarMast} x1="54" y1="62" x2="54" y2={h - 20} />
            <rect className={styles.solarBox} x={w - 34} y={h - 45} width="30" height="34" rx="5" />
            <circle className={styles.blueLed} cx={w - 19} cy={h - 28} r="3.2" />
        </g>
    );
}

function BoardArt({ w, h }: { w: number; h: number }) {
    const pins = Array.from({ length: 9 }, (_, i) => 14 + i * 7);

    return (
        <g filter="url(#mt-soft-shadow)">
            <rect className={styles.boardPcb} x="7" y="10" width={w - 14} height={h - 20} rx="7" />
            {pins.map((pin) => (
                <line key={`l-${pin}`} className={styles.boardPin} x1="15" y1={pin} x2="3" y2={pin} />
            ))}
            {pins.map((pin) => (
                <line key={`r-${pin}`} className={styles.boardPin} x1={w - 15} y1={pin} x2={w - 3} y2={pin} />
            ))}
            <rect className={styles.boardChip} x={w / 2 - 20} y={h / 2 - 14} width="40" height="28" rx="3" />
            <rect className={styles.usbPort} x={w - 38} y={h / 2 - 9} width="24" height="18" rx="3" />
            <circle className={styles.orangeLed} cx="28" cy="27" r="4" />
            <circle className={styles.blueLed} cx="28" cy={h - 27} r="3.4" />
            <line className={styles.slimAntenna} x1={w - 18} y1="10" x2={w + 15} y2="-6" />
        </g>
    );
}

function Legend() {
    const items = [
        { label: "LoRa", cls: styles.legendLora },
        { label: "Bluetooth", cls: styles.legendBt },
        { label: "WiFi", cls: styles.legendWifi },
        { label: "USB", cls: styles.legendUsb },
    ];

    return (
        <g className={styles.legend} transform="translate(392 690)">
            {items.map((item, index) => {
                const x = index * 122;

                return (
                    <g key={item.label} transform={`translate(${x} 0)`}>
                        <line className={item.cls} x1="0" y1="0" x2="28" y2="0" />
                        <text className={styles.legendLabel} x="38" y="4">
                            {item.label}
                        </text>
                    </g>
                );
            })}
        </g>
    );
}
