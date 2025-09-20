# Price Monitor

A tool for monitoring price changes on various e-commerce websites and sending alerts when prices drop.

## Features

- Track prices across multiple e-commerce platforms
- Receive notifications when prices drop to your target price
- Historical price tracking and visualization
- Customizable monitoring frequency

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone this repository
   ```
   git clone https://github.com/yourusername/price-monitor.git
   cd price-monitor
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Configure settings
   ```
   cp .env.example .env
   ```
   Edit the `.env` file with your settings.

4. Run the application
   ```
   npm start
   ```

## Usage

Add products to monitor by running:
```
npm run add-product -- --url "https://example.com/product" --target-price 29.99
```

Check current prices:
```
npm run check-prices
```

## License

MIT