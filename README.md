# Market Toolbox

A modern trading tool for EVE Online, rebuilt with Tauri + React + TypeScript.

## Features

- Real-time market log monitoring
- Profit calculation with broker fees and sales tax
- Configurable character settings (skills, standings)
- Multiple profiles support
- Auto-copy prices to clipboard
- Color-coded profit margins
- Customizable order range filters

## Development

### Prerequisites

- Node.js 18+ and pnpm
- Rust (latest stable)
- Tauri CLI: `cargo install tauri-cli@latest`

### Setup

1. Install dependencies:
```bash
pnpm install
```

2. Run in development mode:
```bash
pnpm tauri:dev
```

3. Build for production:
```bash
pnpm tauri:build
```

## Usage

1. Launch the application
2. The app will watch your EVE Online market logs directory (default: `Documents/EVE/logs/marketlogs`)
3. Export a market log from EVE Online
4. The app will automatically process the log and display profit calculations

## Configuration

### Profiles

Create multiple profiles to store different character settings:
- Broker Relations skill level
- Accounting skill level
- Corporation standing
- Faction standing
- Custom broker fees
- Order range preferences

### Order Ranges

- **Hubs (Station)**: Only hub stations (Jita, Rens, Amarr, Dodixie, Hek)
- **System**: Current system only
- **1 jump**: Current system + 1 jump
- **2 jumps**: Current system + 2 jumps
- **Region**: Entire region

## License

See original project license.
