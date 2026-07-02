"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Highlight, themes } from "prism-react-renderer";

type Method = "GET" | "POST" | "PUT" | "DELETE";

interface Endpoint {
  method: Method;
  path: string;
  description: string;
  response: string;
}

const methodColors: Record<Method, string> = {
  GET: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  POST: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PUT: "bg-accent/10 text-accent border-accent/20",
  DELETE: "bg-red-500/10 text-red-400 border-red-500/20",
};

const endpoints: Endpoint[] = [
  {
    method: "GET",
    path: "/v1/users",
    description: "Retrieve all users",
    response: `{
  "data": [
    {
      "id": "usr_a1b2c3d4",
      "name": "Sarah Chen",
      "email": "sarah@example.com",
      "plan": "pro",
      "created_at": "2025-01-15T08:30:00Z"
    },
    {
      "id": "usr_e5f6g7h8",
      "name": "Marcus Rivera",
      "email": "marcus@example.com",
      "plan": "enterprise",
      "created_at": "2025-02-20T14:15:00Z"
    }
  ],
  "meta": {
    "total": 1284,
    "page": 1,
    "per_page": 20
  }
}`,
  },
  {
    method: "POST",
    path: "/v1/users",
    description: "Create a new user",
    response: `{
  "data": {
    "id": "usr_i9j0k1l2",
    "name": "Alex Thompson",
    "email": "alex@example.com",
    "plan": "free",
    "api_key": "lcode_sk_...m4Xp",
    "created_at": "2025-06-24T12:00:00Z"
  },
  "status": "created",
  "status_code": 201
}`,
  },
  {
    method: "PUT",
    path: "/v1/users/:id",
    description: "Update user details",
    response: `{
  "data": {
    "id": "usr_a1b2c3d4",
    "name": "Sarah Chen",
    "email": "sarah.chen@example.com",
    "plan": "enterprise",
    "updated_at": "2025-06-24T12:05:00Z"
  },
  "status": "ok",
  "status_code": 200
}`,
  },
  {
    method: "DELETE",
    path: "/v1/users/:id",
    description: "Remove a user",
    response: `{
  "status": "ok",
  "message": "User usr_a1b2c3d4 has been successfully deleted.",
  "deleted_at": "2025-06-24T12:10:00Z"
}`,
  },
];

export default function ApiPlayground() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = endpoints[activeIndex];

  return (
    <section id="playground" className="py-24 md:py-32 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs font-mono text-accent uppercase tracking-widest mb-4">
            Playground
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Try it Live
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Explore our API endpoints and see real responses. No sign-up required.
          </p>
        </motion.div>

        {/* Playground */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Endpoint list */}
          <div className="lg:col-span-2 bg-bg-secondary border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-medium text-text-secondary">
                Endpoints
              </span>
            </div>
            <div className="p-3 flex flex-col gap-1.5">
              {endpoints.map((ep, i) => (
                <button
                  key={ep.path + ep.method}
                  onClick={() => setActiveIndex(i)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 ${
                    i === activeIndex
                      ? "bg-accent/10 border border-accent/30"
                      : "hover:bg-bg-tertiary border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span
                      className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${methodColors[ep.method]}`}
                    >
                      {ep.method}
                    </span>
                    <span className="text-sm font-mono text-text-primary truncate">
                      {ep.path}
                    </span>
                  </div>
                  <p className="text-xs text-text-tertiary pl-[60px]">
                    {ep.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Response panel */}
          <div className="lg:col-span-3 bg-[#0F0F0F] border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${methodColors[active.method]}`}
                >
                  {active.method}
                </span>
                <span className="text-sm font-mono text-text-primary">
                  {active.path}
                </span>
              </div>
              <span className="text-xs text-text-tertiary font-mono">
                200 OK &middot; 12ms
              </span>
            </div>
            <div className="p-5 min-h-[340px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Highlight
                    theme={themes.nightOwl}
                    code={active.response}
                    language="json"
                  >
                    {({ style, tokens, getLineProps, getTokenProps }) => (
                      <pre
                        className="text-sm leading-relaxed font-mono bg-transparent overflow-x-auto"
                        style={{ ...style, backgroundColor: "transparent" }}
                      >
                        {tokens.map((line, i) => (
                          <div key={i} {...getLineProps({ line })}>
                            <span className="inline-block w-6 text-text-tertiary select-none text-right mr-4 text-xs">
                              {i + 1}
                            </span>
                            {line.map((token, key) => (
                              <span key={key} {...getTokenProps({ token })} />
                            ))}
                          </div>
                        ))}
                      </pre>
                    )}
                  </Highlight>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
