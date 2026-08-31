# Demo Environment Checklist — AgentShield (VULNRA + Lobster Trap)

## 30 Minutes Before Recording

### Start Services

- [ ] **Start NexaBank target:**
  ```bash
  cd /path/to/vulnra/demo
  uvicorn nexabank_target:app --host 0.0.0.0 --port 8001 --reload
  ```

- [ ] **Verify NexaBank health:**
  ```bash
  curl http://localhost:8001/health
  # Expected: {"status":"ok","target":"NexaBank AI v1.0","vulnerabilities":"intentional"}
  ```

- [ ] **Start Lobster Trap proxy:**
  ```bash
  docker run -d \
    --name lobster-trap \
    -p 9090:9090 \
    -v $(pwd)/lobster_trap/policies:/policies \
    -e LT_POLICY_DIR=/policies \
    -e LT_TARGET_URL=http://host.docker.internal:8001 \
    lobster-trap/lobster-trap:latest
  ```
  > ⚠️ Replace `lobster-trap/lobster-trap:latest` with the actual Lobster Trap Docker image name from the lablab.ai challenge instructions.

- [ ] **Verify Lobster Trap health:**
  ```bash
  curl http://localhost:9090/health
  # Expected: {"status":"ok"}
  ```

- [ ] **Set environment variables:**
  ```bash
  export LOBSTER_TRAP_ENABLED=true
  export LOBSTER_TRAP_URL=http://localhost:9090
  export TARGET_URL=http://localhost:8001
  ```

- [ ] **Start VULNRA backend:**
  ```bash
  # From project root
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
  ```

- [ ] **Start VULNRA frontend:**
  ```bash
  # From project root
  cd frontend && npm run dev
  ```
  Expected: Frontend at `http://localhost:3001`

### Validate the Full Stack

- [ ] **Open browser at `http://localhost:3001/scanner`** — confirm login page loads
- [ ] **Log in** with a Supabase account (email/password)
- [ ] **Create a test scan** against NexaBank (`http://localhost:8001`), select "basic" depth
- [ ] **Wait for scan to complete** — confirm findings appear in the Findings tab
- [ ] **Open Shield tab** — confirm intercept events appear (DENY, QUARANTINE, ALLOW)
- [ ] **Check the heatmap** — confirm at least one category shows "Covered"
- [ ] **Run the audit export** — confirm JSON download works
- [ ] **Clean up the test scan:**
  ```bash
  # Truncate scan data so the demo starts clean
  # (Supabase query or admin endpoint — adjust as needed)
  ```

### Signal Check

- [ ] **Audio:** microphone level is green, no background noise
- [ ] **Video:** screen recording captures the full browser window (1920×1080 minimum)
- [ ] **Cursor:** recording software shows cursor movements clearly
- [ ] **Monitor:** no sensitive notifications, no unread Slack messages visible

---

## 5 Minutes Before Recording

- [ ] Close all unrelated browser tabs (keep only VULNRA + Nebius dashboard if needed)
- [ ] Set browser zoom to **100%** (not zoomed in)
- [ ] Open a **clean terminal window** — no error output, no scrolling backlog
- [ ] Have the NexaBank health URL ready to paste in the terminal:
  ```
  curl http://localhost:8001/health
  ```
- [ ] Have `docker ps` ready to show Lobster Trap is running:
  ```
  docker ps --filter name=lobster-trap --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
  ```
- [ ] Confirm screen recording software is capturing the **correct monitor**
- [ ] Stop any screen sharing, VPN notifications, calendar reminders
- [ ] **Silence phone** (Do Not Disturb)
- [ ] Take a sip of water — dry mouth affects pacing

---

## If Something Breaks During Recording

### Lobster Trap is down
```bash
# Disable the enforcement layer, demo VULNRA standalone
export LOBSTER_TRAP_ENABLED=false
# Spoken: "The enforcement layer is modular — you can run VULNRA's
# red-teaming with or without Lobster Trap. Let me show you the
# detection side first."
```
Continue with the demo: VULNRA still finds vulnerabilities, the Shield tab still shows findings (without intercept events), and the compliance export still works.

### Supabase connection error
"Supabase is having a network moment — this happens in demo environments. The scan results are cached locally, so let me show you the pre-recorded data. The product works the same way when the database is connected."

### Frontend won't load (Next.js build error)
Switch to curl demo:
```bash
# Fire a probe directly against the API
curl -X POST http://localhost:8000/scan \
  -H "Content-Type: application/json" \
  -d '{"url":"http://localhost:8001","tier":"basic"}'

# Then poll for results
curl http://localhost:8000/scan/<SCAN_ID>

# Show the JSON output on screen
```
Spoken: "The UI is still rendering — let me show you the raw API response so you can see the finding structure."

### Demo target crashes
```bash
# Restart it quickly
uvicorn nexabank_target:app --host 0.0.0.0 --port 8001 --reload
```
Spoken: "Give me five seconds to restart the demo target." (Turn away from camera while doing it.)

### VPN or network issues
Make sure you're on a wired connection if possible. If WiFi drops:
- Demo pauses. Take a breath. Say "let me reconnect."
- If it doesn't come back in 10 seconds, stop the recording and restart.

### General principle
**Never apologize more than once.** A single "let me fix that" is fine. If something breaks that you can't fix in 15 seconds, stop the recording and restart. A clean second take is always better than a shaky first one.
