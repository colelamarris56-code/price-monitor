# Price Monitor Deployment Guide

This guide provides instructions for deploying the price monitor in different environments.

## Local Deployment

### Basic Setup (Already Covered in README)

1. Install Node.js
2. Clone the repository
3. Install dependencies: `npm install`
4. Configure environment variables: copy `.env.example` to `.env` and edit
5. Run the application: `npm start`

### Running as a Background Service on Windows

1. Install Windows Service Wrapper (WinSW):
   - Download the latest release from: https://github.com/winsw/winsw/releases
   - Rename the exe to `price-monitor-service.exe`

2. Create a configuration file named `price-monitor-service.xml`:
```xml
<service>
  <id>PriceMonitor</id>
  <name>Price Monitor Service</name>
  <description>Monitors prices on e-commerce websites</description>
  <executable>node</executable>
  <arguments>src/index.js</arguments>
  <workingdirectory>%BASE%</workingdirectory>
  <logmode>rotate</logmode>
</service>
```

3. Install the service:
```
price-monitor-service.exe install
```

4. Start the service:
```
price-monitor-service.exe start
```

## Deployment on Linux (Ubuntu/Debian)

### Using PM2

1. Install Node.js and PM2:
```
sudo apt update
sudo apt install nodejs npm
sudo npm install -g pm2
```

2. Clone the repository:
```
git clone https://github.com/yourusername/price-monitor.git
cd price-monitor
```

3. Install dependencies:
```
npm install
```

4. Set up environment variables:
```
cp .env.example .env
nano .env
```

5. Start with PM2:
```
pm2 start src/index.js --name "price-monitor"
```

6. Set PM2 to start on system boot:
```
pm2 startup
pm2 save
```

### Using Systemd

1. Create a systemd service file:
```
sudo nano /etc/systemd/system/price-monitor.service
```

2. Add the following content:
```
[Unit]
Description=Price Monitor Service
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/path/to/price-monitor
ExecStart=/usr/bin/node /path/to/price-monitor/src/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

3. Enable and start the service:
```
sudo systemctl enable price-monitor
sudo systemctl start price-monitor
```

4. Check status:
```
sudo systemctl status price-monitor
```

## Deployment in Docker

1. Create a Dockerfile:
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "src/index.js"]
```

2. Build the Docker image:
```
docker build -t price-monitor .
```

3. Run the container:
```
docker run -d --name price-monitor \
  -e SMTP_HOST=smtp.example.com \
  -e SMTP_PORT=587 \
  -e SMTP_USER=your-email@example.com \
  -e SMTP_PASS=your-password \
  -e NOTIFICATION_EMAIL=your-email@example.com \
  -e MONITORING_INTERVAL_MINUTES=60 \
  -v price-monitor-data:/app/data \
  price-monitor
```

## Scheduling with Cron (Alternative to Running as a Service)

If you prefer to run price checks at specific times rather than continuously:

1. Create a script that runs the check-prices.js file:
```bash
#!/bin/bash
cd /path/to/price-monitor
node src/cli/check-prices.js
```

2. Make it executable:
```
chmod +x /path/to/check-prices.sh
```

3. Add to crontab:
```
crontab -e
```

4. Add an entry (e.g., every hour):
```
0 * * * * /path/to/check-prices.sh >> /path/to/price-monitor/logs/cron.log 2>&1
```