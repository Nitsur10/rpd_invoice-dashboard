# 🏢 RPD Invoice Dashboard

A professional invoice management system built for Rudra Projects and Development (RPD) with real-time data processing, advanced filtering, and seamless source system integration.

## 🌟 Features

- 📊 **Real Invoice Data** - Displays actual invoices from May 1st, 2025 onwards
- 🔗 **Clickable Invoice Links** - Direct access to Xero and vendor portals  
- 🎨 **Professional RPD Branding** - Navy blue and gold corporate theme
- 🔍 **Advanced Search & Filtering** - Filter by date, vendor, status, category
- 📤 **CSV Export** - Export filtered invoice data
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ⚡ **Fast Performance** - Built with Next.js 15 and Turbopack

## 🚀 Quick Start

### Option 1: Automated Setup
```bash
./setup-dashboard.sh
npm run dev
```

### Option 2: Manual Setup
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 📊 Dashboard Overview

### Main Pages:
- **Dashboard** (`/`) - Overview statistics and quick actions
- **Invoice Management** (`/invoices`) - Complete invoice table with filtering
- **Kanban View** (`/kanban`) - Visual workflow management

### Key Statistics:
- **Total Invoices:** 10 real invoices
- **Total Amount:** $53,786.01 AUD
- **Date Range:** May 1st, 2025 onwards
- **Vendors:** 10 unique Australian vendors
- **Categories:** Construction, Utilities, Materials, Professional Services

## 🎯 Core Functionality

### Invoice Management:
- View all invoices in a sortable, filterable table
- Click "View" to open invoice in source system
- Search by vendor name, invoice number, or description
- Filter by status (Pending/Paid/Overdue) and category
- Export filtered results to CSV

### Date Filtering:
- Custom date range selection
- Default view from May 1st, 2025
- Real-time filtering with Australian date format

### Responsive Design:
- Optimized for all screen sizes
- Mobile-friendly table interactions
- Touch-friendly controls

## 🔧 Technical Details

### Built With:
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Modern utility-first CSS
- **shadcn/ui** - High-quality React components
- **TanStack Table** - Advanced table functionality

### Performance:
- **Turbopack** for fast development builds
- **OKLCH color space** for consistent theming
- **Optimized images** and fonts
- **Error boundaries** for reliability

## 📁 Project Structure

```
invoice-dashboard/
├── src/
│   ├── app/                 # Next.js pages and layouts
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utilities and data
│   └── fonts/               # Custom fonts
├── DEPLOYMENT_PACKAGE.md    # Complete documentation
├── setup-dashboard.sh       # Automated setup script
└── README.md               # This file
```

## 🔗 External Integrations

### Supported Invoice Sources:
- **Xero** - Direct invoice view links
- **TasWater** - Utility billing portal
- **Vendor Portals** - BuildMart, Elite Electrical, etc.
- **Email Processing** - Automated invoice extraction

## 📈 Data Management

### Real Invoice Data:
- Sourced from production email processing
- Deduplication by invoice number, amount, vendor
- Australian currency formatting (AUD)
- Local date formatting (en-AU)

### No Mock Data:
- All sample/test data removed
- Production-ready invoice information
- Validated data structure

## 🎨 RPD Branding

### Color Scheme:
- **Primary Navy:** #12233C (oklch(0.25 0.08 240))
- **Accent Gold:** #BC9950 (oklch(0.65 0.12 80))
- **Professional gradients and shadows**
- **Light and dark theme support**

## 🛠 Development

### Available Scripts:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

### Environment:
- Node.js 18+
- No environment variables required
- Ready to run out of the box

## 📞 Support

### Browser Support:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Accessibility:
- WCAG 2.1 compliant
- Keyboard navigation
- Screen reader support
- High contrast mode

## 📄 License

Built for Rudra Projects and Development (RPD)

---

**Live Dashboard:** http://localhost:3000  
**Invoice Management:** http://localhost:3000/invoices

*For complete documentation, see [DEPLOYMENT_PACKAGE.md](./DEPLOYMENT_PACKAGE.md)*
# Force deployment trigger
