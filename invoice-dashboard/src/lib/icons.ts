// Optimized icon imports to reduce bundle size
// Only import icons that are actually used

// Core icons used across the dashboard
import { 
  ChevronDown,
  ChevronLeft, 
  ChevronRight,
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  Settings,
  Users,
  DollarSign,
  Calendar,
  Building,
  ExternalLink,
  ArrowUpRight,
  TrendingUp,
  Activity,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Eye,
  X
} from 'lucide-react';

// Create a centralized icon registry to avoid duplicate imports
export const Icons = {
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  search: Search,
  filter: Filter,
  download: Download,
  plus: Plus,
  moreHorizontal: MoreHorizontal,
  settings: Settings,
  users: Users,
  dollarSign: DollarSign,
  calendar: Calendar,
  building: Building,
  externalLink: ExternalLink,
  arrowUpRight: ArrowUpRight,
  trendingUp: TrendingUp,
  activity: Activity,
  creditCard: CreditCard,
  checkCircle: CheckCircle,
  alertTriangle: AlertTriangle,
  clock: Clock,
  fileText: FileText,
  eye: Eye,
  x: X
} as const;

export type IconName = keyof typeof Icons;