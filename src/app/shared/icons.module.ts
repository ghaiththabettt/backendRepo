import { NgModule } from '@angular/core';
import { FeatherModule } from 'angular-feather';
import { 
  Edit,
  User,
  Mail,
  Lock,
  Home,
  PieChart,
  Users,
  Settings,
  FileText,
  Bell,
  Calendar,
  MessageSquare,
  Heart,
  Delete,
  MoreVertical,
  Plus,
  CheckCircle,
  XCircle,
  Info,
  Star,
  Download,
  Upload,
  Printer,
  Search,
  ChevronDown,
  Menu,
  LogOut,
  Trash2
} from 'angular-feather/icons';

const icons = {
  Edit,
  User,
  Mail,
  Lock,
  Home,
  PieChart,
  Users,
  Settings,
  FileText,
  Bell,
  Calendar,
  MessageSquare,
  Heart,
  Delete,
  MoreVertical,
  Plus,
  CheckCircle,
  XCircle,
  Info,
  Star,
  Download,
  Upload,
  Printer,
  Search,
  ChevronDown,
  Menu,
  LogOut,
  Trash2
};

@NgModule({
  imports: [FeatherModule.pick(icons)],
  exports: [FeatherModule]
})
export class IconsModule { }
