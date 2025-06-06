# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

stream.new is a Next.js video sharing platform that allows users to upload, record, and share videos. It integrates with Mux for video infrastructure and includes content moderation capabilities.

## Development Commands

```bash
yarn dev        # Start development server (http://localhost:3000)
yarn build      # Run linting and build for production
yarn test       # Run Jest tests
yarn test:coverage    # Run tests with coverage report
yarn test:watch       # Run tests in watch mode
yarn coverage:open    # Open coverage report in browser
yarn lint       # Run ESLint
yarn tsc        # Run TypeScript type checking
```

## Architecture

### Core Structure
- **Framework**: Next.js 12 with Pages Router
- **Language**: TypeScript/JavaScript
- **Video Infrastructure**: Mux (upload, streaming, analytics)
- **Content Moderation**: Google Vision API and Hive AI integration

### Key Directories
- `/pages` - Next.js routes and API endpoints
- `/components` - React components with tests
- `/lib` - Business logic, integrations, and utilities
- `/types` - TypeScript type definitions

### API Routes
- `/api/uploads` - Handle video uploads
- `/api/assets/[id]` - Asset management
- `/api/webhooks/mux` - Mux webhook handler
- `/api/report` - Content reporting
- `/api/telemetry` - Analytics tracking

### Video Flow
1. **Upload**: Direct upload to Mux via drag-drop or file selection
2. **Recording**: WebRTC-based camera/screen recording
3. **Processing**: Mux handles transcoding and optimization
4. **Playback**: Multiple player options (Mux Player, Plyr, custom Winamp theme)
5. **Moderation**: Automatic content analysis with Slack notifications

### Environment Variables
Required for full functionality:
- `MUX_TOKEN_ID` and `MUX_TOKEN_SECRET` - Mux API authentication
- `MUX_WEBHOOK_SIGNATURE_SECRET` - Webhook verification
- `SLACK_WEBHOOK_ASSET_READY` - Slack notifications
- `GOOGLE_APPLICATION_CREDENTIALS` - Google Vision API (base64 encoded)
- `HIVE_AI_KEY` - Hive AI moderation
- `NEXT_PUBLIC_MUX_ENV_KEY` - Mux Data analytics

## Testing Considerations

When testing video features, use these test videos for different aspect ratios:
- Horizontal: `/v/Hi6we01h00uVvZc00GzvVXZW8C02Y8QC8OX7`
- Vertical: `/v/UNDUU7tU7vYt02CRMDTlZd1qKjvk41LN6yI5LbHgtxo8`
- Super vertical: `/v/seK501Bf00kyqSnGdMwQFi3lgqgdoS00qm5PAiV7Yjf2ew`

Test across Safari, Mobile Safari, Chrome, and Firefox for browser compatibility.

## Key Integration Points

### Mux Integration
- Direct uploads using `@mux/upchunk`
- Player components: `@mux/mux-player-react` and `@mux/mux-video-react`
- Webhook handling for asset state changes
- Mux Data for quality metrics

### Moderation System
- Webhook triggers analysis when assets are ready
- Google Vision API analyzes video frames
- Hive AI provides additional content classification
- Results posted to Slack with moderation scores
- Admin actions available via password-protected endpoints

## Testing & Coverage

### Test Suite
- **Comprehensive Coverage**: API routes, React components, utilities
- **Real-world Scenarios**: File uploads, video processing, moderation workflows
- **Mocking Infrastructure**: Mux SDK, Google Vision, media APIs
- **Coverage Thresholds**: 80% lines, 75% functions, 70% branches minimum

### Running Tests
```bash
yarn test                 # Run all tests
yarn test:coverage        # Generate coverage report
yarn test:watch          # Watch mode for development
yarn coverage:open       # View HTML coverage report
```

### Coverage Requirements
- Global minimum: 80% line coverage
- Critical modules (moderation): 90% coverage
- API routes: 85% coverage
- New code should aim for >90% coverage