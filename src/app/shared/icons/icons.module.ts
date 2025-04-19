import { NgModule } from '@angular/core';
import { FeatherModule } from 'angular-feather';
import { 
  User, File, Activity, Heart, Mail, Home, 
  Calendar, Settings, Grid, Clock, List,
  Users, Briefcase, PieChart, DollarSign,
  FileText, Layers, MapPin, Monitor, Clipboard,
  Book, Award, Star, Send, Database, Bell
} from 'angular-feather/icons';

const icons = {
  User, File, Activity, Heart, Mail, Home,
  Calendar, Settings, Grid, Clock, List,
  Users, Briefcase, PieChart, DollarSign,
  FileText, Layers, MapPin, Monitor, Clipboard,
  Book, Award, Star, Send, Database, Bell
};

@NgModule({
  imports: [
    FeatherModule.pick(icons)
  ],
  exports: [
    FeatherModule
  ]
})
export class IconsModule { }
