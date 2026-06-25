# Resume Builder Project Proposal

## Project Overview
This project aims to build a modern, efficient, and privacy-focused resume builder website, inspired by "Muji Resume" and "LaoYu Resume". The core philosophy is to separate content from presentation, allowing users to focus on writing their resume in Markdown while the system handles the beautiful layout and export.

## Core Features

### 1. Markdown-Based Editing
- **Split-Screen Interface**: Left side for Markdown editing, right side for real-time preview.
- **Syntax Highlighting**: Easy-to-read Markdown syntax.
- **Snippets/Toolbar**: Quick insertion of common resume sections (Education, Experience, Skills).

### 2. Real-Time Preview & Themes
- **Live Rendering**: Changes in the editor are immediately reflected in the preview.
- **Multiple Themes**:
  - **Classic Professional**: Clean, traditional layout suitable for corporate jobs.
  - **Modern Creative**: Two-column layout with colors, suitable for design/tech roles.
  - **Academic/Minimalist**: Text-heavy, simple layout.
- **Customization**:
  - Adjust font sizes, margins, and line heights.
  - Theme color picker.

### 3. Privacy & Export
- **Local-First**: All data is stored in the user's browser (LocalStorage) by default. No login required to start.
- **PDF Export**: High-quality A4 PDF export using browser print capabilities or a dedicated library.
- **Markdown Import/Export**: Users can save their raw data.

### 4. AI Assistance (Future Phase)
- **Content Polishing**: AI suggestions for improving bullet points (integration with Gemini/OpenAI APIs).
- **Auto-Summary**: Generate a professional summary based on experience.

## Technology Stack
- **Framework**: Next.js (React) - for SEO and performance.
- **Styling**: Tailwind CSS - for rapid, beautiful UI development.
- **State Management**: React Context / Zustand.
- **Markdown Engine**: `react-markdown` or `markdown-to-jsx`.
- **Icons**: Lucide React.
- **Deployment**: Vercel (easy deployment).

## Development Phases

### Phase 1: MVP (Minimum Viable Product)
- Basic split-screen editor.
- Markdown parsing and rendering.
- One default professional theme.
- PDF Export.

### Phase 2: Enhancements
- Multiple themes.
- LocalStorage persistence (auto-save).
- UI Polish (Landing page, animations).

### Phase 3: Advanced Features
- AI integration.
- User accounts (optional).

## Next Steps
Please review this proposal. Once approved, I will proceed to:
1.  Initialize the Next.js project.
2.  Set up the basic editor and preview structure.
3.  Implement the first theme and export functionality.
