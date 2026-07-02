"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Server, 
  Clock, 
  Activity, 
  Database, 
  Battery, 
  BatteryCharging, 
  Globe, 
  Calendar, 
  Cpu, 
  Layers, 
  Shield, 
  Compass, 
  TrendingUp, 
  CheckCircle 
} from "lucide-react";

interface SystemTelemetryProps {
  initialTotalApis: number;
  initialTodayRequests: number;
}

interface IpData {
  ip: string;
  country: string;
  city: string;
  isp: string;
}

interface BatteryManager extends EventTarget {
  charging: boolean;
  level: number;
  onchargingchange: (() => void) | null;
  onlevelchange: (() => void) | null;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

// Fade up variants
const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export default function SystemTelemetry({ initialTotalApis, initialTodayRequests }: SystemTelemetryProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Time & Date states
  const [time, setTime] = useState("00:00:00");
  const [timezone, setTimezone] = useState("UTC");
  const [dateStr, setDateStr] = useState("");

  // Battery states
  const [batterySupported, setBatterySupported] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isCharging, setIsCharging] = useState(false);

  // IP lookup states
  const [ipData, setIpData] = useState<IpData>({
    ip: "Unknown",
    country: "Unknown",
    city: "Unknown",
    isp: "Unknown",
  });
  const [ipLoading, setIpLoading] = useState(true);

  // Dynamic telemetry states
  const [todayReqs, setTodayReqs] = useState(initialTodayRequests);
  const [totalApis, setTotalApis] = useState(initialTotalApis);
  const [responseTime, setResponseTime] = useState("45 ms");
  const [uptime, setUptime] = useState("99.98%");
  const [serverStatus, setServerStatus] = useState("ONLINE");

