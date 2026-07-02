import si from "systeminformation";
import { success, error } from "../utils/response.js";

export async function status(req, res) {
  try {
    const start = Date.now();
    const [cpu, mem, disk, osInfo, time] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.osInfo(),
      si.time(),
    ]);

    const latency = Date.now() - start;
    const rootDisk = disk.find((d) => d.mount === "/") || disk[0];

    return success(res, {
      server: {
        status: "online",
        uptime: time.uptime,
        latency: `${latency}ms`,
      },
      cpu: {
        usage: Math.round(cpu.currentLoad * 100) / 100,
        cores: cpu.cpus.length,
      },
      memory: {
        total: mem.total,
        used: mem.used,
        free: mem.free,
        usage: Math.round((mem.used / mem.total) * 10000) / 100,
      },
      disk: {
        total: rootDisk?.size || 0,
        used: rootDisk?.used || 0,
        available: rootDisk?.available || 0,
        usage: rootDisk?.use || 0,
      },
      system: {
        os: osInfo.distro,
        platform: osInfo.platform,
        kernel: osInfo.kernel,
        arch: osInfo.arch,
        nodeVersion: process.version,
      },
    }, "System status retrieved");
  } catch (err) {
    return error(res, err.message || "Failed to get system status", err.status || 500);
  }
}
