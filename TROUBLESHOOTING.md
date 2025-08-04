# Doodlr Troubleshooting Guide

## Network Connectivity Issues

### "Network request failed" Error

This error occurs when your iPhone can't connect to the backend API. Here's how to fix it:

#### 1. Check Your IP Address
```bash
# On your development machine, run:
hostname -I
```

#### 2. Update the Configuration
Edit `frontend/config.js` and update the IP_ADDRESS:
```javascript
export const IP_ADDRESS = 'YOUR_IP_ADDRESS_HERE'; // e.g., '192.168.40.214'
```

#### 3. Restart the App
```bash
# Stop the current servers
pkill -f "expo start"
pkill -f "python main.py"

# Restart using the startup script
./start.sh
```

#### 4. Verify Backend is Accessible
```bash
# Test from your development machine
curl http://YOUR_IP_ADDRESS:8000/health

# Should return: {"status":"healthy"}
```

#### 5. Check Firewall Settings
Make sure port 8000 is open on your development machine:
```bash
# Check if port 8000 is listening
netstat -tlnp | grep :8000
```

### Common Issues and Solutions

#### Issue: Backend not starting
**Solution:**
```bash
cd backend
python main.py
```

#### Issue: Frontend not starting
**Solution:**
```bash
cd frontend
npm install
npx expo start
```

#### Issue: Can't scan QR code
**Solution:**
- Make sure your iPhone and development machine are on the same WiFi network
- Try using Expo Go app instead of camera QR scanner

#### Issue: App loads but shows "Network request failed"
**Solution:**
1. Check that your IP address is correct in `frontend/config.js`
2. Verify the backend is running: `curl http://YOUR_IP:8000/health`
3. Make sure both devices are on the same network
4. Try restarting both frontend and backend

#### Issue: WebSocket connection fails
**Solution:**
- WebSocket connections use the same IP address as the API
- Check that the IP address in `frontend/config.js` is correct
- Restart the app after changing the configuration

### Testing the Connection

#### From Development Machine:
```bash
# Test API
curl http://localhost:8000/health
curl http://YOUR_IP:8000/health

# Test WebSocket (if you have wscat installed)
wscat -c ws://YOUR_IP:8000/canvas/ws
```

#### From iPhone:
1. Open Safari
2. Go to `http://YOUR_IP:8000/health`
3. Should see: `{"status":"healthy"}`

### Network Configuration

#### Development Machine:
- Backend runs on: `0.0.0.0:8000` (accepts connections from any IP)
- Frontend runs on: `localhost:19006` (for development)

#### iPhone:
- Connects to: `YOUR_IP:8000` (backend API)
- Connects to: `YOUR_IP:19006` (frontend development server)

### Debugging Steps

1. **Check if backend is running:**
   ```bash
   ps aux | grep python
   ```

2. **Check if frontend is running:**
   ```bash
   ps aux | grep expo
   ```

3. **Test network connectivity:**
   ```bash
   # From development machine
   ping YOUR_IP
   curl http://YOUR_IP:8000/health
   ```

4. **Check firewall:**
   ```bash
   # Allow port 8000 through firewall
   sudo ufw allow 8000
   ```

5. **Restart everything:**
   ```bash
   ./start.sh
   ```

### Getting Help

If you're still having issues:

1. Check the console logs in Expo Go app
2. Check the browser console if using web version
3. Check the terminal output from the startup script
4. Make sure both devices are on the same WiFi network
5. Try using a different network or mobile hotspot 