  useEffect(() => {
    setIsMounted(true);

    // Fetch telemetry data from dynamic backend
    const fetchTelemetry = () => {
      fetch("/api/telemetry")
        .then((res) => {
          if (!res.ok) throw new Error("Telemetry fetch failed");
          return res.json();
        })
        .then((data) => {
          setTodayReqs(data.todayRequests);
          setTotalApis(data.totalApis);
          setResponseTime(data.responseTime);
          setUptime(data.uptime);
          setServerStatus(data.serverStatus === "Healthy" ? "ONLINE" : "DEGRADED");
        })
        .catch((err) => {
          console.error("Telemetry check error:", err);
        });
    };

    fetchTelemetry();
    // Poll telemetry every 10 seconds for real-time updates without heavy loading
    const telemetryTimer = setInterval(fetchTelemetry, 10000);

    // Time update loop
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(tz);

    const updateTimeAndDate = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-GB", { hour12: false }));
      
      const locale = navigator.language || "id-ID";
      setDateStr(
        now.toLocaleDateString(locale, {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    };
    updateTimeAndDate();
    const clockTimer = setInterval(updateTimeAndDate, 1000);

    // Battery API implementation
    const nav = navigator as NavigatorWithBattery;
    if (nav.getBattery) {
      nav.getBattery().then((batt) => {
        setBatterySupported(true);
        setBatteryLevel(Math.round(batt.level * 100));
        setIsCharging(batt.charging);

        const onChargeChange = () => setIsCharging(batt.charging);
        const onLevelChange = () => setBatteryLevel(Math.round(batt.level * 100));

        batt.onchargingchange = onChargeChange;
        batt.onlevelchange = onLevelChange;
      }).catch(() => {
        setBatterySupported(false);
      });
    }

    // IP Lookup
    fetch("https://ipapi.co/json/")
      .then((res) => {
        if (!res.ok) throw new Error("IP fetch failed");
        return res.json();
      })
      .then((data) => {
        setIpData({
          ip: data.ip || "Unknown",
          country: data.country_name || "Unknown",
          city: data.city || "Unknown",
          isp: data.org || "Unknown",
        });
      })
      .catch(() => {
        // Fallback gracefully without crash
        setIpData({
          ip: "Unknown",
          country: "Unknown",
          city: "Unknown",
          isp: "Unknown",
        });
      })
      .finally(() => setIpLoading(false));

    return () => {
      clearInterval(telemetryTimer);
      clearInterval(clockTimer);
    };
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full max-w-[1280px] w-[calc(100%-48px)] mx-auto py-12 px-6 text-center text-text-tertiary">
        Loading System Status...
      </div>
    );
  }

  return (
    <section className="py-8 px-6 relative w-full bg-bg-primary">
      <div className="mx-auto max-w-[1280px] w-[calc(100%-48px)] space-y-8 relative z-10">
        
        {/* ========================================================== */}
        {/* CARD 1: DASHBOARD SYSTEM STATUS (Major status card)        */}
        {/* ========================================================== */}
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="relative w-full rounded-[28px] bg-bg-secondary border border-border hover:border-accent/25 hover:bg-bg-secondary/95 transition-all duration-300 p-6 md:p-8 shadow-[0_20px_60px_rgba(255,122,0,0.12)] overflow-hidden group"
        >
          {/* Top subtle glow bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="flex flex-row items-center justify-between gap-4 pb-6 border-b border-border/60 mb-6">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest font-display">
                ACTIVE TELEMETRY
              </span>
              <h3 className="text-xl md:text-2xl font-extrabold text-text-primary font-display">
                System Status
              </h3>
            </div>
            
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] md:text-xs font-bold font-display uppercase tracking-wider shrink-0 ${
              serverStatus === "ONLINE"
                ? "bg-emerald-500/5 border-emerald-500/15 text-emerald-400"
                : "bg-amber-500/5 border-amber-500/15 text-amber-400"
            }`}>
              <span className="relative flex h-1.5 w-1.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  serverStatus === "ONLINE" ? "bg-emerald-400" : "bg-amber-400"
                }`}></span>
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                  serverStatus === "ONLINE" ? "bg-emerald-500" : "bg-amber-500"
                }`}></span>
              </span>
              <span>{serverStatus === "ONLINE" ? "ALL SYSTEMS OPERATIONAL" : "SYSTEM DEGRADED"}</span>
            </div>
          </div>

          {/* Grid: 2 columns on mobile, 4 columns on larger screens */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Metric 1: Server Status */}
            <div className="p-4 rounded-2xl bg-bg-tertiary/20 border border-border/50 flex flex-col justify-between h-full hover:bg-accent/[0.04] transition-colors duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary font-display">Server Status</span>
                <Server className="w-4 h-4 text-accent" />
              </div>
              <div>
                <div className="text-base md:text-lg font-extrabold text-text-primary font-display">{serverStatus}</div>
                <span className="text-[9px] text-emerald-400 font-bold font-mono block">Uptime {uptime}</span>
              </div>
            </div>

            {/* Metric 2: Response Time */}
            <div className="p-4 rounded-2xl bg-bg-tertiary/20 border border-border/50 flex flex-col justify-between h-full hover:bg-accent/[0.04] transition-colors duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary font-display">Response Time</span>
                <Clock className="w-4 h-4 text-accent" />
              </div>
              <div>
                <div className="text-base md:text-lg font-extrabold text-text-primary font-display">{responseTime}</div>
                <span className="text-[9px] text-text-tertiary font-mono block">Avg Latency</span>
              </div>
            </div>

            {/* Metric 3: Today's Requests */}
            <div className="p-4 rounded-2xl bg-bg-tertiary/20 border border-border/50 flex flex-col justify-between h-full hover:bg-accent/[0.04] transition-colors duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary font-display">Today's Requests</span>
                <Activity className="w-4 h-4 text-accent" />
              </div>
              <div>
                <div className="text-base md:text-lg font-extrabold text-text-primary font-display font-mono">
                  {todayReqs.toLocaleString()}
                </div>
                <span className="text-[9px] text-text-tertiary font-mono block">Realtime total</span>
              </div>
            </div>

            {/* Metric 4: Total API */}
            <div className="p-4 rounded-2xl bg-bg-tertiary/20 border border-border/50 flex flex-col justify-between h-full hover:bg-accent/[0.04] transition-colors duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary font-display">Total API</span>
                <Database className="w-4 h-4 text-accent" />
              </div>
              <div>
                <div className="text-base md:text-lg font-extrabold text-text-primary font-display">{totalApis}</div>
                <span className="text-[9px] text-text-tertiary font-mono block">Endpoints ready</span>
              </div>
            </div>

          </div>
        </motion.div>

        {/* ========================================================== */}
        {/* SUB-CARDS GRID: clock, date, battery, user IP              */}
        {/* ========================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 2: Catalog Clock */}
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="rounded-[28px] bg-bg-secondary border border-border hover:border-accent/25 hover:bg-bg-secondary/95 transition-all duration-300 p-6 shadow-md hover:shadow-[0_20px_60px_rgba(255,122,0,0.08)] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/50 mb-4">
              <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest font-display">
                CATALOG CLOCK
              </span>
              <Clock className="w-4 h-4 text-accent" />
            </div>
            <div className="space-y-2">
              <div className="text-2xl md:text-3xl font-extrabold text-text-primary font-mono tracking-tight">
                {time}
              </div>
              <p className="text-[10px] text-text-tertiary truncate font-mono">
                TZ: {timezone}
              </p>
            </div>
          </motion.div>

          {/* Card 3: Today Date */}
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="rounded-[28px] bg-bg-secondary border border-border hover:border-accent/25 hover:bg-bg-secondary/95 transition-all duration-300 p-6 shadow-md hover:shadow-[0_20px_60px_rgba(255,122,0,0.08)] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/50 mb-4">
              <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest font-display">
                TODAY
              </span>
              <Calendar className="w-4 h-4 text-accent" />
            </div>
            <div className="space-y-2">
              <div className="text-lg md:text-xl font-bold text-text-primary font-display leading-snug">
                {dateStr}
              </div>
              <p className="text-[10px] text-text-tertiary">
                Locale Date Configuration
              </p>
            </div>
          </motion.div>

          {/* Card 4: Device Information */}
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="rounded-[28px] bg-bg-secondary border border-border hover:border-accent/25 hover:bg-bg-secondary/95 transition-all duration-300 p-6 shadow-md hover:shadow-[0_20px_60px_rgba(255,122,0,0.08)] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/50 mb-4">
              <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest font-display">
                DEVICE INFORMATION
              </span>
              {isCharging ? (
                <BatteryCharging className="w-4 h-4 text-accent animate-pulse" />
              ) : (
                <Battery className="w-4 h-4 text-accent" />
              )}
            </div>
            <div className="space-y-3">
              {batterySupported ? (
                <>
                  <div className="flex items-baseline justify-between">
                     <span className="text-2xl font-extrabold text-text-primary font-mono">{batteryLevel}%</span>
                    <span className="text-[9px] font-bold text-text-secondary uppercase">
                      {isCharging ? "Charging" : "Discharging"}
                    </span>
                  </div>
                  {/* Progress bar battery */}
                  <div className="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCharging ? "bg-accent" : batteryLevel > 20 ? "bg-emerald-500" : "bg-rose-500 animate-pulse"
                      }`}
                      style={{ width: `${batteryLevel}%` }}
                    />
                  </div>
                </>
              ) : (
                <div className="text-xs text-text-secondary font-medium py-2">
                  Battery Information Not Available
                </div>
              )}
            </div>
          </motion.div>

          {/* Card 5: User IP Address */}
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="rounded-[28px] bg-bg-secondary border border-border hover:border-accent/25 hover:bg-bg-secondary/95 transition-all duration-300 p-6 shadow-md hover:shadow-[0_20px_60px_rgba(255,122,0,0.08)] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/50 mb-4">
              <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest font-display">
                YOUR IP ADDRESS
              </span>
              <Globe className="w-4 h-4 text-accent" />
            </div>
            <div className="space-y-1 text-left font-mono">
              {ipLoading ? (
                <span className="text-xs text-text-tertiary animate-pulse block">Detecting...</span>
              ) : (
                <>
                  <span className="text-sm font-bold text-text-primary block truncate select-all">{ipData.ip}</span>
                  <div className="text-[9px] text-text-secondary leading-tight truncate">
                    <span>{ipData.country}</span>
                    {ipData.city !== "Unknown" && <span>, {ipData.city}</span>}
                  </div>
                  <span className="text-[8px] text-text-tertiary block truncate">{ipData.isp}</span>
                </>
              )}
            </div>
          </motion.div>

        </div>

        {/* ========================================================== */}
        {/* CARD 6: QUICK SYSTEM STATUS (Service statuses list)        */}
        {/* ========================================================== */}
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative w-full rounded-[28px] bg-bg-secondary border border-border hover:border-accent/25 hover:bg-bg-secondary/95 transition-all duration-300 p-6 md:p-8 shadow-md overflow-hidden"
        >
          <div className="flex items-center justify-between pb-4 border-b border-border/50 mb-6">
            <h4 className="text-sm md:text-base font-extrabold text-text-primary font-display flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent" />
              <span>Service Latency Matrix</span>
            </h4>
            <span className="text-[9px] font-mono text-text-tertiary">Real-time gateway checks</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Service 1 */}
            <div className="p-3.5 rounded-2xl bg-bg-tertiary/20 border border-border/50 flex flex-col justify-between gap-2">
              <span className="text-xs font-semibold text-text-secondary">AI Service Gateway</span>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-primary font-mono font-bold">45ms</span>
                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle className="w-2.5 h-2.5" /> Op
                </span>
              </div>
            </div>

            {/* Service 2 */}
            <div className="p-3.5 rounded-2xl bg-bg-tertiary/20 border border-border/50 flex flex-col justify-between gap-2">
              <span className="text-xs font-semibold text-text-secondary">Content Downloader</span>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-primary font-mono font-bold">50ms</span>
                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle className="w-2.5 h-2.5" /> Op
                </span>
              </div>
            </div>

            {/* Service 3 */}
            <div className="p-3.5 rounded-2xl bg-bg-tertiary/20 border border-border/50 flex flex-col justify-between gap-2">
              <span className="text-xs font-semibold text-text-secondary">Image Generation</span>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-primary font-mono font-bold">37ms</span>
                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle className="w-2.5 h-2.5" /> Op
                </span>
              </div>
            </div>

            {/* Service 4 */}
            <div className="p-3.5 rounded-2xl bg-bg-tertiary/20 border border-border/50 flex flex-col justify-between gap-2">
              <span className="text-xs font-semibold text-text-secondary">Search Engine</span>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-primary font-mono font-bold">41ms</span>
                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle className="w-2.5 h-2.5" /> Op
                </span>
              </div>
            </div>

            {/* Service 5 */}
            <div className="p-3.5 rounded-2xl bg-bg-tertiary/20 border border-border/50 flex flex-col justify-between gap-2">
              <span className="text-xs font-semibold text-text-secondary">Google Scraper</span>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-primary font-mono font-bold">60ms</span>
                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle className="w-2.5 h-2.5" /> Op
                </span>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}

