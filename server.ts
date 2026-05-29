import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: /api/mcp and /app/api/mcp
  const handleMcpGet = (req: express.Request, res: express.Response) => {
    res.json({
      protocol: "MCP",
      version: "1.0.0",
      name: "BatchWizards MCP Endpoint",
      status: "active",
      description: "Active MCP server for BatchWizards Orchestrator Agent",
      capabilities: ["batch-processing", "multi-wizard-management", "task-automation"],
      timestamp: new Date().toISOString()
    });
  };
  app.get("/api/mcp", handleMcpGet);
  app.get("/app/api/mcp", handleMcpGet);

  const handleMcpOptions = (req: express.Request, res: express.Response) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).end();
  };
  app.options("/api/mcp", handleMcpOptions);
  app.options("/app/api/mcp", handleMcpOptions);

  const handleMcpPost = (req: express.Request, res: express.Response) => {
    res.header('Access-Control-Allow-Origin', '*');
    
    try {
      const body = req.body;

      if (body.method === "initialize") {
        res.json({
          jsonrpc: "2.0",
          id: body.id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: { listChanged: false }, prompts: {}, resources: {} },
            serverInfo: {
              name: "BatchWizards Orchestrator",
              version: "1.0.0"
            }
          }
        });
        return;
      }

      if (body.method === "tools/list") {
        res.json({
          jsonrpc: "2.0",
          id: body.id,
          result: {
            tools: [
              {
                name: "get_race_status",
                description: "[PLACEHOLDER] Missing implementation details from source",
                inputSchema: { type: "object", properties: {} }
              },
              {
                name: "start_race",
                description: "[PLACEHOLDER] Missing implementation details from source",
                inputSchema: { type: "object", properties: {} }
              },
              {
                name: "get_leaderboard",
                description: "[PLACEHOLDER] Missing implementation details from source",
                inputSchema: { type: "object", properties: {} }
              },
              {
                name: "optimize_speed",
                description: "[PLACEHOLDER] Missing implementation details from source",
                inputSchema: { type: "object", properties: {} }
              },
              {
                name: "get_track_info",
                description: "[PLACEHOLDER] Missing implementation details from source",
                inputSchema: { type: "object", properties: {} }
              }
            ]
          }
        });
        return;
      }

      if (body.method === "tools/call") {
        res.json({
          jsonrpc: "2.0",
          id: body.id,
          result: {
            content: [
              {
                type: "text",
                text: `[PLACEHOLDER] Tool implementation for ${body.params?.name} missing`
              }
            ]
          }
        });
        return;
      }

      if (body.method === "prompts/list") {
        res.json({ jsonrpc: "2.0", id: body.id, result: { prompts: [] } });
        return;
      }

      if (body.method === "resources/list") {
        res.json({ jsonrpc: "2.0", id: body.id, result: { resources: [] } });
        return;
      }

      if (body.method === "notifications/initialized") {
        // Just acknowledge with nothing or basic JSON for JSON-RPC 2.0 notifications 
        res.json({ jsonrpc: "2.0" });
        return;
      }

      res.json({
        jsonrpc: "2.0",
        id: body.id,
        error: {
          code: -32601,
          message: "Method not found"
        }
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid MCP request" });
    }
  };
  app.post("/api/mcp", handleMcpPost);
  app.post("/app/api/mcp", handleMcpPost);

  // API Route: /api/agent and /app/api/agent
  const handleAgentGet = (req: express.Request, res: express.Response) => {
    res.json({
      name: "BatchWizards Orchestrator",
      status: "active",
      wallet: "0x29536D0bc1004ab274c4F0F59734Ad74D4559b7B",
      platform: "BatchWizards",
      version: "1.0.0"
    });
  };
  app.get("/api/agent", handleAgentGet);
  app.get("/app/api/agent", handleAgentGet);

  const handleAgentPost = (req: express.Request, res: express.Response) => {
    try {
      res.json({
        name: "BatchWizards Orchestrator",
        status: "active",
        wallet: "0x29536D0bc1004ab274c4F0F59734Ad74D4559b7B",
        platform: "BatchWizards",
        version: "1.0.0",
        receivedPayload: req.body
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid request payload" });
    }
  };
  app.post("/api/agent", handleAgentPost);
  app.post("/app/api/agent", handleAgentPost);

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
